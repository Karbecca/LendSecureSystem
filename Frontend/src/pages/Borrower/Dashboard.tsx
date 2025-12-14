import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CreditCard,
    Calendar,
    ShieldCheck,
    TrendingUp,
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";
import { WalletWidget } from "../../components/ui/WalletWidget";
import { SkeletonStat, SkeletonTable } from "../../components/ui/Skeleton";

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

            {/* 2. Stats Grid - REDESIGNED */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Wallet Balance - White Theme */}
                <motion.div
                    variants={item}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#0066CC' }}>
                                <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#0066CC' }}>+12%</span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(wallet?.balance || 0)}</h3>
                        <Link to="/wallet" className="text-sm font-semibold hover:opacity-80 flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#0066CC' }}>
                            Manage Wallet <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* Active Loans - White Theme */}
                <motion.div
                    variants={item}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#0066CC' }}>
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            {activeLoansCount > 0 && (
                                <span className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#0066CC' }}>{activeLoansCount} Active</span>
                            )}
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Loans</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{activeLoansCount}</h3>
                        <Link to="/loans" className="text-sm font-semibold hover:opacity-80 flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#0066CC' }}>
                            View All Loans <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* Next Payment - White Theme */}
                <motion.div
                    variants={item}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#0066CC' }}>
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            {upcomingRepayment && (
                                <span className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: '#0066CC' }}>Due Soon</span>
                            )}
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Next Payment</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">
                            {upcomingRepayment ? formatCurrency(upcomingRepayment.totalAmount) : "N/A"}
                        </h3>
                        {upcomingRepayment ? (
                            <p className="text-sm font-semibold" style={{ color: '#0066CC' }}>Due {new Date(upcomingRepayment.scheduledDate).toLocaleDateString()}</p>
                        ) : (
                            <p className="text-sm font-semibold" style={{ color: '#0066CC' }}>All caught up! 🎉</p>
                        )}
                    </div>
                </motion.div>

                {/* KYC Status - White Theme */}
                <motion.div
                    variants={item}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl transition-transform ${kycStatus === "Verified" ? "" : "bg-red-500"
                                }`} style={kycStatus === "Verified" ? { backgroundColor: '#0066CC' } : {}}>
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            {kycStatus === "Pending" && (
                                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">Action</span>
                            )}
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">KYC Status</p>
                        <h3 className={`text-2xl font-bold mb-2 ${kycStatus === "Verified" ? "text-slate-900" :
                            kycStatus === "Pending" ? "text-red-600" : "text-amber-600"
                            }`}>
                            {kycStatus}
                        </h3>
                        {kycStatus !== "Verified" ? (
                            <Link to="/kyc" className="text-sm font-semibold hover:opacity-80 flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#0066CC' }}>
                                Complete Now <ArrowRight className="h-3 w-3" />
                            </Link>
                        ) : (
                            <p className="text-sm font-semibold flex items-center gap-1" style={{ color: '#0066CC' }}>
                                <CheckCircle2 className="h-4 w-4" /> Verified
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* 3. Main Content Split - REDESIGNED */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent Loans - Card Layout */}
                <motion.div variants={item} className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Recent Loans</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Track your loan applications</p>
                        </div>
                        <Link to="/loans" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 group">
                            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-6 space-y-4">
                        {loans.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="h-8 w-8 text-slate-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-2">No Loans Yet</h4>
                                <p className="text-slate-500 text-sm mb-6">Start your journey by requesting your first loan</p>
                                <Link to="/loans/create" className="inline-flex items-center bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                                    Request Loan <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            loans.slice(0, 4).map((loan) => (
                                <div key={loan.loanId} className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-mono text-slate-500">#{loan.loanId ? loan.loanId.substring(0, 8) : 'N/A'}</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${loan.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    loan.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        loan.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {loan.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-0.5">Amount</p>
                                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(loan.amountRequested)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-0.5">Duration</p>
                                                    <p className="text-sm font-semibold text-slate-700">{loan.termMonths} months</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-0.5">Interest</p>
                                                    <p className="text-sm font-semibold text-slate-700">{loan.interestRate}%</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/loans/${loan.loanId}`}
                                            className="ml-4 bg-slate-100 hover:bg-primary hover:text-white p-2 rounded-lg transition-all group-hover:scale-110"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                                        <span>Applied {new Date(loan.createdAt).toLocaleDateString()}</span>
                                        {loan.status === 'Approved' && (
                                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Ready to fund
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Right Side Widgets */}
                <div className="space-y-6">
                    {/* Wallet Widget */}
                    <motion.div variants={item}>
                        <WalletWidget />
                    </motion.div>

                    {/* Upcoming Payment Widget */}
                    <motion.div variants={item} className="bg-white rounded-2xl p-6 relative overflow-hidden shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold mb-6 relative z-10 text-slate-900">Upcoming Payment</h3>
                        {upcomingRepayment ? (
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">Amount Due</p>
                                    <span className="text-white text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: '#0066CC' }}>Pending</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4 text-slate-900">{formatCurrency(upcomingRepayment.totalAmount)}</h2>
                                <div className="flex justify-between items-center text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <span>Due Date</span>
                                    <span className="font-semibold text-slate-900">{new Date(upcomingRepayment.scheduledDate).toLocaleDateString()}</span>
                                </div>
                                <Link to="/repayments" className="block w-full text-white text-center py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg" style={{ backgroundColor: '#0066CC' }}>
                                    Pay Now
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8 relative z-10">
                                <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="h-6 w-6" style={{ color: '#0066CC' }} />
                                </div>
                                <p className="text-slate-900 font-medium">No upcoming payments!</p>
                                <p className="text-slate-500 text-xs mt-1">You are all caught up.</p>
                            </div>
                        )}
                    </motion.div>


                </div>
            </div>
        </motion.div>
    );
}
