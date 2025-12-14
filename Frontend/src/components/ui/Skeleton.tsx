import { cn } from "../../lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export { Skeleton }

export function SkeletonStat() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-32" />
        </div>
    )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="p-6 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-24" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    )
}
