import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet as WalletIcon, Plus, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";
import { Skeleton } from "./Skeleton";

interface Transaction {
    transactionId: string;
    type: string;
    amount: number;
    createdAt: string;
}

export function WalletWidget() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [walletData, transactionsData] = await Promise.all([
                api.getWallet(),
                api.getWalletTransactions()
            ]);

            const wallet = walletData.data || walletData;
            setBalance(wallet.balance || 0);

            const txList = Array.isArray(transactionsData) ? transactionsData : transactionsData.data || [];
            setTransactions(txList.slice(0, 3)); // Last 3 transactions
        } catch (error) {
            console.error("Failed to fetch wallet data", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <Skeleton className="mb-2 bg-slate-200 h-4 w-2/5" />
                <Skeleton className="mb-4 bg-slate-200 h-10 w-3/5" />
                <div className="space-y-2">
                    <Skeleton className="bg-slate-200 h-10" />
                    <Skeleton className="bg-slate-200 h-10" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" style={{ color: '#0066CC' }} />
                    <h3 className="font-semibold text-slate-900">Wallet Balance</h3>
                </div>
                <Link
                    to="/wallet"
                    className="hover:opacity-80 transition-colors text-sm flex items-center gap-1"
                    style={{ color: '#0066CC' }}
                >
                    View All <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Balance */}
            <div className="mb-6">
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(balance)}</p>
                <p className="text-slate-500 text-sm mt-1">Available balance</p>
            </div>

            {/* Add Funds Button */}
            <Link
                to="/wallet"
                className="w-full text-white px-4 py-3 rounded-xl font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2 mb-4"
                style={{ backgroundColor: '#0066CC' }}
            >
                <Plus className="h-4 w-4" />
                Add Funds
            </Link>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
                        Recent Activity
                    </p>
                    {transactions.map((tx) => {
                        const isCredit = tx.type?.toLowerCase().includes('credit') || false;
                        return (
                            <div
                                key={tx.transactionId}
                                className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200"
                            >
                                <div className="flex items-center gap-2">
                                    {isCredit ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{tx.type || 'Transaction'}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className={`font-bold ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
