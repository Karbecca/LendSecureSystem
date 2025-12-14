import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Wallet,
    TrendingUp,
    PiggyBank,
    FileSearch,
    ArrowRight,
    Loader2,
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


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#0B5ED7] p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-blue-50 text-[#0B5ED7] text-xs font-bold px-2.5 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(wallet?.balance || 0)}</h3>
                    <Link to="/lender/wallet" className="text-[#0B5ED7] text-sm font-semibold hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
                        Manage Wallet <ArrowRight className="h-3 w-3" />
                    </Link>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#0B5ED7] p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                            <PiggyBank className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-blue-50 text-[#0B5ED7] text-xs font-bold px-2.5 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Invested</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(totalInvested)}</h3>
                    <Link to="/lender/investments" className="text-[#0B5ED7] text-sm font-semibold hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
                        View Investments <ArrowRight className="h-3 w-3" />
                    </Link>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#0B5ED7] p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-blue-50 text-[#0B5ED7] text-xs font-bold px-2.5 py-1 rounded-full">Earned</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Returns</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(totalReturns)}</h3>
                    <Link to="/lender/repayments" className="text-[#0B5ED7] text-sm font-semibold hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
                        View Returns <ArrowRight className="h-3 w-3" />
                    </Link>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#0B5ED7] p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-blue-50 text-[#0B5ED7] text-xs font-bold px-2.5 py-1 rounded-full">Pending</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Returns</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(pendingReturns)}</h3>
                    <Link to="/lender/repayments" className="text-[#0B5ED7] text-sm font-semibold hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-4">
                        View Schedule <ArrowRight className="h-3 w-3" />
                    </Link>
                </motion.div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent Investments Table */}
                <motion.div variants={item} className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Recent Investments</h3>
                        <Link to="/lender/investments" className="text-sm text-royal-card font-medium hover:underline flex items-center gap-1">
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
                                            No investments yet. <Link to="/lender/loans" className="text-royal-card font-medium hover:underline">Browse available loans</Link>
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
                                            <td className="px-6 py-4 text-sm font-bold text-royal-card">
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
                    <motion.div variants={item} className="bg-white rounded-2xl p-6 text-slate-800 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h3 className="text-lg font-bold mb-6 relative z-10">Upcoming Return</h3>
                        {upcomingRepayment ? (
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">Expected Amount</p>
                                    <span className="bg-blue-50 text-royal-card text-xs font-bold px-2 py-1 rounded-lg border border-blue-100">Pending</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4 text-slate-800">{formatCurrency(upcomingRepayment.totalAmount)}</h2>
                                <div className="flex justify-between items-center text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span>Expected Date</span>
                                    <span className="font-semibold text-slate-800">{new Date(upcomingRepayment.scheduledDate).toLocaleDateString()}</span>
                                </div>
                                <Link to="/lender/repayments" className="block w-full bg-royal-card text-center py-3 rounded-xl font-bold hover:bg-royal transition-all shadow-lg shadow-royal-card/25">
                                    View All Returns
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8 relative z-10">
                                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <DollarSign className="h-6 w-6 text-royal-card" />
                                </div>
                                <p className="text-slate-800 font-medium">No pending returns</p>
                                <p className="text-slate-500 text-xs mt-1">Invest in loans to start earning</p>
                            </div>
                        )}
                    </motion.div>


                </div>
            </div>
        </motion.div>
    );
}
