import { useEffect, useState } from "react";
import {
    Loader2,
    DollarSign,
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";

interface Repayment {
    repaymentId: string;
    loanId: string;
    scheduledDate: string;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    status: string;
    paidAt: string | null;
}

export default function LenderRepayments() {
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getLenderRepayments();
                setRepayments(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch repayments", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const paidRepayments = repayments.filter(r => r.status === "Paid");
    const pendingRepayments = repayments.filter(r => r.status === "Pending");
    const totalEarned = paidRepayments.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalPending = pendingRepayments.reduce((sum, r) => sum + r.totalAmount, 0);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2.5 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Earned</p>
                            <h3 className="text-xl font-bold text-indigo-600">{formatCurrency(totalEarned)}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-50 p-2.5 rounded-xl">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pending Returns</p>
                            <h3 className="text-xl font-bold text-amber-600">{formatCurrency(totalPending)}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Paid Repayments</p>
                            <h3 className="text-xl font-bold text-slate-800">{paidRepayments.length}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-50 p-2.5 rounded-xl">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pending Repayments</p>
                            <h3 className="text-xl font-bold text-slate-800">{pendingRepayments.length}</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Repayments Table */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Repayment Schedule</h2>
                    <p className="text-slate-500 text-sm mt-1">Track your returns from funded loans</p>
                </div>

                {repayments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Repayments Yet</h3>
                        <p className="text-slate-500 text-sm mb-4">Fund some loans to start receiving repayments.</p>
                        <Link to="/lender/loans" className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors">
                            Browse Loans <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-muted/50 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Loan ID</th>
                                    <th className="px-6 py-4">Principal</th>
                                    <th className="px-6 py-4">Interest</th>
                                    <th className="px-6 py-4">Total Return</th>
                                    <th className="px-6 py-4">Scheduled Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {repayments.map((repayment) => (
                                    <tr key={repayment.repaymentId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            #{repayment.loanId?.substring(0, 8) || 'N/A'}...
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatCurrency(repayment.principalAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-indigo-600 font-medium">
                                            +{formatCurrency(repayment.interestAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-800">
                                                {formatCurrency(repayment.totalAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {new Date(repayment.scheduledDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${repayment.status === 'Paid'
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {repayment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
