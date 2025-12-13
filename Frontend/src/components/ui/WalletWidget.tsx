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
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-lg">
                <Skeleton variant="text" width="40%" className="mb-2 bg-white/20" />
                <Skeleton variant="text" width="60%" height={40} className="mb-4 bg-white/20" />
                <div className="space-y-2">
                    <Skeleton variant="rectangular" height={40} className="bg-white/20" />
                    <Skeleton variant="rectangular" height={40} className="bg-white/20" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" />
                    <h3 className="font-semibold">Wallet Balance</h3>
                </div>
                <Link
                    to="/wallet"
                    className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                    View All <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Balance */}
            <div className="mb-6">
                <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                <p className="text-white/70 text-sm mt-1">Available balance</p>
            </div>

            {/* Add Funds Button */}
            <Link
                to="/wallet"
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mb-4"
            >
                <Plus className="h-4 w-4" />
                Add Funds
            </Link>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-3">
                        Recent Activity
                    </p>
                    {transactions.map((tx) => {
                        const isCredit = tx.type?.toLowerCase().includes('credit') || false;
                        return (
                            <div
                                key={tx.transactionId}
                                className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3"
                            >
                                <div className="flex items-center gap-2">
                                    {isCredit ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-300" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-300" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">{tx.type || 'Transaction'}</p>
                                        <p className="text-xs text-white/60">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className={`font-bold ${isCredit ? 'text-emerald-300' : 'text-red-300'}`}>
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
