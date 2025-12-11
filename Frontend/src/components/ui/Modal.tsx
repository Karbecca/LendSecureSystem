import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    size?: "sm" | "md" | "lg" | "xl"
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
}: ModalProps) {
    if (!isOpen) return null

    // Close on Escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [onClose])

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                className={cn(
                    "relative w-full transform rounded-xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200",
                    sizes[size]
                )}
            >
                {/* Header */}
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <div className="flex items-center justify-between">
                        {title && <h2 className="text-xl font-semibold leading-none tracking-tight text-primary">{title}</h2>}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-4 top-4 h-8 w-8 p-0 rounded-full"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>

                    {description && (
                        <p className="text-sm text-text-secondary">
                            {description}
                        </p>
                    )}
                </div>

                {/* content */}
                <div className="mb-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
