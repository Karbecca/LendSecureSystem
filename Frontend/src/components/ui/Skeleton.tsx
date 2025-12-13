import { cn } from "../../lib/utils";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "card";
    width?: string | number;
    height?: string | number;
    count?: number;
}

export function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
    count = 1
}: SkeletonProps) {
    const baseClasses = "animate-pulse bg-slate-200 rounded";

    const variantClasses = {
        text: "h-4 w-full rounded",
        circular: "rounded-full",
        rectangular: "rounded-lg",
        card: "rounded-2xl"
    };

    const style = {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
    };

    if (count > 1) {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(baseClasses, variantClasses[variant], className)}
                        style={style}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
        />
    );
}

// Preset skeleton components
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Skeleton variant="text" width="60%" className="mb-4" />
            <Skeleton variant="text" width="40%" className="mb-6" />
            <Skeleton variant="rectangular" height={100} />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <Skeleton variant="text" width="30%" height={24} />
            </div>
            <div className="divide-y divide-slate-100">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-6 flex items-center gap-4">
                        <Skeleton variant="circular" width={40} height={40} />
                        <div className="flex-1 space-y-2">
                            <Skeleton variant="text" width="70%" />
                            <Skeleton variant="text" width="40%" />
                        </div>
                        <Skeleton variant="rectangular" width={100} height={32} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonStat() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="50%" />
            </div>
            <Skeleton variant="text" width="40%" height={32} />
        </div>
    );
}
