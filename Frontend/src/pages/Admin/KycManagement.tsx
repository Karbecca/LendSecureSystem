import { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    Eye,
    Search,
    FileText,
    Shield
} from "lucide-react";
import api from "../../services/api";
import { cn } from "../../lib/utils";
import Modal from "../../components/ui/Modal";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import { Button } from "../../components/ui/Button";

interface KycDocument {
    documentId: string;
    userId: string;
    documentType: string;
    documentNumber: string;
    filePath: string;
    status: "Pending" | "Approved" | "Rejected";
    uploadedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function KycManagement() {
    const [documents, setDocuments] = useState<KycDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedDoc, setSelectedDoc] = useState<KycDocument | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const data = await api.getAllKycDocuments();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const initiateAction = (doc: KycDocument, type: "approve" | "reject") => {
        setSelectedDoc(doc);
        setActionType(type);
        setIsConfirmOpen(true);
    };

    const executeAction = async () => {
        if (!selectedDoc || !actionType) return;

        try {
            setIsProcessing(true);
            if (actionType === "approve") {
                await api.approveKycDocument(selectedDoc.documentId);
                setDocuments(docs => docs.map(d =>
                    d.documentId === selectedDoc.documentId ? { ...d, status: "Approved" } : d
                ));
            } else {
                await api.rejectKycDocument(selectedDoc.documentId);
                setDocuments(docs => docs.map(d =>
                    d.documentId === selectedDoc.documentId ? { ...d, status: "Rejected" } : d
                ));
            }
            setIsConfirmOpen(false);
            if (isViewOpen) setIsViewOpen(false);
            setSelectedDoc(null);
            setActionType(null);
        } catch (error) {
            console.error(`Failed to ${actionType} document:`, error);
            alert(`Failed to ${actionType} document`);
        } finally {
            setIsProcessing(false);
        }
    };

    const openDocumentHelper = (doc: KycDocument) => {
        setSelectedDoc(doc);
        setIsViewOpen(true);
    };

    const filteredDocs = documents.filter(doc => {
        const matchesFilter = filter === "all" || (doc.status?.toLowerCase() || "") === filter;
        const matchesSearch =
            (doc.documentNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (doc.user?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (doc.user?.firstName?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-700 border-green-200";
            case "Rejected": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-amber-100 text-amber-700 border-amber-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">KYC Verification</h1>
                    <p className="text-slate-500 text-sm">Review and manage user identification documents.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search user or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Number</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded At</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Loading documents...
                                    </td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No documents found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.documentId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {doc.user?.firstName?.[0] || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {doc.user?.firstName} {doc.user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{doc.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {doc.documentType}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                            {doc.documentNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-bold border",
                                                getStatusColor(doc.status)
                                            )}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDocumentHelper(doc)}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="View Document"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {doc.status === "Pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => initiateAction(doc, "approve")}
                                                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => initiateAction(doc, "reject")}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeAction}
                title={actionType === "approve" ? "Approve Document" : "Reject Document"}
                message={`Are you sure you want to ${actionType} this KYC document? This action cannot be undone.`}
                confirmLabel={actionType === "approve" ? "Yes, Approve" : "Yes, Reject"}
                type={actionType === "approve" ? "success" : "danger"}
                isLoading={isProcessing}
            />

            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="KYC Document Details"
                size="lg"
            >
                {selectedDoc && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                                    {selectedDoc.user?.firstName?.[0] || "U"}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {selectedDoc.user?.firstName} {selectedDoc.user?.lastName}
                                    </h3>
                                    <p className="text-sm text-slate-500">{selectedDoc.user?.email}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-sm font-bold border",
                                getStatusColor(selectedDoc.status)
                            )}>
                                {selectedDoc.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">Type</span>
                                </div>
                                <p className="font-medium text-slate-900">{selectedDoc.documentType}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">Number</span>
                                </div>
                                <p className="font-medium text-slate-900 font-mono">{selectedDoc.documentNumber}</p>
                            </div>
                        </div>

                        <div className="border rounded-lg border-slate-200 overflow-hidden bg-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                            <div className="text-center p-8">
                                <div className="mx-auto w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                </div>
                                <h4 className="text-slate-900 font-medium mb-1">Document Preview</h4>
                                <p className="text-slate-500 text-sm mb-4">File path: {selectedDoc.filePath}</p>
                                <Button variant="outline" className="text-xs">Download File</Button>
                            </div>
                        </div>

                        {selectedDoc.status === "Pending" && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => initiateAction(selectedDoc, "reject")}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => initiateAction(selectedDoc, "approve")}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Approve Document
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
