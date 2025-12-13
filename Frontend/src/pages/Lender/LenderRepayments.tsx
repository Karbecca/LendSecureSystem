import { useEffect, useState } from "react";
import {
    Loader2,
    DollarSign,
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    ArrowRight,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import api from "../../services/api";
import { formatCurrency, cn } from "../../lib/utils";
import { ExportButtons } from "../../components/ui/ExportButtons";
import { exportToCSV, exportToPDF, formatCurrencyForExport, formatDateForExport } from "../../lib/export";

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

interface GroupedRepayments {
    loanId: string;
    repayments: Repayment[];
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
}

export default function LenderRepayments() {
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

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

    // Group repayments by loan
    const groupedRepayments: GroupedRepayments[] = repayments.reduce((acc, repayment) => {
        const existing = acc.find(g => g.loanId === repayment.loanId);
        if (existing) {
            existing.repayments.push(repayment);
            existing.totalAmount += repayment.totalAmount;
            if (repayment.status === "Paid") {
                existing.paidAmount += repayment.totalAmount;
            } else {
                existing.pendingAmount += repayment.totalAmount;
            }
        } else {
            acc.push({
                loanId: repayment.loanId,
                repayments: [repayment],
                totalAmount: repayment.totalAmount,
                paidAmount: repayment.status === "Paid" ? repayment.totalAmount : 0,
                pendingAmount: repayment.status === "Pending" ? repayment.totalAmount : 0
            });
        }
        return acc;
    }, [] as GroupedRepayments[]);

    const toggleLoan = (loanId: string) => {
        setExpandedLoans(prev => {
            const newSet = new Set(prev);
            if (newSet.has(loanId)) {
                newSet.delete(loanId);
            } else {
                newSet.add(loanId);
            }
            return newSet;
        });
    };

    const paidRepayments = repayments.filter(r => r.status === "Paid");
    const pendingRepayments = repayments.filter(r => r.status === "Pending");
    const totalEarned = paidRepayments.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalPending = pendingRepayments.reduce((sum, r) => sum + r.totalAmount, 0);

    const handleExportCSV = () => {
        const exportData = repayments.map(rep => ({
            'Loan ID': rep.loanId?.substring(0, 8) || '-',
            'Due Date': formatDateForExport(rep.scheduledDate),
            'Principal': formatCurrencyForExport(rep.principalAmount, 'RWF'),
            'Interest': formatCurrencyForExport(rep.interestAmount, 'RWF'),
            'Total': formatCurrencyForExport(rep.totalAmount, 'RWF'),
            'Status': rep.status,
            'Paid Date': rep.paidAt ? formatDateForExport(rep.paidAt) : '-'
        }));
        exportToCSV(exportData, 'lender-repayments');
    };

    const handleExportPDF = () => {
        const exportData = repayments.map(rep => ({
            loanId: rep.loanId?.substring(0, 8) || '-',
            dueDate: formatDateForExport(rep.scheduledDate),
            amount: formatCurrencyForExport(rep.totalAmount, 'RWF'),
            status: rep.status,
            paidDate: rep.paidAt ? formatDateForExport(rep.paidAt) : '-'
        }));

        const columns = [
            { header: 'Loan ID', dataKey: 'loanId' },
            { header: 'Due Date', dataKey: 'dueDate' },
            { header: 'Amount', dataKey: 'amount' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Paid Date', dataKey: 'paidDate' }
        ];

        const summary = [
            { label: 'Total Earned', value: formatCurrencyForExport(totalEarned, 'RWF') },
            { label: 'Total Pending', value: formatCurrencyForExport(totalPending, 'RWF') },
            { label: 'Total Repayments', value: repayments.length.toString() }
        ];

        exportToPDF(exportData, columns, 'Lender Repayments', 'lender-repayments', summary);
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

            {/* Grouped Repayments */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Repayment Schedule by Loan</h2>
                            <p className="text-slate-500 text-sm mt-1">Track your returns from each funded loan</p>
                        </div>
                        <ExportButtons
                            onExportCSV={handleExportCSV}
                            onExportPDF={handleExportPDF}
                            disabled={repayments.length === 0}
                        />
                    </div>
                </div>

                {groupedRepayments.length === 0 ? (
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
                    <div className="divide-y divide-slate-100">
                        {groupedRepayments.map((group) => {
                            const isExpanded = expandedLoans.has(group.loanId);
                            const paidCount = group.repayments.filter(r => r.status === "Paid").length;
                            const progress = (paidCount / group.repayments.length) * 100;

                            return (
                                <div key={group.loanId} className="transition-colors">
                                    {/* Loan Header */}
                                    <button
                                        onClick={() => toggleLoan(group.loanId)}
                                        className="w-full p-6 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-slate-800">
                                                        Loan #{group.loanId.substring(0, 8)}
                                                    </h3>
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                                        {group.repayments.length} installments
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                                        <span>{paidCount} / {group.repayments.length} paid</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-6 mt-3 text-sm">
                                                    <div>
                                                        <span className="text-slate-500">Total: </span>
                                                        <span className="font-bold text-slate-800">{formatCurrency(group.totalAmount)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Earned: </span>
                                                        <span className="font-bold text-emerald-600">{formatCurrency(group.paidAmount)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Pending: </span>
                                                        <span className="font-bold text-amber-600">{formatCurrency(group.pendingAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ml-4">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Repayments Table */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6">
                                            <div className="bg-slate-50 rounded-xl overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold">
                                                        <tr>
                                                            <th className="px-4 py-3">Month</th>
                                                            <th className="px-4 py-3">Principal</th>
                                                            <th className="px-4 py-3">Interest</th>
                                                            <th className="px-4 py-3">Total</th>
                                                            <th className="px-4 py-3">Due Date</th>
                                                            <th className="px-4 py-3">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        {group.repayments.map((repayment, index) => (
                                                            <tr key={repayment.repaymentId} className="hover:bg-slate-100/50 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                                    Month {index + 1}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                                    {formatCurrency(repayment.principalAmount)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-indigo-600 font-medium">
                                                                    +{formatCurrency(repayment.interestAmount)}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-sm font-bold text-slate-800">
                                                                        {formatCurrency(repayment.totalAmount)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-slate-500">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                                        {new Date(repayment.scheduledDate).toLocaleDateString()}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={cn(
                                                                        "px-2.5 py-1 rounded-full text-xs font-bold",
                                                                        repayment.status === 'Paid'
                                                                            ? 'bg-emerald-100 text-emerald-700'
                                                                            : 'bg-amber-100 text-amber-700'
                                                                    )}>
                                                                        {repayment.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
