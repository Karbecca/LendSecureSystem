import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Wallet,
    TrendingUp,
    PiggyBank,
    FileSearch,
    ArrowRight,
    DollarSign,
    Clock
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";
import { WalletWidget } from "../../components/ui/WalletWidget";
import { SkeletonStat, SkeletonTable } from "../../components/ui/Skeleton";

interface Funding {
    fundingId: string;
    loanId: string;
    amount: number;
    fundedAt: string;
}

interface Repayment {
    repaymentId: string;
    loanId: string;
    totalAmount: number;
    scheduledDate: string;
    status: string;
}

interface Wallet {
    balance: number;
    currency: string;
}

export default function LenderDashboard() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [fundings, setFundings] = useState<Funding[]>([]);
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [approvedLoans, setApprovedLoans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletData, fundingsData, repaymentsData, loansData] = await Promise.all([
                    api.getWallet(),
                    api.getMyFundings(),
                    api.getLenderRepayments(),
                    api.getApprovedLoans()
                ]);

                setWallet(!!walletData && walletData.data ? walletData.data : walletData);
                setFundings(Array.isArray(fundingsData) ? fundingsData : []);
                setRepayments(Array.isArray(repaymentsData) ? repaymentsData : []);

                // Filter for approved loans only
                const loans = Array.isArray(loansData) ? loansData : loansData.data || [];
                setApprovedLoans(loans.filter((l: any) => l.status === "Approved"));
            } catch (error) {
                console.error("Failed to fetch lender dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const totalInvested = fundings.reduce((sum, f) => sum + f.amount, 0);
    const paidRepayments = repayments.filter(r => r.status === "Paid");
    const pendingRepayments = repayments.filter(r => r.status === "Pending");
    const totalReturns = paidRepayments.reduce((sum, r) => sum + r.totalAmount, 0);
    const pendingReturns = pendingRepayments.reduce((sum, r) => sum + r.totalAmount, 0);

    const upcomingRepayment = pendingRepayments
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SkeletonStat />
                    <SkeletonStat />
                    <SkeletonStat />
                    <SkeletonStat />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <SkeletonTable rows={5} />
                    </div>
                    <div className="space-y-6">
                        <SkeletonStat />
                        <SkeletonStat />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="show"
            animate="show"
            className="space-y-6"
        >
            {/* Welcome Banner */}
            <motion.div variants={item} className="bg-gradient-to-r from-indigo-600 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Welcome, Lender!</h2>
                    <p className="text-indigo-100 text-sm mb-4">Start investing in approved loans and earn returns.</p>
                    <Link to="/lender/loans" className="inline-flex items-center bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                        Browse Loan Requests <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-indigo-50 p-2.5 rounded-xl group-hover:bg-indigo-100 transition-colors">
                            <Wallet className="h-5 w-5 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Wallet Balance</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(wallet?.balance || 0)}</h3>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <PiggyBank className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Invested</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalInvested)}</h3>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-50 p-2.5 rounded-xl group-hover:bg-purple-100 transition-colors">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        {totalReturns > 0 && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full">Earned</span>}
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Returns</p>
                    <h3 className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(totalReturns)}</h3>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-amber-50 p-2.5 rounded-xl group-hover:bg-amber-100 transition-colors">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pending Returns</p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(pendingReturns)}</h3>
                </motion.div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent Investments Table */}
                <motion.div variants={item} className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Recent Investments</h3>
                        <Link to="/lender/investments" className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-muted/50 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Funding ID</th>
                                    <th className="px-6 py-4">Loan ID</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fundings.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                                            No investments yet. <Link to="/lender/loans" className="text-indigo-600 font-medium hover:underline">Browse available loans</Link>
                                        </td>
                                    </tr>
                                ) : (
                                    fundings.slice(0, 5).map((funding) => (
                                        <tr key={funding.fundingId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                #{funding.fundingId?.substring(0, 8) || 'N/A'}...
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                #{funding.loanId?.substring(0, 8) || 'N/A'}...
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                                                {formatCurrency(funding.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(funding.fundedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Right Side Widgets */}
                <div className="space-y-6">
                    {/* Wallet Widget */}
                    <motion.div variants={item}>
                        <WalletWidget />
                    </motion.div>

                    {/* Upcoming Repayment Widget */}
                    <motion.div variants={item} className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h3 className="text-lg font-bold mb-6 relative z-10">Upcoming Return</h3>
                        {upcomingRepayment ? (
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">Expected Amount</p>
                                    <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-1 rounded-lg">Pending</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">{formatCurrency(upcomingRepayment.totalAmount)}</h2>
                                <div className="flex justify-between items-center text-sm text-slate-300 mb-6 bg-white/5 p-3 rounded-xl border border-white/10">
                                    <span>Expected Date</span>
                                    <span className="font-semibold text-white">{new Date(upcomingRepayment.scheduledDate).toLocaleDateString()}</span>
                                </div>
                                <Link to="/lender/repayments" className="block w-full bg-indigo-500 text-center py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/25">
                                    View All Returns
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8 relative z-10">
                                <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <DollarSign className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-slate-300 font-medium">No pending returns</p>
                                <p className="text-slate-500 text-xs mt-1">Invest in loans to start earning</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Available Loans CTA */}
                    <motion.div variants={item} className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="flex items-center gap-3 mb-3">
                            <FileSearch className="h-6 w-6" />
                            <h3 className="text-lg font-bold">{approvedLoans.length} Loans Available</h3>
                        </div>
                        <p className="text-blue-100 text-sm mb-4">Browse approved loan requests and start investing today.</p>
                        <Link to="/lender/loans" className="inline-flex items-center bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                            Browse Loans <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
