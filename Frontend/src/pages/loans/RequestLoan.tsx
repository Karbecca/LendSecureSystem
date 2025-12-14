import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar,
    Info,
    ArrowRight,
    Calculator,
    AlertCircle,
    Loader2
} from "lucide-react";
import api from "../../services/api";
import { formatCurrency, cn } from "../../lib/utils";
import { VALIDATION, validateLoanAmount, validateLoanTerm, validateInterestRate, validatePurpose, getErrorMessage } from "../../lib/validation";

export default function RequestLoan() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{
        amount?: string;
        term?: string;
        interest?: string;
        purpose?: string;
    }>({});

    // Form State - using strings for empty display
    const [amount, setAmount] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [interestRate, setInterestRate] = useState<string>("");
    const [purpose, setPurpose] = useState<string>("");

    // Calculated State
    const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [totalRepayment, setTotalRepayment] = useState<number>(0);

    // Calculation Logic
    useEffect(() => {
        const principal = parseFloat(amount) || 0;
        const rate = (parseFloat(interestRate) || 0) / 100 / 12; // Monthly rate
        const months = parseFloat(duration) || 0;

        let monthly = 0;
        if (months > 0) {
            if (rate === 0) {
                monthly = principal / months;
            } else {
                monthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
            }
        }

        const total = monthly * months;
        const interest = total - principal;

        setMonthlyPayment(isNaN(monthly) ? 0 : monthly);
        setTotalRepayment(isNaN(total) ? 0 : total);
        setTotalInterest(isNaN(interest) ? 0 : interest);

    }, [amount, duration, interestRate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});

        // Validate all fields
        const errors: any = {};
        const amountNum = parseFloat(amount) || 0;
        const durationNum = parseFloat(duration) || 0;
        const interestNum = parseFloat(interestRate) || 0;

        const amountError = validateLoanAmount(amountNum);
        const termError = validateLoanTerm(durationNum);
        const interestError = validateInterestRate(interestNum);
        const purposeError = validatePurpose(purpose);

        if (amountError) errors.amount = amountError;
        if (termError) errors.term = termError;
        if (interestError) errors.interest = interestError;
        if (purposeError) errors.purpose = purposeError;

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError("Please fix the errors below before submitting.");
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/loans", {
                amount: amountNum,
                termMonths: durationNum,
                purpose: purpose,
                interestRate: interestNum
            });

            // On success, redirect to dashboard or loans list
            navigate("/loans");
        } catch (err: any) {
            console.error("Loan Request Failed", err);
            setError(getErrorMessage(err));
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

            <div className="space-y-8">
                {/* Configuration Form */}
                <motion.div
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm">
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Input Grid - 2 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Amount Input */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Loan Amount (RWF)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">RWF</span>
                                    <input
                                        type="number"
                                        min={VALIDATION.LOAN.AMOUNT.MIN}
                                        max={VALIDATION.LOAN.AMOUNT.MAX}
                                        step="1000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        className={cn(
                                            "w-full pl-14 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-bold text-slate-700",
                                            validationErrors.amount
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-slate-200 focus:border-slate-400"
                                        )}
                                    />
                                </div>
                                {validationErrors.amount ? (
                                    <p className="text-red-500 text-sm">{validationErrors.amount}</p>
                                ) : (
                                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                                        <span>Min: {formatCurrency(VALIDATION.LOAN.AMOUNT.MIN)}</span>
                                        <span>Max: {formatCurrency(VALIDATION.LOAN.AMOUNT.MAX)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Duration Input */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Duration (Months)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="number"
                                        min={VALIDATION.LOAN.TERM.MIN}
                                        max={VALIDATION.LOAN.TERM.MAX}
                                        step="1"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        placeholder="0"
                                        className={cn(
                                            "w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-bold text-slate-700",
                                            validationErrors.term
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-slate-200 focus:border-slate-400"
                                        )}
                                    />
                                </div>
                                {validationErrors.term ? (
                                    <p className="text-red-500 text-sm">{validationErrors.term}</p>
                                ) : (
                                    <div className="text-xs text-slate-400 font-medium">{VALIDATION.LOAN.TERM.LABEL}</div>
                                )}
                            </div>

                            {/* Interest Rate Input */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Interest Rate (%)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    <input
                                        type="number"
                                        min={VALIDATION.LOAN.INTEREST.MIN}
                                        max={VALIDATION.LOAN.INTEREST.MAX}
                                        step="0.5"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(e.target.value)}
                                        placeholder="0"
                                        className={cn(
                                            "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-bold text-slate-700",
                                            validationErrors.interest
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-slate-200 focus:border-slate-400"
                                        )}
                                    />
                                </div>
                                {validationErrors.interest ? (
                                    <p className="text-red-500 text-sm">{validationErrors.interest}</p>
                                ) : (
                                    <p className="text-xs text-slate-400">{VALIDATION.LOAN.INTEREST.LABEL}</p>
                                )}
                            </div>
                        </div>

                        {/* Purpose Input - Full Width */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Loan Purpose</label>
                            <div className="relative">
                                <Info className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                <textarea
                                    placeholder="E.g., Business expansion, Home renovation..."
                                    className={cn(
                                        "w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium min-h-[100px]",
                                        validationErrors.purpose
                                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-slate-200 focus:border-slate-400"
                                    )}
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    maxLength={VALIDATION.LOAN.PURPOSE.MAX_LENGTH}
                                />
                            </div>
                            {validationErrors.purpose ? (
                                <p className="text-red-500 text-sm">{validationErrors.purpose}</p>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    {purpose.length}/{VALIDATION.LOAN.PURPOSE.MAX_LENGTH} characters (min {VALIDATION.LOAN.PURPOSE.MIN_LENGTH})
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#0066CC', boxShadow: '0 10px 25px -5px rgba(0, 102, 204, 0.3)' }}
                        >
                            {isLoading ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                            ) : (
                                <>Submit Application <ArrowRight className="h-5 w-5" /></>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Summary / Calculator Widget - Now at Bottom */}
                <motion.div
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 max-w-2xl mx-auto"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#0066CC' }}>
                            <Calculator className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Loan Summary</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="pb-4 border-b border-slate-200">
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Monthly Payment</p>
                            <p className="text-2xl font-bold" style={{ color: '#0066CC' }}>{formatCurrency(monthlyPayment)}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Principal Amount</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(parseFloat(amount) || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Interest</span>
                                <span className="font-semibold text-red-600">+{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-slate-700 font-medium">Total Repayment</span>
                                <span className="text-lg font-bold text-slate-800">{formatCurrency(totalRepayment)}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg mt-4">
                            <p className="text-xs text-slate-500 leading-relaxed">
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
