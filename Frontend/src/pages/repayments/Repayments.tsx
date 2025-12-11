import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Wallet,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Loader2,
    ChevronRight
} from "lucide-react";
import api from "../../services/api";
import { formatCurrency, cn } from "../../lib/utils";

interface Repayment {
    repaymentId: string;
    loanId: string;
    totalAmount: number;
    principalAmount: number;
    interestAmount: number;
    scheduledDate: string;
    status: "Pending" | "Paid" | "Overdue";
    paidAt?: string;
}

export default function Repayments() {
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paying, setPaying] = useState<string | null>(null);

    const handlePayment = async (repaymentId: string) => {
        if (!confirm("Are you sure you want to make this payment? Funds will be deducted from your wallet.")) return;

        setPaying(repaymentId);
        try {
            await api.makePayment({ repaymentId });
            // Refresh logic
            const response = await api.getMyRepayments();
            const data = Array.isArray(response) ? response : response.data.data || response.data || [];
            setRepayments(data);
            alert("Payment successful!");
        } catch (error: any) {
            console.error("Payment failed", error);
            alert(error.response?.data?.message || "Payment failed. Please check your wallet balance.");
        } finally {
            setPaying(null);
        }
    };

    useEffect(() => {
        const fetchRepayments = async () => {
            try {
                const response = await api.getMyRepayments();
                const data = Array.isArray(response) ? response : response.data.data || response.data || [];
                setRepayments(data);
            } catch (error) {
                console.error("Failed to fetch repayments", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRepayments();
    }, []);

    // Computed Stats
    const totalRepaid = repayments
        .filter(r => r.status === "Paid")
        .reduce((sum, r) => sum + r.totalAmount, 0);

    const nextDue = repayments
        .filter(r => r.status === "Pending")
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0];

    // Separate history
    const history = repayments.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="show"
            animate="show"
            className="space-y-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Repayments</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your upcoming installments and payment history.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Next Payment Card */}
                <motion.div variants={item} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-slate-300 font-medium text-sm">Next Payment Due</span>
                        </div>
                        {nextDue ? (
                            <>
                                <h3 className="text-3xl font-bold mb-1">{formatCurrency(nextDue.totalAmount)}</h3>
                                <p className="text-slate-400 text-sm mb-4">Due on {new Date(nextDue.scheduledDate).toLocaleDateString()}</p>
                                <button
                                    onClick={() => handlePayment(nextDue.repaymentId)}
                                    disabled={paying === nextDue.repaymentId}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {paying === nextDue.repaymentId ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pay Now <ArrowUpRight className="h-4 w-4" /></>}
                                </button>
                            </>
                        ) : (
                            <div className="py-4">
                                <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" /> All Caught Up!
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">No pending payments.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Total Repaid Card */}
                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-slate-500 font-medium text-sm">Total Repaid</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalRepaid)}</h3>
                    <p className="text-emerald-600 text-xs font-semibold mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-full">
                        Lifetime Contribution
                    </p>
                </motion.div>

                {/* Remaining Balance (Placeholder logic) Card */}
                <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Wallet className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-slate-500 font-medium text-sm">Total Outstanding</span>
                    </div>
                    {/* Sum of all pending */}
                    <h3 className="text-3xl font-bold text-slate-800">
                        {formatCurrency(repayments.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.totalAmount, 0))}
                    </h3>
                    <p className="text-blue-600 text-xs font-semibold mt-2 bg-blue-50 inline-block px-2 py-1 rounded-full">
                        Principal + Interest
                    </p>
                </motion.div>
            </div>

            {/* Schedule List */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Payment Schedule</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No repayment history found.
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.repaymentId} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border",
                                        item.status === 'Paid' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                            item.status === 'Overdue' ? "bg-red-50 border-red-100 text-red-600" :
                                                "bg-slate-50 border-slate-200 text-slate-500"
                                    )}>
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Installment Payment</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Calendar className="h-3 w-3" />
                                            Due {new Date(item.scheduledDate).toLocaleDateString()}
                                            {item.paidAt && <span className="text-emerald-600 ml-2">• Paid on {new Date(item.paidAt).toLocaleDateString()}</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pl-14 md:pl-0">
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800">{formatCurrency(item.totalAmount)}</p>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            item.status === 'Paid' ? "text-emerald-500" :
                                                item.status === 'Overdue' ? "text-red-500" :
                                                    "text-amber-500"
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>

                                    {item.status === 'Pending' && (
                                        <button
                                            onClick={() => handlePayment(item.repaymentId)}
                                            disabled={paying === item.repaymentId}
                                            className="bg-white border border-slate-200 text-primary font-bold text-xs hover:bg-primary hover:text-white border-primary p-2 px-4 rounded-lg transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {paying === item.repaymentId ? <Loader2 className="h-3 w-3 animate-spin" /> : "Pay"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
