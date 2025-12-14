import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Wallet as WalletIcon,
    TrendingUp,
    TrendingDown,
    Plus,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    DollarSign,
    X
} from "lucide-react";
import api from "../services/api";
import { formatCurrency, cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { VALIDATION, validateWalletAmount, getErrorMessage } from "../lib/validation";
import { ExportButtons } from "../components/ui/ExportButtons";
import { exportToCSV, exportToPDF, formatCurrencyForExport, formatDateForExport } from "../lib/export";

interface WalletData {
    walletId: string;
    balance: number;
    currency: string;
    updatedAt: string;
}

interface Transaction {
    txnId: string;
    txnType: string;
    amount: number;
    currency: string;
    relatedLoanId?: string;
    createdAt: string;
}

export default function Wallet() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
    const [fundAmount, setFundAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [filter, setFilter] = useState<"All" | "Credit" | "Debit">("All");
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setIsLoading(true);
            const [walletData, txnData] = await Promise.all([
                api.getWallet(),
                api.getWalletTransactions()
            ]);

            setWallet(walletData.data || walletData);
            setTransactions(Array.isArray(txnData) ? txnData : txnData.data || []);
        } catch (error) {
            console.error("Failed to fetch wallet data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFunds = async () => {
        const amount = parseFloat(fundAmount);
        const error = validateWalletAmount(amount);

        if (error) {
            setValidationError(error);
            return;
        }

        try {
            setIsProcessing(true);
            setValidationError(null);
            await api.addFunds(amount);
            setIsAddFundsOpen(false);
            setFundAmount("");
            fetchWalletData(); // Refresh data
        } catch (error: any) {
            console.error("Failed to add funds", error);
            setValidationError(getErrorMessage(error));
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredTransactions = transactions.filter(txn => {
        if (filter === "All") return true;
        if (filter === "Credit") return txn.txnType.toLowerCase().includes("credit");
        if (filter === "Debit") return txn.txnType.toLowerCase().includes("debit");
        return true;
    });

    const handleExportCSV = () => {
        const exportData = filteredTransactions.map(txn => ({
            'Transaction ID': txn.txnId?.substring(0, 8) || '-',
            'Type': txn.txnType,
            'Amount': formatCurrencyForExport(txn.amount, txn.currency),
            'Related Loan': txn.relatedLoanId?.substring(0, 8) || '-',
            'Date': formatDateForExport(txn.createdAt)
        }));
        exportToCSV(exportData, 'wallet-transactions');
    };

    const handleExportPDF = () => {
        const exportData = filteredTransactions.map(txn => ({
            txnId: txn.txnId?.substring(0, 8) || '-',
            type: txn.txnType,
            amount: formatCurrencyForExport(txn.amount, txn.currency),
            loanId: txn.relatedLoanId?.substring(0, 8) || '-',
            date: formatDateForExport(txn.createdAt)
        }));

        const columns = [
            { header: 'Txn ID', dataKey: 'txnId' },
            { header: 'Type', dataKey: 'type' },
            { header: 'Amount', dataKey: 'amount' },
            { header: 'Loan ID', dataKey: 'loanId' },
            { header: 'Date', dataKey: 'date' }
        ];

        const summary = [
            { label: 'Current Balance', value: formatCurrencyForExport(wallet?.balance || 0, wallet?.currency || 'RWF') },
            { label: 'Total Transactions', value: filteredTransactions.length.toString() },
            { label: 'Filter', value: filter }
        ];

        exportToPDF(exportData, columns, 'Wallet Transactions', 'wallet-transactions', summary);
    };

    const getTransactionIcon = (type: string) => {
        return type.toLowerCase().includes("credit") ? (
            <div className="bg-emerald-50 p-2 rounded-lg">
                <ArrowDownRight className="h-5 w-5 text-emerald-600" />
            </div>
        ) : (
            <div className="bg-red-50 p-2 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#0066CC' }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Wallet</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your funds and view transaction history</p>
            </div>

            {/* Wallet Balance & Stats Grid - REDESIGNED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group"
                    style={{ background: 'linear-gradient(to bottom right, #0066CC, #0052a3)' }}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                    <WalletIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Available Balance</p>
                                    <h2 className="text-3xl font-bold mt-0.5">{formatCurrency(wallet?.balance || 0)}</h2>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsAddFundsOpen(true)}
                                className="bg-white hover:bg-white/90 shadow-lg"
                                style={{ color: '#0066CC' }}
                                size="sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Funds
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                            <Calendar className="h-3.5 w-3.5" />
                            Last updated: {wallet?.updatedAt ? new Date(wallet.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-50 p-1.5 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span className="text-xs text-slate-600">Credits</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">
                                {transactions.filter(t => t.txnType.toLowerCase().includes('credit')).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-50 p-1.5 rounded-lg">
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                </div>
                                <span className="text-xs text-slate-600">Debits</span>
                            </div>
                            <span className="text-sm font-bold text-red-600">
                                {transactions.filter(t => t.txnType.toLowerCase().includes('debit')).length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-600">Total Transactions</span>
                            <span className="text-sm font-bold text-slate-800">{transactions.length}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
                        <ExportButtons
                            onExportCSV={handleExportCSV}
                            onExportPDF={handleExportPDF}
                            disabled={filteredTransactions.length === 0}
                        />
                    </div>
                    <div className="flex gap-2">
                        {["All", "Credit", "Debit"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    filter === f
                                        ? "text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                                style={filter === f ? { backgroundColor: '#0066CC' } : {}}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <WalletIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Transactions</h3>
                            <p className="text-slate-500 text-sm">Your transaction history will appear here</p>
                        </div>
                    ) : (
                        filteredTransactions.map((txn) => (
                            <motion.div
                                key={txn.txnId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {getTransactionIcon(txn.txnType)}
                                        <div>
                                            <p className="font-medium text-slate-800">{txn.txnType}</p>
                                            <p className="text-sm text-slate-500">
                                                {new Date(txn.createdAt).toLocaleString()}
                                            </p>
                                            {txn.relatedLoanId && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Loan: #{txn.relatedLoanId.substring(0, 8)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-lg font-bold",
                                            txn.txnType.toLowerCase().includes("credit")
                                                ? "text-emerald-600"
                                                : "text-red-600"
                                        )}>
                                            {txn.txnType.toLowerCase().includes("credit") ? "+" : "-"}
                                            {formatCurrency(txn.amount)} {txn.currency}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Funds Modal */}
            <Modal isOpen={isAddFundsOpen} onClose={() => !isProcessing && setIsAddFundsOpen(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Add Funds</h3>
                        <button
                            onClick={() => setIsAddFundsOpen(false)}
                            disabled={isProcessing}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Amount ({wallet?.currency})
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">RWF</span>
                            <input
                                type="number"
                                value={fundAmount}
                                onChange={(e) => {
                                    setFundAmount(e.target.value);
                                    setValidationError(null);
                                }}
                                placeholder="0.00"
                                min={VALIDATION.WALLET.ADD_FUNDS.MIN}
                                max={VALIDATION.WALLET.ADD_FUNDS.MAX}
                                className={cn(
                                    "w-full pl-14 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all",
                                    validationError
                                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                        : "border-slate-200 focus:border-slate-400"
                                )}
                                style={!validationError ? { focusBorderColor: '#0066CC' } : {}}
                            />
                        </div>
                        {validationError ? (
                            <p className="text-red-500 text-sm mt-2">{validationError}</p>
                        ) : (
                            <p className="text-slate-400 text-xs mt-2">{VALIDATION.WALLET.ADD_FUNDS.LABEL}</p>
                        )}
                    </div>

                    <Button
                        onClick={handleAddFunds}
                        disabled={isProcessing || !fundAmount}
                        className="w-full"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <DollarSign className="h-5 w-5 mr-2" />
                                Add Funds
                            </>
                        )}
                    </Button>
                </div>
            </Modal>
        </div >
    );
}
