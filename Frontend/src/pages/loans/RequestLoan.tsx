import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CreditCard,
    Calendar,
    DollarSign,
    Info,
    ArrowRight,
    Calculator,
    AlertCircle,
    Loader2
} from "lucide-react";
import api from "../../services/api";
import { formatCurrency, cn } from "../../lib/utils";

export default function RequestLoan() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [amount, setAmount] = useState<number>(50000); // Default 50k
    const [duration, setDuration] = useState<number>(12); // Default 12 months
    const [interestRate, setInterestRate] = useState<number>(12); // Default 12%
    const [purpose, setPurpose] = useState<string>("");

    // Calculated State
    const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [totalRepayment, setTotalRepayment] = useState<number>(0);

    // Calculation Logic
    useEffect(() => {
        const principal = amount;
        const rate = interestRate / 100 / 12; // Monthly rate
        const months = duration;

        let monthly = 0;
        if (rate === 0) {
            monthly = principal / months;
        } else {
            monthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
        }

        const total = monthly * months;
        const interest = total - principal;

        setMonthlyPayment(monthly);
        setTotalRepayment(total);
        setTotalInterest(interest);

    }, [amount, duration, interestRate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!purpose.trim()) {
            setError("Please provide a purpose for the loan.");
            setIsLoading(false);
            return;
        }

        try {
            await api.post("/loans", {
                amount: amount,
                termMonths: duration,
                purpose: purpose,
                interestRate: interestRate
            });

            // On success, redirect to dashboard or loans list
            navigate("/loans");
        } catch (err: any) {
            console.error("Loan Request Failed", err);
            setError(err.response?.data?.message || "Failed to submit loan request. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 inline-flex items-center">
                    <ArrowRight className="h-4 w-4 rotate-180 mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 mt-2">Request New Loan</h1>
                <p className="text-slate-500 mt-1">Configure your loan amount and duration.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Form */}
                <motion.div
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm">
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Amount Input */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Loan Amount (RWF)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">RWF</span>
                                <input
                                    type="number"
                                    min="1000"
                                    max="1000000"
                                    step="1000"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-medium">
                                <span>Min: {formatCurrency(1000)}</span>
                                <span>Max: {formatCurrency(1000000)}</span>
                            </div>
                        </div>

                        {/* Duration Input */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Duration (Months)</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    step="1"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div className="text-xs text-slate-400 font-medium">1 - 60 Months</div>
                        </div>

                        {/* Interest Rate Input */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Interest Rate (%)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-700"
                                />
                            </div>
                            <p className="text-xs text-slate-400">Typical range: 3% - 10%</p>
                        </div>

                        {/* Purpose Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Loan Purpose</label>
                            <div className="relative">
                                <Info className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="E.g., Business expansion, Home renovation..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    required
                                    autoFocus // Helps with typing immediately
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                            ) : (
                                <>Submit Application <ArrowRight className="h-5 w-5" /></>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Summary / Calculator Widget */}
                <motion.div
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 text-white rounded-2xl p-8 h-fit sticky top-24 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-primary p-3 rounded-xl border border-white/10 shadow-inner">
                            <Calculator className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">Loan Summary</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="pb-6 border-b border-white/10">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Monthly Payment</p>
                            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(monthlyPayment)}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Principal Amount</span>
                                <span className="font-semibold">{formatCurrency(amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Interest</span>
                                <span className="font-semibold text-rose-300">+{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-slate-300 font-medium">Total Repayment</span>
                                <span className="text-lg font-bold text-white">{formatCurrency(totalRepayment)}</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl mt-6">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <Info className="h-3 w-3 inline-block mr-1" />
                                This is an estimate. Final terms may vary based on your credit profile and approval.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
