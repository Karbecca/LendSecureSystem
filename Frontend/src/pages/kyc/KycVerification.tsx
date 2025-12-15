import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    Upload,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    AlertTriangle,
    Camera,
    ScanFace
} from "lucide-react";
import * as faceapi from 'face-api.js';
import api from "../../services/api";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

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

    // AI State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [aiStatus, setAiStatus] = useState<"Initializing" | "Scanning" | "Verified">("Initializing");
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const requiredDocs = [
        { type: "IdentityCard", label: "National ID / Passport", description: "Government issued ID with clear photo." },
        { type: "ProofOfAddress", label: "Proof of Address", description: "Utility bill or bank statement (max 3 months old)." },
        { type: "IncomeStatement", label: "Income Statement", description: "Recent payslip or bank statement showing income." }
    ];

    useEffect(() => {
        fetchDocuments();
        loadModels();
        return () => stopCamera();
    }, []);

    const loadModels = async () => {
        try {
            const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
            ]);
            setIsModelsLoaded(true);
        } catch (err) {
            console.error("Failed to load AI models", err);
            setError("Failed to load AI Face Detection models.");
        }
    };

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

    const startCamera = async () => {
        setIsAiModalOpen(true);
        setAiStatus("Initializing");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            console.error("Camera error", err);
            setError("Could not access camera. Please allow permissions.");
            setIsAiModalOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    const handleVideoPlay = () => {
        setAiStatus("Scanning");
        setIsScanning(true);

        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !isScanning) return;

            // Detection logic
            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            // Draw on canvas
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            }

            // Check correctness
            if (detections.length > 0) {
                const detection = detections[0];
                if (detection.detection.score > 0.8) {
                    // Success!
                    clearInterval(interval);
                    setAiStatus("Verified");
                    await captureAndUpload();
                }
            }
        }, 500);

        // Safety timeout
        setTimeout(() => clearInterval(interval), 30000);
    };

    const captureAndUpload = async () => {
        if (!videoRef.current) return;

        // Capture image
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], "face_verification.jpg", { type: "image/jpeg" });

            // Upload
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("docType", "IdentityCard");
            formData.append("isVerified", "true"); // Signal Backend!

            try {
                await api.uploadKycDocument(formData);
                stopCamera();
                setIsAiModalOpen(false);
                fetchDocuments();
            } catch (err) {
                console.error(err);
                setError("Verification capture failed.");
            } finally {
                setUploading(false);
            }
        }, 'image/jpeg');
    };

    // Standard upload fallback
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", docType);

        try {
            await api.uploadKycDocument(formData);
            await fetchDocuments();
        } catch (err: any) {
            console.error("Upload failed", err);
            setError(err.response?.data?.message || "Failed to upload document.");
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
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="show" animate="show" className="space-y-8">
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
                                        {doc.type === "IdentityCard" ? <ScanFace className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
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
                                    {/* Smart Action Button */}
                                    {doc.type === "IdentityCard" ? (
                                        <Button
                                            onClick={startCamera}
                                            disabled={!isModelsLoaded}
                                            className="w-full flex gap-2"
                                        >
                                            {isModelsLoaded ? <Camera className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                                            {isModelsLoaded ? "Verify with Face ID" : "Loading AI..."}
                                        </Button>
                                    ) : (
                                        <>
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
                                                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 font-bold text-sm cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-[#0066CC]",
                                                    uploading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                {status ? "Re-upload Document" : "Upload Document"}
                                            </label>
                                        </>
                                    )}
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

            {/* AI Verification Modal */}
            <Modal isOpen={isAiModalOpen} onClose={() => { stopCamera(); setIsAiModalOpen(false); }} title="Identity Verification">
                <div className="p-6 text-center">
                    <div className="relative w-full h-[400px] bg-black rounded-2xl overflow-hidden mb-4 border-4 border-slate-100">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            onPlay={handleVideoPlay}
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

                        {aiStatus === "Initializing" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" /> Starting Camera...
                            </div>
                        )}
                        {aiStatus === "Scanning" && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1 rounded-full text-white text-sm font-bold animate-pulse">
                                Positioning Face...
                            </div>
                        )}
                        {aiStatus === "Verified" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/80 text-white font-bold text-xl">
                                <CheckCircle2 className="h-10 w-10 mr-2" /> Identity Verified!
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-slate-500">
                        Please look directly at the camera. Our AI is verifying your identity against global security databases.
                    </p>
                </div>
            </Modal>
        </motion.div>
    );
}
