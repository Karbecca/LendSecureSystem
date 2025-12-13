import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    Loader2,
    ArrowLeft,
    Wallet,
    AlertCircle
} from "lucide-react";
import api from "../services/api";
import { formatCurrency, cn } from "../lib/utils";
import { Button } from "../components/ui/Button";

interface Repayment {
    repaymentId: string;
    loanId: string;
    scheduledDate: string;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    lateFee: number;
    status: string;
    paidAt?: string;
}

export default function RepaymentSchedule() {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [confirmPayment, setConfirmPayment] = useState<{ repaymentId: string; amount: number } | null>(null);

    useEffect(() => {
        if (loanId) {
            fetchData();
        }
    }, [loanId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [repaymentsData, walletData] = await Promise.all([
                api.getLoanRepayments(loanId!),
                api.getWallet()
            ]);

            const repaymentsList = Array.isArray(repaymentsData) ? repaymentsData : repaymentsData.data || [];
            setRepayments(repaymentsList);

            const wallet = walletData.data || walletData;
            setWalletBalance(wallet.balance || 0);
        } catch (error) {
            console.error("Failed to fetch repayment schedule", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async (repaymentId: string, amount: number) => {
        if (walletBalance < amount) {
            alert(`Insufficient balance. You need ${formatCurrency(amount)} but only have ${formatCurrency(walletBalance)}`);
            return;
        }

        // Show confirmation modal
        setConfirmPayment({ repaymentId, amount });
    };

    const confirmPaymentAction = async () => {
        if (!confirmPayment) return;

        try {
            setPayingId(confirmPayment.repaymentId);
            setConfirmPayment(null);
            await api.makePayment({ repaymentId: confirmPayment.repaymentId });
            fetchData(); // Refresh data
        } catch (error: any) {
            console.error("Payment failed", error);
            alert(error.response?.data?.message || "Payment failed");
        } finally {
            setPayingId(null);
        }
    };

    const paidCount = repayments.filter(r => r.status === "Paid").length;
    const totalRepayment = repayments.reduce((sum, r) => sum + r.totalAmount, 0);
    const paidAmount = repayments.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.totalAmount, 0);

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
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Repayment Schedule</h1>
                    <p className="text-slate-500 text-sm mt-1">Loan #{loanId?.substring(0, 8)}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-50 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-slate-500 text-sm">Progress</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{paidCount} / {repayments.length}</p>
                    <p className="text-slate-500 text-xs mt-1">Installments paid</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-slate-500 text-sm">Total Repayment</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalRepayment)} RWF</p>
                    <p className="text-slate-500 text-xs mt-1">Paid: {formatCurrency(paidAmount)} RWF</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Wallet className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-slate-500 text-sm">Wallet Balance</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(walletBalance)} RWF</p>
                    <button
                        onClick={() => navigate('/wallet')}
                        className="text-blue-600 text-xs mt-1 hover:underline"
                    >
                        Add funds →
                    </button>
                </motion.div>
            </div>

            {/* Repayment Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Payment Schedule</h3>
                    <p className="text-slate-500 text-sm mt-1">{repayments.length} monthly installments</p>
                </div>

                <div className="divide-y divide-slate-100">
                    {repayments.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Schedule</h3>
                            <p className="text-slate-500 text-sm">Repayment schedule will be generated when loan is fully funded</p>
                        </div>
                    ) : (
                        repayments.map((repayment, index) => {
                            const dueDate = new Date(repayment.scheduledDate);
                            const isOverdue = repayment.status === "Pending" && dueDate < new Date();
                            const isPaid = repayment.status === "Paid";
                            const canPay = repayment.status === "Pending" && walletBalance >= repayment.totalAmount;

                            return (
                                <motion.div
                                    key={repayment.repaymentId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "p-6",
                                        isPaid ? "bg-emerald-50/50" : isOverdue ? "bg-red-50/50" : ""
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-xl",
                                                isPaid ? "bg-emerald-100" : isOverdue ? "bg-red-100" : "bg-slate-100"
                                            )}>
                                                {isPaid ? (
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                                ) : isOverdue ? (
                                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                                ) : (
                                                    <Clock className="h-6 w-6 text-slate-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">Month {index + 1} Payment</p>
                                                <p className="text-sm text-slate-500">
                                                    Due: {dueDate.toLocaleDateString()}
                                                    {isPaid && repayment.paidAt && (
                                                        <span className="text-emerald-600 ml-2">
                                                            • Paid on {new Date(repayment.paidAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {isOverdue && <span className="text-red-600 ml-2">• Overdue</span>}
                                                </p>
                                                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                                    <span>Principal: {formatCurrency(repayment.principalAmount)} RWF</span>
                                                    <span>Interest: {formatCurrency(repayment.interestAmount)} RWF</span>
                                                    {repayment.lateFee > 0 && (
                                                        <span className="text-red-600 font-bold">
                                                            Late Fee: {formatCurrency(repayment.lateFee)} RWF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-slate-800">
                                                    {formatCurrency(repayment.totalAmount)} RWF
                                                </p>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-bold",
                                                    isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {repayment.status}
                                                </span>
                                            </div>
                                            {!isPaid && (
                                                <Button
                                                    onClick={() => handlePayment(repayment.repaymentId, repayment.totalAmount)}
                                                    disabled={!canPay || payingId === repayment.repaymentId}
                                                    variant={canPay ? "default" : "outline"}
                                                    className="min-w-[100px]"
                                                >
                                                    {payingId === repayment.repaymentId ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Paying...
                                                        </>
                                                    ) : canPay ? (
                                                        "Pay Now"
                                                    ) : (
                                                        "Insufficient"
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Payment Confirmation Modal */}
            {confirmPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="text-center mb-6">
                            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Payment</h3>
                            <p className="text-slate-600">
                                Are you sure you want to make this payment?
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600">Amount:</span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    {formatCurrency(confirmPayment.amount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Wallet Balance:</span>
                                <span className="font-medium text-slate-700">
                                    {formatCurrency(walletBalance)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmPayment(null)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPaymentAction}
                                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
