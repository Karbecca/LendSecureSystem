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
    ScanFace,
    AlertCircle
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
    const [aiStatus, setAiStatus] = useState<"Initializing" | "Scanning" | "Verifying" | "Verified" | "Failed">("Initializing");
    const [scanMessage, setScanMessage] = useState("Position your face in the center");

    // Face Descriptors
    const [idCardDescriptor, setIdCardDescriptor] = useState<Float32Array | null>(null);
    const [webcamDescriptor, setWebcamDescriptor] = useState<Float32Array | null>(null);
    const [pendingIdFile, setPendingIdFile] = useState<File | null>(null); // Store ID until selfie match

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const requiredDocs = [
        { type: "IdentityCard", label: "National ID / Passport", description: "Government issued ID. Must contain a clear photo." },
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
            console.log("AI Models Loaded");
        } catch (err) {
            console.error("Failed to load AI models", err);
            setError("Failed to load AI Face Detection models. Refresh page.");
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

    // --- STEP 1: Process ID Card Image ---
    const handleIdCardSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!isModelsLoaded) {
            setError("AI Models not ready. Please wait a moment.");
            return;
        }

        setError(null);
        setScanMessage("Analyzing ID Card photo...");
        setPendingIdFile(file);

        try {
            // Convert File to HTMLImageElement for face-api
            const img = await faceapi.bufferToImage(file);

            // Detect Face in ID
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                setError("No face detected in the ID card photo. Please upload a clearer image.");
                setPendingIdFile(null);
                return;
            }

            // Success: Store Descriptor & Prompt for Selfie
            setIdCardDescriptor(detection.descriptor);
            startCamera(); // Launch Camera immediately for Comparison
        } catch (err) {
            console.error(err);
            setError("Failed to analyze ID card image.");
            setPendingIdFile(null);
        }
    };

    const startCamera = async () => {
        setIsAiModalOpen(true);
        setAiStatus("Initializing");
        setWebcamDescriptor(null);
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
            if (!videoRef.current || !canvasRef.current || !isScanning || !idCardDescriptor) return;

            // Detect Face in Webcam
            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            // Draw on canvas for feedback
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            if (detection) {
                const resizedDetections = faceapi.resizeResults(detection, displaySize);
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                }

                // --- CORE LOGIC: EUCLIDEAN DISTANCE MATCH ---
                const distance = faceapi.euclideanDistance(idCardDescriptor, detection.descriptor);
                console.log("Face Match Distance:", distance); // Debugging

                if (distance < 0.6) { // Threshold: < 0.6 is a match
                    clearInterval(interval);
                    setAiStatus("Verified");
                    setScanMessage(`Identity Verified! Match Score: ${((1 - distance) * 100).toFixed(0)}%`);

                    // Proceed to Upload
                    await uploadVerifiedDoc();
                } else {
                    setScanMessage("Face does not match ID card. Try again.");
                }
            } else {
                setScanMessage("No face visible. Look at camera.");
                const ctx = canvasRef.current.getContext('2d');
                ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }

        }, 500);

        // Safety timeout
        setTimeout(() => {
            if (isScanning) {
                clearInterval(interval);
                if (aiStatus !== "Verified") {
                    setAiStatus("Failed");
                    setScanMessage("Verification Timeout. Face did not match.");
                    setIsScanning(false);
                }
            }
        }, 30000);
    };

    const uploadVerifiedDoc = async () => {
        if (!pendingIdFile) return;

        setUploading(true);
        // Create FormData
        const formData = new FormData();
        formData.append("file", pendingIdFile);
        formData.append("docType", "IdentityCard");
        formData.append("isVerified", "true"); // Proven by Euclidean Match

        try {
            await api.uploadKycDocument(formData);

            // Add slight delay for UX
            setTimeout(() => {
                stopCamera();
                setIsAiModalOpen(false);
                setPendingIdFile(null);
                setIdCardDescriptor(null);
                fetchDocuments();
            }, 1500);

        } catch (err) {
            console.error(err);
            setError("Verification passed, but upload failed.");
        } finally {
            setUploading(false);
        }
    };

    // Standard upload for non-ID docs
    const handleStandardUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", docType);

        try {
            await api.uploadKycDocument(formData);
            await fetchDocuments();
        } catch (err: any) {
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

            {!isModelsLoaded && (
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg flex items-center text-sm">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Initializing AI Neural Networks...
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
                                {status && (
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-bold border",
                                        status.status === 'Approved' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                            status.status === 'Rejected' ? "bg-red-50 border-red-100 text-red-700" :
                                                "bg-amber-50 border-amber-100 text-amber-700"
                                    )}>
                                        {status.status}
                                    </span>
                                )}
                            </div>

                            {(!status || status.status === 'Rejected' || status.status === 'Pending') && (
                                <div className="mt-4">
                                    <input
                                        type="file"
                                        id={`upload-${doc.type}`}
                                        className="hidden"
                                        accept="image/*" // Restrict to images for AI
                                        onChange={(e) => {
                                            if (doc.type === "IdentityCard") handleIdCardSelected(e);
                                            else handleStandardUpload(e, doc.type);
                                        }}
                                        disabled={uploading || (!isModelsLoaded && doc.type === "IdentityCard")}
                                    />
                                    <label
                                        htmlFor={`upload-${doc.type}`}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 font-bold text-sm cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-[#0066CC]",
                                            (uploading || (!isModelsLoaded && doc.type === "IdentityCard")) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                            doc.type === "IdentityCard" ? <ScanFace className="h-4 w-4" /> : <Upload className="h-4 w-4" />}

                                        {doc.type === "IdentityCard" ? "Verify with Face ID (AI)" : "Upload Document"}
                                    </label>

                                    {doc.type === "IdentityCard" && (
                                        <p className="text-[10px] text-slate-400 text-center mt-2">
                                            AI will compare photo ID with live selfie.
                                        </p>
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
            <Modal isOpen={isAiModalOpen} onClose={() => { stopCamera(); setIsAiModalOpen(false); }} title="Identity Match Verification">
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

                        <div className="absolute top-4 left-0 right-0 flex justify-center">
                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2">
                                {aiStatus === "Initializing" && <Loader2 className="h-4 w-4 animate-spin" />}
                                {aiStatus === "Verified" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                                {aiStatus === "Failed" && <AlertCircle className="h-4 w-4 text-red-400" />}
                                {scanMessage}
                            </div>
                        </div>

                        {aiStatus === "Verified" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/90 text-white font-bold text-xl backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                                <div className="text-center">
                                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
                                    Identity Verified!
                                    <p className="text-sm font-normal opacity-80 mt-2">Uploading Secure Document...</p>
                                </div>
                            </div>
                        )}

                        {aiStatus === "Failed" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/90 text-white font-bold text-xl backdrop-blur-sm">
                                <div className="text-center">
                                    <XCircle className="h-16 w-16 mx-auto mb-4" />
                                    Verification Failed
                                    <p className="text-sm font-normal opacity-80 mt-2">Face did not match ID card.</p>
                                    <Button onClick={() => { setIsAiModalOpen(false); setScanMessage(""); }} className="mt-4 bg-white text-red-600 hover:bg-white/90">
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        We are comparing your live face with the photo in your ID card using <span className="font-bold text-slate-700">Euclidean Distance Analysis</span> (Threshold &lt; 0.6).
                    </p>
                </div>
            </Modal>
        </motion.div>
    );
}
