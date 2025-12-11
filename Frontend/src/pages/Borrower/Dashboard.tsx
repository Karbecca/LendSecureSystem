import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CreditCard,
    Calendar,
    ShieldCheck,
    TrendingUp,
    ArrowRight,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";

// Define simpler Types here for now
interface Loan {
    loanId: string;
    amountRequested: number;
    interestRate: number;
    termMonths: number;
    status: string;
    createdAt: string;
}

interface Wallet {
    balance: number;
    currency: string;
}

interface Repayment {
    repaymentId: string;
    totalAmount: number;
    scheduledDate: string;
    status: string;
}

export default function BorrowerDashboard() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [kycDocs, setKycDocs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletData, loansData, repaymentsData, kycData] = await Promise.all([
                    api.getWallet(),
                    api.getLoans(),
                    api.getMyRepayments(),
                    api.getMyKycDocuments()
                ]);

                setWallet(!!walletData && walletData.data ? walletData.data : walletData);
                setLoans(Array.isArray(loansData) ? loansData : loansData.data || []);
                setRepayments(Array.isArray(repaymentsData) ? repaymentsData : repaymentsData.data || []);
                setKycDocs(Array.isArray(kycData) ? kycData : kycData.data || []);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const activeLoansCount = loans.filter(l => l.status === "Approved" || l.status === "Funded").length;

    const upcomingRepayment = repayments
        .filter(r => r.status === "Pending")
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0];

    const kycStatus = kycDocs.length === 0 ? "Pending"
        : kycDocs.some(d => d.status === "Approved") ? "Verified"
            : kycDocs.some(d => d.status === "Rejected") ? "Rejected"
                : "Under Review";

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
            <div className="flex h-screen items-center justify-center bg-surface-muted">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
            {/* 1. KYC Banner (If not verified) */}
            {kycStatus !== "Verified" && (
                <motion.div variants={item} className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-500"></div>

                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
                            <ShieldCheck className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Action Required: KYC Verification</h3>
                            <p className="text-slate-400 text-sm">Please complete your identity verification to unlock higher loan limits.</p>
                        </div>
                    </div>
                    <Link to="/kyc" className="mt-4 md:mt-0 relative z-10 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary/25">
                        Complete Verification
                    </Link>
                </motion.div>
            )}

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-50 p-2.5 rounded-xl group-hover:bg-emerald-100 transition-colors">
                            <CreditCard className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Wallet Balance</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(wallet?.balance || 0)}</h3>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Loans</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{activeLoansCount}</h3>
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-amber-50 p-2.5 rounded-xl group-hover:bg-amber-100 transition-colors">
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        {upcomingRepayment && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">Due Soon</span>}
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Next Payment</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">
                        {upcomingRepayment ? formatCurrency(upcomingRepayment.totalAmount) : "N/A"}
                    </h3>
                    {upcomingRepayment && <p className="text-xs text-slate-400 mt-1">Due {new Date(upcomingRepayment.scheduledDate).toLocaleDateString()}</p>}
                </motion.div>

                <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-50 p-2.5 rounded-xl group-hover:bg-purple-100 transition-colors">
                            <ShieldCheck className="h-5 w-5 text-purple-600" />
                        </div>
                        {kycStatus === "Pending" && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full">Action</span>}
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">KYC Status</p>
                    <h3 className={`text-xl font-bold mt-1 ${kycStatus === "Verified" ? "text-emerald-600" :
                        kycStatus === "Pending" ? "text-red-500" : "text-amber-500"
                        }`}>
                        {kycStatus}
                    </h3>
                </motion.div>
            </div>

            {/* 3. Main Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Active Loans Table */}
                <motion.div variants={item} className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">My Active Loans</h3>
                        <Link to="/loans" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-muted/50 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Loan ID</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Interest</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loans.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                                            No active loans found.
                                        </td>
                                    </tr>
                                ) : (
                                    loans.slice(0, 5).map((loan) => (
                                        <tr key={loan.loanId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                #{loan.loanId ? loan.loanId.substring(0, 8) : 'N/A'}...
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                                {formatCurrency(loan.amountRequested)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {loan.termMonths} Months
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {loan.interestRate}%
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${loan.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    loan.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        loan.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(loan.createdAt).toLocaleDateString()}
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
                    <motion.div variants={item} className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h3 className="text-lg font-bold mb-6 relative z-10">Upcoming Payment</h3>
                        {upcomingRepayment ? (
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">Amount Due</p>
                                    <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-1 rounded-lg">Pending</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">{formatCurrency(upcomingRepayment.totalAmount)}</h2>
                                <div className="flex justify-between items-center text-sm text-slate-300 mb-6 bg-white/5 p-3 rounded-xl border border-white/10">
                                    <span>Due Date</span>
                                    <span className="font-semibold text-white">{new Date(upcomingRepayment.scheduledDate).toLocaleDateString()}</span>
                                </div>
                                <Link to="/repayments" className="block w-full bg-primary text-center py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                                    Pay Now
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8 relative z-10">
                                <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                </div>
                                <p className="text-slate-300 font-medium">No upcoming payments!</p>
                                <p className="text-slate-500 text-xs mt-1">You are all caught up.</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div variants={item} className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-2">Need more funds?</h3>
                        <p className="text-blue-100 text-sm mb-4">You are eligible for a top-up loan up to $2,000 instantly.</p>
                        <Link to="/loans/create" className="inline-flex items-center bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
