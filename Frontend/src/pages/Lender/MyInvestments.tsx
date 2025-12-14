import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    DollarSign,
    TrendingUp,
    ArrowRight,
    PiggyBank,
    Target,
    BarChart3,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../services/api";
import { formatCurrency, cn } from "../../lib/utils";
import { SkeletonCard, SkeletonStat } from "../../components/ui/Skeleton";
import { ExportButtons } from "../../components/ui/ExportButtons";
import { exportToCSV, exportToPDF, formatCurrencyForExport, formatDateForExport, formatPercentageForExport } from "../../lib/export";

interface Investment {
    fundingId: string;
    loanId: string;
    amount: number;
    fundedAt: string;
    loanAmount: number;
    interestRate: number;
    termMonths: number;
    status: string;
    borrowerName?: string;
}

interface InvestmentWithMetrics extends Investment {
    expectedReturn: number;
    receivedReturn: number;
    roi: number;
    progress: number;
    remainingPayments: number;
    totalPayments: number;
}

export default function MyInvestments() {
    const [investments, setInvestments] = useState<InvestmentWithMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"All" | "Active" | "Completed">("All");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [fundingsData, repaymentsData] = await Promise.all([
                api.getMyFundings(),
                api.getLenderRepayments()
            ]);

            console.log('Fundings Data:', fundingsData);
            console.log('Repayments Data:', repaymentsData);

            // Handle different response formats
            const fundings = Array.isArray(fundingsData)
                ? fundingsData
                : (fundingsData?.data || []);
            const repayments = Array.isArray(repaymentsData)
                ? repaymentsData
                : (repaymentsData?.data || []);

            console.log('Processed Fundings:', fundings);
            console.log('Processed Repayments:', repayments);

            // Calculate metrics for each investment
            const enrichedInvestments: InvestmentWithMetrics[] = fundings.map((funding: any) => {
                // Get repayments for this loan
                const loanRepayments = repayments.filter((r: any) => r.loanId === funding.loanId);

                // Safely get loan amount (fallback to funding amount)
                const loanAmount = funding.loanAmount || funding.amount || 0;
                const fundingAmount = funding.amount || 0;
                const interestRate = funding.interestRate || 0;
                const termMonths = funding.termMonths || 0;

                // Calculate investment share (funding amount / total loan amount)
                const investmentShare = loanAmount > 0 ? fundingAmount / loanAmount : 0;

                // Calculate expected return (principal + interest)
                const totalInterest = loanAmount * (interestRate / 100) * (termMonths / 12);
                const totalRepayment = loanAmount + totalInterest;
                const expectedReturn = totalRepayment * investmentShare;

                // Calculate received return
                const paidRepayments = loanRepayments.filter((r: any) => r.status === "Paid");
                const receivedReturn = paidRepayments.reduce((sum: number, r: any) => {
                    const amount = r.totalAmount || 0;
                    return sum + (amount * investmentShare);
                }, 0);

                // Calculate ROI (prevent division by zero)
                const roi = fundingAmount > 0
                    ? ((expectedReturn - fundingAmount) / fundingAmount) * 100
                    : 0;

                // Calculate progress
                const totalPayments = loanRepayments.length;
                const paidPayments = paidRepayments.length;
                const progress = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0;

                // Determine status
                let status = "Active";
                if (progress === 100) status = "Completed";
                if (loanRepayments.some((r: any) => r.status === "Pending" && new Date(r.scheduledDate) < new Date())) {
                    status = "Overdue";
                }

                return {
                    ...funding,
                    expectedReturn,
                    receivedReturn,
                    roi: isNaN(roi) ? 0 : roi,
                    progress: isNaN(progress) ? 0 : progress,
                    remainingPayments: totalPayments - paidPayments,
                    totalPayments,
                    status
                };
            });

            setInvestments(enrichedInvestments);
        } catch (error) {
            console.error("Failed to fetch investments", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate portfolio metrics
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
    const totalReceivedReturn = investments.reduce((sum, inv) => sum + inv.receivedReturn, 0);
    const averageROI = investments.length > 0
        ? investments.reduce((sum, inv) => sum + inv.roi, 0) / investments.length
        : 0;
    const activeInvestments = investments.filter(inv => inv.status === "Active").length;

    // Filter investments
    const filteredInvestments = investments.filter(inv => {
        if (filter === "All") return true;
        if (filter === "Active") return inv.status === "Active" || inv.status === "Overdue";
        if (filter === "Completed") return inv.status === "Completed";
        return true;
    });

    const handleExportCSV = () => {
        const exportData = filteredInvestments.map(inv => ({
            'Loan ID': inv.loanId?.substring(0, 8) || '-',
            'Invested Amount': formatCurrencyForExport(inv.amount, 'RWF'),
            'Expected Return': formatCurrencyForExport(inv.expectedReturn, 'RWF'),
            'Received Return': formatCurrencyForExport(inv.receivedReturn, 'RWF'),
            'ROI': formatPercentageForExport(inv.roi),
            'Progress': formatPercentageForExport(inv.progress),
            'Status': inv.status,
            'Funded Date': formatDateForExport(inv.fundedAt)
        }));
        exportToCSV(exportData, 'my-investments');
    };

    const handleExportPDF = () => {
        const exportData = filteredInvestments.map(inv => ({
            loanId: inv.loanId?.substring(0, 8) || '-',
            invested: formatCurrencyForExport(inv.amount, 'RWF'),
            expectedReturn: formatCurrencyForExport(inv.expectedReturn, 'RWF'),
            roi: formatPercentageForExport(inv.roi),
            progress: formatPercentageForExport(inv.progress),
            status: inv.status
        }));

        const columns = [
            { header: 'Loan ID', dataKey: 'loanId' },
            { header: 'Invested', dataKey: 'invested' },
            { header: 'Expected Return', dataKey: 'expectedReturn' },
            { header: 'ROI', dataKey: 'roi' },
            { header: 'Progress', dataKey: 'progress' },
            { header: 'Status', dataKey: 'status' }
        ];

        const summary = [
            { label: 'Total Invested', value: formatCurrencyForExport(totalInvested, 'RWF') },
            { label: 'Expected Returns', value: formatCurrencyForExport(totalExpectedReturn, 'RWF') },
            { label: 'Average ROI', value: formatPercentageForExport(averageROI) },
            { label: 'Active Investments', value: activeInvestments.toString() }
        ];

        exportToPDF(exportData, columns, 'Investment Portfolio', 'my-investments', summary);
    };

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
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SkeletonStat />
                    <SkeletonStat />
                    <SkeletonStat />
                    <SkeletonStat />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
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
            {/* Portfolio Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-indigo-50 p-3 rounded-xl">
                            <PiggyBank className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Invested</p>
                            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvested)}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-emerald-50 p-3 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Returns</p>
                            <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalReceivedReturn)}</h3>
                            <p className="text-xs text-slate-400 mt-1">of {formatCurrency(totalExpectedReturn)}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Average ROI</p>
                            <h3 className="text-2xl font-bold text-blue-600">{averageROI.toFixed(1)}%</h3>
                            <p className="text-xs text-slate-400 mt-1">Across all investments</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-amber-50 p-3 rounded-xl">
                            <BarChart3 className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Investments</p>
                            <h3 className="text-2xl font-bold text-slate-800">{activeInvestments}</h3>
                            <p className="text-xs text-slate-400 mt-1">of {investments.length} total</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Investment Portfolio</h2>
                <div className="flex gap-3">
                    <ExportButtons
                        onExportCSV={handleExportCSV}
                        onExportPDF={handleExportPDF}
                        disabled={filteredInvestments.length === 0}
                    />
                    <div className="flex gap-2">
                        {["All", "Active", "Completed"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    filter === f
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                <Filter className="h-4 w-4" />
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Investment Cards */}
            {filteredInvestments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredInvestments.map((investment) => (
                        <motion.div
                            key={investment.fundingId}
                            variants={item}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800">Loan #{investment.loanId.substring(0, 8)}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Invested {new Date(investment.fundedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    investment.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                                        investment.status === "Overdue" ? "bg-red-100 text-red-700" :
                                            "bg-blue-100 text-blue-700"
                                )}>
                                    {investment.status === "Completed" && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                                    {investment.status === "Overdue" && <AlertCircle className="h-3 w-3 inline mr-1" />}
                                    {investment.status === "Active" && <Clock className="h-3 w-3 inline mr-1" />}
                                    {investment.status}
                                </span>
                            </div>

                            {/* Investment Details */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500 mb-1">Your Investment</p>
                                    <p className="text-lg font-bold text-slate-800">{formatCurrency(investment.amount)}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-3">
                                    <p className="text-xs text-emerald-600 mb-1">Expected Return</p>
                                    <p className="text-lg font-bold text-emerald-700">{formatCurrency(investment.expectedReturn)}</p>
                                </div>
                            </div>

                            {/* ROI & Received */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">ROI</p>
                                    <p className="text-xl font-bold text-indigo-600">+{investment.roi.toFixed(1)}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Received So Far</p>
                                    <p className="text-xl font-bold text-slate-800">{formatCurrency(investment.receivedReturn)}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                    <span>Repayment Progress</span>
                                    <span>{investment.totalPayments - investment.remainingPayments} / {investment.totalPayments} paid</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            investment.progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
                                        )}
                                        style={{ width: `${investment.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Loan Details */}
                            <div className="flex items-center justify-between text-sm text-slate-600 border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-4">
                                    <span>{investment.termMonths} months</span>
                                    <span>{investment.interestRate}% interest</span>
                                </div>
                                <Link
                                    to={`/lender/repayments`}
                                    className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    View Returns <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
