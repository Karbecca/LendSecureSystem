import { motion } from "framer-motion";
import { TrendingUp, Info } from "lucide-react";

interface CreditScoreCardProps {
    score: number;
}

export function CreditScoreCard({ score }: CreditScoreCardProps) {
    // Determine color and status based on score
    let color = "text-red-500";
    let bgColor = "bg-red-50";
    let status = "Needs Improvement";
    let progressColor = "#EF4444"; // red-500

    if (score >= 700) {
        color = "text-emerald-500";
        bgColor = "bg-emerald-50";
        status = "Excellent";
        progressColor = "#10B981"; // emerald-500
    } else if (score >= 600) {
        color = "text-blue-500";
        bgColor = "bg-blue-50";
        status = "Good";
        progressColor = "#3B82F6"; // blue-500
    } else if (score >= 500) {
        color = "text-amber-500";
        bgColor = "bg-amber-50";
        status = "Fair";
        progressColor = "#F59E0B"; // amber-500
    }

    // Calculate percentage for progress bar (simplified 300-850 range)
    // 300 is 0%, 850 is 100%
    const percentage = Math.min(100, Math.max(0, ((score - 300) / (850 - 300)) * 100));

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <TrendingUp className={`h-6 w-6 ${color}`} />
                </div>
                <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                    <div className="absolute top-6 right-0 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        Scores range from 300 to 850. Higher scores unlock better loan terms and interest rates.
                        <div className="mt-2 text-slate-300">
                            Updates: +10 (On-time), -20 (Late)
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Credit Score</p>

            <div className="flex items-end gap-3 mb-4">
                <h3 className={`text-4xl font-bold ${color}`}>
                    {score}
                </h3>
                <span className={`text-sm font-semibold mb-1 ${color} bg-white px-2 py-0.5 rounded-full border border-current opacity-80`}>
                    {status}
                </span>
            </div>

            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ backgroundColor: progressColor }}
                />
            </div>

            <div className="flex justify-between mt-2 text-xs text-slate-400 font-mono">
                <span>300</span>
                <span>850</span>
            </div>
        </div>
    );
}
