import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning",
    isLoading = false
}: ConfirmModalProps) {
    const variantStyles = {
        danger: {
            icon: "bg-red-50 text-red-600",
            button: "bg-red-600 hover:bg-red-700"
        },
        warning: {
            icon: "bg-amber-50 text-amber-600",
            button: "bg-amber-600 hover:bg-amber-700"
        },
        info: {
            icon: "bg-indigo-50 text-indigo-600",
            button: "bg-indigo-600 hover:bg-indigo-700"
        }
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${styles.icon}`}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                        <p className="text-slate-600 mb-6">{message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${styles.button}`}
                            >
                                {isLoading ? "Processing..." : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
