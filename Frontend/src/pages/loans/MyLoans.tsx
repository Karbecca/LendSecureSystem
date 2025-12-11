import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FileText,
    ArrowRight,
    Loader2,
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    Percent,
    Clock,
    Hash,
    CheckCircle2,
    XCircle,
    Copy
} from "lucide-react";
import api from "../../services/api";
import { formatCurrency, cn } from "../../lib/utils";
import { Modal } from "../../components/ui/Modal";

interface Loan {
    loanId: string;
    amountRequested: number;
    interestRate: number;
    termMonths: number;
    status: string;
    createdAt: string;
    currency: string;
}

export default function MyLoans() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await api.getLoans();
                // Handle potential different response structures
                const data = Array.isArray(response) ? response : response.data.data || response.data || [];
                setLoans(data);
            } catch (error) {
                console.error("Failed to fetch loans", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoans();
    }, []);

    const filteredLoans = loans.filter(loan => {
        if (!loan) return false; // Safety check
        const matchesStatus = filterStatus === "All" || loan.status === filterStatus;

        // Safety check for string properties
        const idStr = loan.loanId ? loan.loanId.toLowerCase() : "";
        const amountStr = loan.amountRequested ? loan.amountRequested.toString() : "";

        const matchesSearch = idStr.includes(searchTerm.toLowerCase()) ||
            amountStr.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Loans</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your loan history.</p>
                </div>
                <Link to="/loans/create" className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center gap-2 w-fit">
                    Request New Loan <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by ID or Amount..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Filter className="h-4 w-4 text-slate-400 hidden md:block" />
                    {["All", "Pending", "Approved", "Funded", "Repaid", "Rejected"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                                filterStatus === status
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loans Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Loan Details</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Interest</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="mx-auto bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                            <FileText className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-slate-800 font-bold mb-1">No loans found</h3>
                                        <p className="text-slate-500 text-sm">
                                            {searchTerm || filterStatus !== "All"
                                                ? "Try adjusting your filters."
                                                : "You haven't requested any loans yet."}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan) => (
                                    <tr
                                        key={loan.loanId}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 uppercase">#{loan.loanId ? loan.loanId.substring(0, 8) : 'N/A'}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                            {formatCurrency(loan.amountRequested || 0)} {loan.currency}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {loan.termMonths} Months
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {loan.interestRate}%
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold border",
                                                loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    loan.status === 'Funded' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        loan.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            loan.status === 'Repaid' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                                'bg-red-50 text-red-700 border-red-200'
                                            )}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedLoan(loan)}
                                                className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-slate-100 rounded-lg"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Visual only for now) */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing {filteredLoans.length} of {loans.length} loans</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!selectedLoan}
                onClose={() => setSelectedLoan(null)}
            >
                {selectedLoan && (
                    <div className="relative">
                        {/* Status Watermark/Badge */}
                        <div className="absolute -top-2 -right-2">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5",
                                selectedLoan.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    selectedLoan.status === 'Funded' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        selectedLoan.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            selectedLoan.status === 'Repaid' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                            )}>
                                {selectedLoan.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                                {selectedLoan.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                                {selectedLoan.status}
                            </span>
                        </div>

                        <div className="text-center pt-8 pb-8">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Loan Amount</p>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                                {formatCurrency(selectedLoan.amountRequested)}
                                <span className="text-lg text-slate-400 font-medium ml-1">{selectedLoan.currency}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Percent className="h-5 w-5 text-primary mb-2" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Interest</span>
                                <span className="text-sm font-bold text-slate-800">{selectedLoan.interestRate}%</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Clock className="h-5 w-5 text-primary mb-2" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                                <span className="text-sm font-bold text-slate-800">{selectedLoan.termMonths} Mo</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Calendar className="h-5 w-5 text-primary mb-2" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Date</span>
                                <span className="text-sm font-bold text-slate-800">{new Date(selectedLoan.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold">Reference ID</p>
                                    <p className="text-xs font-mono font-medium text-slate-600 break-all">{selectedLoan.loanId}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(selectedLoan.loanId)}
                                className="text-slate-400 hover:text-primary transition-colors p-2"
                                title="Copy ID"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
}
