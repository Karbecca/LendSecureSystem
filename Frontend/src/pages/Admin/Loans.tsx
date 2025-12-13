import { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle, Eye, Calendar, DollarSign, FileText } from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Modal } from "../../components/ui/Modal";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

interface Loan {
    loanId: string;
    borrowerName: string;
    amountRequested: number;
    currency: string;
    purpose: string;
    termMonths: number;
    interestRate: number;
    status: "Pending" | "Approved" | "Funded" | "Rejected" | "Paid";
    createdAt: string;
}

export default function LoanManagement() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchLoans();
    }, []);

    useEffect(() => {
        let result = loans;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(l =>
                l.borrowerName.toLowerCase().includes(lowerTerm) ||
                l.purpose.toLowerCase().includes(lowerTerm)
            );
        }

        if (statusFilter !== "All") {
            result = result.filter(l => l.status === statusFilter);
        }

        setFilteredLoans(result);
    }, [loans, searchTerm, statusFilter]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await api.getLoans();
            setLoans(response);
            setFilteredLoans(response);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const initiateAction = (loan: Loan, type: "approve" | "reject") => {
        setSelectedLoan(loan);
        setActionType(type);
        setIsConfirmOpen(true);
    };

    const executeAction = async () => {
        if (!selectedLoan || !actionType) return;

        try {
            setIsProcessing(true);
            if (actionType === "approve") {
                await api.approveLoan(selectedLoan.loanId);
                await fetchLoans();
            } else {
                await api.rejectLoan(selectedLoan.loanId);
                await fetchLoans();
            }
            setIsConfirmOpen(false);
            if (isViewOpen) setIsViewOpen(false);
            setSelectedLoan(null);
            setActionType(null);
        } catch (err) {
            console.error(err);
            alert(`Failed to ${actionType} loan`);
        } finally {
            setIsProcessing(false);
        }
    };

    const openDetails = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsViewOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Loan Management</h1>
                    <p className="text-text-secondary">Review and manage loan applications</p>
                </div>
                <Button variant="outline" onClick={fetchLoans}>Refresh</Button>
            </div>

            <Card className="p-6 border-none shadow-soft">

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by borrower or purpose..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0">
                        {["All", "Pending", "Approved", "Funded", "Rejected", "Paid"].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${statusFilter === status
                                    ? "bg-primary text-white"
                                    : "bg-surface-muted text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-surface-border">
                                <th className="pb-3 text-sm font-semibold text-slate-500 pl-4">Borrower</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500">Amount</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500">Terms</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500">Date</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">Loading loans...</td>
                                </tr>
                            ) : filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">No loans found.</td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan) => (
                                    <tr key={loan.loanId} className="group hover:bg-surface-muted transition-colors">
                                        <td className="py-4 pl-4">
                                            <div>
                                                <p className="font-medium text-slate-800">{loan.borrowerName}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[150px]">{loan.purpose}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 font-medium text-slate-700">
                                            {formatCurrency(loan.amountRequested)}
                                        </td>
                                        <td className="py-4 text-sm text-slate-600">
                                            {loan.termMonths} mos @ {loan.interestRate}%
                                        </td>
                                        <td className="py-4">
                                            <Badge variant={
                                                loan.status === 'Pending' ? 'warning' :
                                                    loan.status === 'Approved' ? 'success' :
                                                        loan.status === 'Rejected' ? 'destructive' : 'default'
                                            }>
                                                {loan.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm text-slate-600">
                                            {formatDate(loan.createdAt)}
                                        </td>
                                        <td className="py-4 pr-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {loan.status === 'Pending' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => initiateAction(loan, "approve")}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => initiateAction(loan, "reject")}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDetails(loan)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>


            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeAction}
                title={actionType === "approve" ? "Approve Loan" : "Reject Loan"}
                message={`Are you sure you want to ${actionType} this loan request?`}
                confirmLabel={actionType === "approve" ? "Yes, Approve Loan" : "Yes, Reject Loan"}
                type={actionType === "approve" ? "success" : "danger"}
                isLoading={isProcessing}
            />

            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Loan Application Details"
            >
                {selectedLoan && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{selectedLoan.borrowerName}</h3>
                                <p className="text-slate-500 text-sm">Application ID: {selectedLoan.loanId}</p>
                            </div>
                            <Badge variant={
                                selectedLoan.status === 'Pending' ? 'warning' :
                                    selectedLoan.status === 'Approved' ? 'success' :
                                        selectedLoan.status === 'Rejected' ? 'destructive' : 'default'
                            }>
                                {selectedLoan.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">Amount</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(selectedLoan.amountRequested)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">Duration</span>
                                </div>
                                <p className="text-xl font-bold text-slate-900">{selectedLoan.termMonths} Months</p>
                                <p className="text-xs text-slate-500 mt-1">@ {selectedLoan.interestRate}% Interest</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                <FileText className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase">Purpose</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed">
                                {selectedLoan.purpose}
                            </p>
                        </div>

                        <div className="pt-2 text-xs text-slate-400 text-right">
                            Applied on {formatDate(selectedLoan.createdAt)}
                        </div>

                        {selectedLoan.status === "Pending" && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => initiateAction(selectedLoan, "reject")}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                    Reject Application
                                </Button>
                                <Button
                                    onClick={() => initiateAction(selectedLoan, "approve")}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Approve Application
                                </Button>
                            </div>
                        )}

                        {selectedLoan.status !== "Pending" && (
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
