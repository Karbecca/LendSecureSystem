import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Upload,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    AlertTriangle
} from "lucide-react";
import api from "../../services/api";
import { cn } from "../../lib/utils";

interface KycDocument {
    docId: string;
    docType: string;
    filePath: string;
    status: "Pending" | "Approved" | "Rejected";
    uploadedAt?: string;
}

export default function KycVerification() {
    const [documents, setDocuments] = useState<KycDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requiredDocs = [
        { type: "IdentityCard", label: "National ID / Passport", description: "Government issued ID with clear photo." },
        { type: "ProofOfAddress", label: "Proof of Address", description: "Utility bill or bank statement (max 3 months old)." },
        { type: "IncomeStatement", label: "Income Statement", description: "Recent payslip or bank statement showing income." }
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.getMyKycDocuments();
            const data = Array.isArray(response) ? response : response.data.data || response.data || [];
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch KYC documents", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", docType); // Changed from 'documentType' to 'docType' to match DTO if needed, assuming backend expects 'DocType' key in FormData? 
        // Checking KycUploadRequestDto: public string DocType { get; set; } => yes 'DocType' or 'docType' usually works. 
        // Wait, FormData keys usually case-sensitive? ASP.NET Binding is case-insensitive usually.
        // Let's use 'DocType' to be safe or 'docType'. RequestLoan used camelCase.

        try {
            await api.uploadKycDocument(formData);
            await fetchDocuments(); // Refresh list
        } catch (err: any) {
            console.error("Upload failed", err);
            setError(err.response?.data?.message || "Failed to upload document. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const getDocStatus = (type: string) => {
        return documents.find(d => d.docType === type);
    };

    const overallStatus = documents.some(d => d.status === "Approved") && documents.length >= requiredDocs.length
        ? "Verified"
        : documents.some(d => d.status === "Rejected")
            ? "Rejected"
            : "Pending";

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="show"
            animate="show"
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">KYC Verification</h1>
                    <p className="text-slate-500 text-sm mt-1">Verify your identity to increase loan limits and trust score.</p>
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm",
                    overallStatus === "Verified" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                        overallStatus === "Rejected" ? "bg-red-50 border-red-100 text-red-700" :
                            "bg-amber-50 border-amber-100 text-amber-700"
                )}>
                    {overallStatus === "Verified" ? <CheckCircle2 className="h-4 w-4" /> :
                        overallStatus === "Rejected" ? <XCircle className="h-4 w-4" /> :
                            <Clock className="h-4 w-4" />}
                    Status: {overallStatus}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm border border-red-100">
                    <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requiredDocs.map((doc) => {
                    const status = getDocStatus(doc.type);
                    return (
                        <motion.div
                            key={doc.type}
                            variants={item}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 p-3 rounded-xl text-slate-500">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{doc.label}</h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">{doc.description}</p>
                                    </div>
                                </div>
                                {status ? (
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-bold border",
                                        status.status === 'Approved' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                            status.status === 'Rejected' ? "bg-red-50 border-red-100 text-red-700" :
                                                "bg-amber-50 border-amber-100 text-amber-700"
                                    )}>
                                        {status.status}
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs font-bold">
                                        Not Uploaded
                                    </span>
                                )}
                            </div>

                            {status?.status === 'Rejected' && (
                                <div className="bg-red-50 p-3 rounded-lg text-xs text-red-600 mb-4 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    Reason: Document rejected. Please re-upload clearer copy.
                                </div>
                            )}

                            {(!status || status.status === 'Rejected' || status.status === 'Pending') && (
                                <div className="mt-4">
                                    <input
                                        type="file"
                                        id={`upload-${doc.type}`}
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileUpload(e, doc.type)}
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor={`upload-${doc.type}`}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 font-bold text-sm cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-primary",
                                            uploading && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        {status ? "Re-upload Document" : "Upload Document"}
                                    </label>
                                </div>
                            )}

                            {status && status.status === 'Approved' && (
                                <div className="mt-4 w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-100">
                                    <CheckCircle2 className="h-4 w-4" /> Verified
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
