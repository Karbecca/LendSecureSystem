import { useEffect, useState } from "react";
import {
    Search,
    Loader2,
    DollarSign,
    Calendar,
    Percent,
    User,
    ArrowRight,
    X,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";

interface Loan {
    loanId: string;
    borrowerId: string;
    borrowerName: string;
    amountRequested: number;
    currency: string;
    purpose: string;
    termMonths: number;
    interestRate: number;
    status: string;
    createdAt: string;
}

export default function BrowseLoans() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [fundingAmount, setFundingAmount] = useState("");
    const [isFunding, setIsFunding] = useState(false);
    const [fundingSuccess, setFundingSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const data = await api.getApprovedLoans();
            const loanList = Array.isArray(data) ? data : data.data || [];
            // Filter for approved loans only
            const approvedLoans = loanList.filter((l: Loan) => l.status === "Approved");
            setLoans(approvedLoans);
            setFilteredLoans(approvedLoans);
        } catch (error) {
            console.error("Failed to fetch loans", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm) {
            const filtered = loans.filter(loan =>
                loan.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLoans(filtered);
        } else {
            setFilteredLoans(loans);
        }
    }, [searchTerm, loans]);

    const handleFund = async () => {
        if (!selectedLoan || !fundingAmount) return;

        const amount = parseFloat(fundingAmount);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (amount > selectedLoan.amountRequested) {
            setError(`Maximum amount is ${formatCurrency(selectedLoan.amountRequested)}`);
            return;
        }

        setIsFunding(true);
        setError("");

        try {
            await api.fundLoan({ loanId: selectedLoan.loanId, amount });
            setFundingSuccess(true);
            setTimeout(() => {
                setSelectedLoan(null);
                setFundingAmount("");
                setFundingSuccess(false);
                fetchLoans(); // Refresh loans list
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fund loan");
        } finally {
            setIsFunding(false);
        }
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Browse Loan Requests</h1>
                    <p className="text-slate-500 text-sm mt-1">Find approved loans and start investing</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-64">
                        <Search className="h-4 w-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search loans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Loans Grid */}
            {filteredLoans.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Loans Available</h3>
                    <p className="text-slate-500 text-sm">There are no approved loans available for funding at the moment.</p>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {filteredLoans.map((loan) => (
                        <motion.div
                            key={loan.loanId}
                            variants={item}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-indigo-50 p-2 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-indigo-600" />
                                </div>
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                                    {loan.status}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 mb-1">
                                {formatCurrency(loan.amountRequested)}
                            </h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{loan.purpose || "General purpose loan"}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span>{loan.borrowerName || "Borrower"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>{loan.termMonths} months term</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Percent className="h-4 w-4 text-slate-400" />
                                    <span>{loan.interestRate}% interest rate</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedLoan(loan)}
                                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                            >
                                Fund This Loan <ArrowRight className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Funding Modal */}
            <AnimatePresence>
                {selectedLoan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => !isFunding && setSelectedLoan(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {fundingSuccess ? (
                                <div className="text-center py-8">
                                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Funding Successful!</h3>
                                    <p className="text-slate-500 text-sm">Your investment has been recorded.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Fund Loan</h3>
                                        <button
                                            onClick={() => setSelectedLoan(null)}
                                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-500 text-sm">Loan Amount</span>
                                            <span className="font-bold text-slate-800">{formatCurrency(selectedLoan.amountRequested)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-500 text-sm">Interest Rate</span>
                                            <span className="font-medium text-slate-800">{selectedLoan.interestRate}%</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-500 text-sm">Term</span>
                                            <span className="font-medium text-slate-800">{selectedLoan.termMonths} months</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 text-sm">Borrower</span>
                                            <span className="font-medium text-slate-800">{selectedLoan.borrowerName || "Borrower"}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Funding Amount
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                value={fundingAmount}
                                                onChange={(e) => setFundingAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <p className="text-slate-400 text-xs mt-2">Maximum: {formatCurrency(selectedLoan.amountRequested)}</p>
                                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                    </div>

                                    <button
                                        onClick={handleFund}
                                        disabled={isFunding || !fundingAmount}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isFunding ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign className="h-5 w-5" />
                                                Confirm Investment
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
