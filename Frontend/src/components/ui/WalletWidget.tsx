import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";

interface WalletData {
    balance: number;
    currency: string;
}

export function WalletWidget() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await api.getWallet();
                setWallet(response.data || response);
            } catch (error) {
                console.error("Failed to fetch wallet for widget", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">My Wallet</h3>
                        <p className="text-xs text-slate-500">Available Funds</p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-primary transition-colors">
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(wallet?.balance || 0)}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" /> +2.5%
                    </span>
                    <span className="text-xs text-slate-400">vs last month</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Link to="/wallet/deposit" className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                    <ArrowDownLeft className="h-4 w-4" /> Deposit
                </Link>
                <Link to="/wallet/withdraw" className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors">
                    <ArrowUpRight className="h-4 w-4" /> Withdraw
                </Link>
            </div>
        </div>
    );
}
