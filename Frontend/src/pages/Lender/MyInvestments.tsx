import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Loader2,
    DollarSign,
    Calendar,
    TrendingUp,
    ArrowRight,
    PiggyBank
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";

interface Funding {
    fundingId: string;
    loanId: string;
    lenderId: string;
    lenderName: string;
    amount: number;
    fundedAt: string;
}

export default function MyInvestments() {
    const [fundings, setFundings] = useState<Funding[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getMyFundings();
                setFundings(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch investments", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const totalInvested = fundings.reduce((sum, f) => sum + f.amount, 0);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-xl">
                            <PiggyBank className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Invested</p>
                            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvested)}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Investments</p>
                            <h3 className="text-2xl font-bold text-slate-800">{fundings.length}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-gradient-to-r from-indigo-600 to-teal-600 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Track Returns</p>
                            <h3 className="text-lg font-bold mt-1">View Your Earnings</h3>
                        </div>
                        <Link to="/lender/repayments" className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors">
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Investments Table */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">My Investments</h2>
                    <p className="text-slate-500 text-sm mt-1">All loans you have funded</p>
                </div>

                {fundings.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Investments Yet</h3>
                        <p className="text-slate-500 text-sm mb-4">Start investing in approved loans to grow your portfolio.</p>
                        <Link to="/lender/loans" className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors">
                            Browse Loans <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-muted/50 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Funding ID</th>
                                    <th className="px-6 py-4">Loan ID</th>
                                    <th className="px-6 py-4">Amount Invested</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fundings.map((funding) => (
                                    <tr key={funding.fundingId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            #{funding.fundingId?.substring(0, 8) || 'N/A'}...
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            #{funding.loanId?.substring(0, 8) || 'N/A'}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-indigo-600">
                                                {formatCurrency(funding.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {new Date(funding.fundedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to="/lender/repayments"
                                                className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
                                            >
                                                View Returns <ArrowRight className="h-3 w-3" />
                                            </Link>
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
