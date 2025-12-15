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
    Smartphone,
    CreditCard,
    Building,
    CheckCircle2,
    Lock
} from "lucide-react";
import api from "../services/api";
import { formatCurrency, cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
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

const PROVIDERS = [
    { id: 'Momo', name: 'MTN Mobile Money', icon: Smartphone, color: 'bg-yellow-400' },
    { id: 'Airtel', name: 'Airtel Money', icon: Smartphone, color: 'bg-red-500' },
    { id: 'BK', name: 'Bank of Kigali', icon: Building, color: 'bg-blue-600' },
    { id: 'Equity', name: 'Equity Bank', icon: Building, color: 'bg-orange-700' },
    { id: 'Visa', name: 'Visa / Mastercard', icon: CreditCard, color: 'bg-indigo-600' }
];

export default function Wallet() {
    // Data State
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"All" | "Credit" | "Debit">("All");

    // Transaction Flow State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [txnStep, setTxnStep] = useState<'SELECT' | 'INPUT' | 'OTP' | 'SUCCESS'>('SELECT');
    const [txnType, setTxnType] = useState<'Deposit' | 'Withdraw'>('Deposit');
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    // Form State
    const [amount, setAmount] = useState("");
    const [accountParams, setAccountParams] = useState({ number: "", email: "" }); // Add Email separately? No, let's auto-fill or ask
    const [otp, setOtp] = useState("");

    // Processing State
    const [currentTxnId, setCurrentTxnId] = useState<string | null>(null);
    const [demoOtp, setDemoOtp] = useState<string | null>(null); // To show user if email fails
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Auto-fill email from user profile if possible, for now we will hardcode or ask user
        // Let's assume we fetch user profile elsewhere, but for simplicity we'll just ask or use current user
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

    const handleInitiate = async () => {
        if (!amount || !selectedProvider || !accountParams.number) return;

        // Frontend Regex Validation
        const phoneRegex = /^07[2389]\d{7}$/; // Rwandese Phone: 078, 073, 072, 079 + 7 digits
        const cardRegex = /^\d{16}$/; // Visa/Mastercard: 16 digits

        if (['Momo', 'Airtel'].includes(selectedProvider)) {
            if (!phoneRegex.test(accountParams.number)) {
                setError("Invalid Phone Number. Must exist start with 07 and be 10 digits.");
                return;
            }
        } else if (['Visa', 'Equity', 'BK'].includes(selectedProvider)) {
            // Treat Equity/BK as accounts or cards for simplicity in demo
            // If strictly card:
            if (!cardRegex.test(accountParams.number)) {
                setError("Invalid Account/Card Number. Must be 16 digits.");
                return;
            }
        }

        try {
            setIsProcessing(true);
            setError(null);

            const res = await api.initiateTransaction({
                type: txnType,
                amount: parseFloat(amount),
                provider: selectedProvider,
                accountNumber: accountParams.number,
                email: accountParams.email
            });

            setCurrentTxnId(res.txnId);
            setDemoOtp(res.developmentOtp);
            setTxnStep('OTP');
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to initiate transaction");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!currentTxnId || !otp) return;

        try {
            setIsProcessing(true);
            setError(null);

            await api.confirmTransaction({
                txnId: currentTxnId,
                otp: otp
            });

            setTxnStep('SUCCESS');
            fetchWalletData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetModal = () => {
        setIsModalOpen(false);
        setTxnStep('SELECT');
        setAmount("");
        setAccountParams({ number: "", email: "" });
        setOtp("");
        setSelectedProvider(null);
        setError(null);
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
        // ... (Keep existing PDF logic columns/summary)
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

            {/* Wallet Balance & Stats Grid */}
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
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => { setTxnType('Withdraw'); setIsModalOpen(true); }}
                                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                                    size="sm"
                                >
                                    <ArrowUpRight className="h-4 w-4 mr-2" />
                                    Withdraw
                                </Button>
                                <Button
                                    onClick={() => { setTxnType('Deposit'); setIsModalOpen(true); }}
                                    className="bg-white hover:bg-white/90 shadow-lg text-[#0066CC]"
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Funds
                                </Button>
                            </div>
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

            {/* Transaction History Table */}
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

            {/* PROCESS TRANSACTION MODAL */}
            <Modal isOpen={isModalOpen} onClose={resetModal} title={`${txnType} Money`}>
                <div className="p-6">
                    {/* STEP 1: SELECT PROVIDER */}
                    {txnStep === 'SELECT' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 mb-4">Select your preferred payment gateway</p>
                            <div className="grid grid-cols-2 gap-3">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setSelectedProvider(p.id); setTxnStep('INPUT'); }}
                                        className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-[#0066CC] hover:bg-blue-50 transition-all gap-2 group"
                                    >
                                        <div className={cn("p-2 rounded-full text-white", p.color)}>
                                            <p.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-[#0066CC]">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INPUT DETAILS */}
                    {txnStep === 'INPUT' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-[#0066CC] font-medium bg-blue-50 p-2 rounded-lg mb-2">
                                <span className={cn("w-2 h-2 rounded-full", PROVIDERS.find(p => p.id === selectedProvider)?.color)}></span>
                                Using {PROVIDERS.find(p => p.id === selectedProvider)?.name}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (RWF)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0066CC] outline-none"
                                    placeholder="5000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (For OTP)</label>
                                <input
                                    type="email"
                                    value={accountParams.email}
                                    onChange={e => setAccountParams({ ...accountParams, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0066CC] outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {selectedProvider === 'Visa' ? 'Card Number' : 'Phone Number'}
                                </label>
                                <input
                                    type="text"
                                    value={accountParams.number}
                                    onChange={e => setAccountParams({ ...accountParams, number: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0066CC] outline-none"
                                    placeholder={selectedProvider === 'Visa' ? '1234 5678 9012 3456' : '078...'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (For OTP)</label>
                                <input
                                    type="email"
                                    value={accountParams.email}
                                    onChange={e => setAccountParams({ ...accountParams, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0066CC] outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs">{error}</p>}

                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="w-full" onClick={() => setTxnStep('SELECT')}>Back</Button>
                                <Button className="w-full" onClick={handleInitiate} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Continue'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: OTP VERIFICATION */}
                    {txnStep === 'OTP' && (
                        <div className="space-y-4 text-center">
                            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <Lock className="h-6 w-6 text-[#0066CC]" />
                            </div>
                            <h3 className="text-lg font-bold">Verify Transaction</h3>
                            <p className="text-sm text-slate-500">
                                Enter the code sent to {accountParams.email}.<br />
                                <span className="text-xs text-slate-400">(Demo: {demoOtp})</span>
                            </p>

                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0066CC] outline-none"
                                placeholder="000 000"
                                maxLength={6}
                            />

                            {error && <p className="text-red-500 text-xs">{error}</p>}

                            <Button className="w-full" onClick={handleConfirm} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Confirm Payment'}
                            </Button>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {txnStep === 'SUCCESS' && (
                        <div className="space-y-4 text-center pt-4">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-slate-800">Payment Successful!</h3>
                            <p className="text-slate-500 text-sm">
                                Your {txnType.toLowerCase()} of {formatCurrency(parseFloat(amount))} RWF was processed.
                            </p>
                            <Button className="w-full bg-slate-900" onClick={resetModal}>
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
