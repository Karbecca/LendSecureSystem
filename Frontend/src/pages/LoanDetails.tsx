import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    TrendingUp,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    Loader2
} from "lucide-react";
import api from "../services/api";
import { formatCurrency, cn } from "../lib/utils";
import { SkeletonCard } from "../components/ui/Skeleton";

interface LoanDetails {
    loanId: string;
    borrowerId: string;
    borrowerName: string;
    amountRequested: number;
    termMonths: number;
    interestRate: number;
    purpose: string;
    status: string;
    createdAt: string;
    approvedAt?: string;
    fundedAt?: string;
    totalFunded?: number;
    currency: string;
}

interface Funding {
    fundingId: string;
    lenderId: string;
    lenderName: string;
    amount: number;
    fundedAt: string;
}

interface Repayment {
    repaymentId: string;
    scheduledDate: string;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    status: string;
    paidAt?: string;
}

export default function LoanDetails() {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<LoanDetails | null>(null);
    const [fundings, setFundings] = useState<Funding[]>([]);
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loanId) {
            fetchLoanDetails();
        }
    }, [loanId]);

    const fetchLoanDetails = async () => {
        try {
            setIsLoading(true);
            // Fetch loan details and related data
            const [loanData, fundingsData, repaymentsData] = await Promise.all([
                api.get(`/loans/${loanId}`),
                api.get(`/funding/loan/${loanId}`).catch(() => ({ data: [] })),
                api.get(`/repayments/schedule/${loanId}`).catch(() => ({ data: [] }))
            ]);

            setLoan(loanData.data || loanData);
            setFundings(Array.isArray(fundingsData.data) ? fundingsData.data : fundingsData.data?.fundings || []);
            setRepayments(Array.isArray(repaymentsData.data) ? repaymentsData.data : repaymentsData.data?.repayments || []);
        } catch (error) {
            console.error("Failed to fetch loan details", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonCard />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <AlertCircle className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Loan Not Found</h3>
                <p className="text-slate-500 mb-4">The loan you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const totalInterest = loan.amountRequested * (loan.interestRate / 100) * (loan.termMonths / 12);
    const totalRepayment = loan.amountRequested + totalInterest;
    const fundingProgress = ((loan.totalFunded || 0) / loan.amountRequested) * 100;
    const paidRepayments = repayments.filter(r => r.status === "Paid").length;
    const repaymentProgress = repayments.length > 0 ? (paidRepayments / repayments.length) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Loan Details</h1>
                    <p className="text-slate-500 text-sm mt-1">#{loan.loanId.substring(0, 8)}</p>
                </div>
            </div>

            {/* Loan Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl"
            >
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-indigo-200 text-sm mb-2">Loan Amount</p>
                        <h2 className="text-4xl font-bold">{formatCurrency(loan.amountRequested)} {loan.currency}</h2>
                    </div>
                    <span className={cn(
                        "px-4 py-2 rounded-full text-sm font-bold",
                        loan.status === "Funded" ? "bg-emerald-500/20 text-emerald-100" :
                            loan.status === "Approved" ? "bg-blue-500/20 text-blue-100" :
                                loan.status === "Pending" ? "bg-amber-500/20 text-amber-100" :
                                    "bg-red-500/20 text-red-100"
                    )}>
                        {loan.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-indigo-200 text-xs mb-1">Term</p>
                        <p className="text-xl font-bold">{loan.termMonths} months</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-indigo-200 text-xs mb-1">Interest Rate</p>
                        <p className="text-xl font-bold">{loan.interestRate}%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-indigo-200 text-xs mb-1">Total Interest</p>
                        <p className="text-xl font-bold">{formatCurrency(totalInterest)}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-indigo-200 text-xs mb-1">Total Repayment</p>
                        <p className="text-xl font-bold">{formatCurrency(totalRepayment)}</p>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Loan Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Loan Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Borrower</p>
                                <p className="font-medium text-slate-800 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    {loan.borrowerName || `User #${loan.borrowerId.substring(0, 8)}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Purpose</p>
                                <p className="text-slate-800">{loan.purpose}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Created</p>
                                    <p className="text-slate-800 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        {new Date(loan.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {loan.approvedAt && (
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Approved</p>
                                        <p className="text-slate-800 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            {new Date(loan.approvedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Funding History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-indigo-600" />
                                Funding History
                            </h3>
                            {loan.status === "Approved" && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                                        <span>Funding Progress</span>
                                        <span>{formatCurrency(loan.totalFunded || 0)} / {formatCurrency(loan.amountRequested)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${fundingProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {fundings.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-500">No fundings yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {fundings.map((funding) => (
                                    <div key={funding.fundingId} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {funding.lenderName || `Lender #${funding.lenderId.substring(0, 8)}`}
                                                </p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(funding.fundedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="text-lg font-bold text-indigo-600">
                                                {formatCurrency(funding.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Repayment Schedule */}
                    {repayments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                                    Repayment Schedule
                                </h3>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                                        <span>Progress</span>
                                        <span>{paidRepayments} / {repayments.length} paid</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${repaymentProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {repayments.map((repayment, index) => (
                                    <div key={repayment.repaymentId} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    repayment.status === "Paid" ? "bg-emerald-50" : "bg-slate-100"
                                                )}>
                                                    {repayment.status === "Paid" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 text-slate-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">Month {index + 1}</p>
                                                    <p className="text-sm text-slate-500">
                                                        Due: {new Date(repayment.scheduledDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800">{formatCurrency(repayment.totalAmount)}</p>
                                                <span className={cn(
                                                    "text-xs px-2 py-1 rounded-full",
                                                    repayment.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {repayment.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Lenders</span>
                                <span className="font-bold text-slate-800">{fundings.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Funded</span>
                                <span className="font-bold text-indigo-600">
                                    {formatCurrency(loan.totalFunded || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Remaining</span>
                                <span className="font-bold text-amber-600">
                                    {formatCurrency(loan.amountRequested - (loan.totalFunded || 0))}
                                </span>
                            </div>
                            {repayments.length > 0 && (
                                <>
                                    <div className="border-t border-slate-100 pt-4"></div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Payments Made</span>
                                        <span className="font-bold text-emerald-600">{paidRepayments}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Payments Pending</span>
                                        <span className="font-bold text-amber-600">{repayments.length - paidRepayments}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Actions */}
                    {loan.status === "Funded" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100"
                        >
                            <h3 className="text-lg font-bold text-indigo-900 mb-2">Manage Loan</h3>
                            <p className="text-sm text-indigo-700 mb-4">View repayment schedule and make payments</p>
                            <Link
                                to={`/repayments/schedule/${loan.loanId}`}
                                className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                            >
                                View Schedule
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
