import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Public/Landing'
import Login from './pages/Public/Login'
import Register from './pages/Public/Register'

// Borrower/Lender Pages
import Dashboard from './pages/Borrower/Dashboard'
import MyLoans from './pages/loans/MyLoans'
import RequestLoan from './pages/loans/RequestLoan'
import Repayments from './pages/repayments/Repayments'
import KycVerification from './pages/kyc/KycVerification'
import Settings from './pages/settings/Settings'
import Wallet from './pages/Wallet'
import RepaymentSchedule from './pages/RepaymentSchedule'

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard'
import UserManagement from './pages/Admin/Users'
import LoanManagement from './pages/Admin/Loans'
import AuditLogs from './pages/Admin/AuditLogs'
import KycManagement from './pages/Admin/KycManagement'

import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'
import { AuthProvider } from './context/AuthContext'
import { RoleGuard } from './components/auth/RoleGuard'

import { ErrorBoundary } from './components/ErrorBoundary'

// Lender Pages
import LenderDashboard from './pages/Lender/LenderDashboard'
import BrowseLoans from './pages/Lender/BrowseLoans'
import MyInvestments from './pages/Lender/MyInvestments'
import LenderRepayments from './pages/Lender/LenderRepayments'
import ViewAuditLog from './pages/Lender/ViewAuditLog'

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Admin Routes */}
                        <Route element={
                            <RoleGuard allowedRoles={['Admin']}>
                                <AdminLayout />
                            </RoleGuard>
                        }>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/loans" element={<LoanManagement />} />
                            <Route path="/admin/audit" element={<AuditLogs />} />
                            <Route path="/admin/kyc" element={<KycManagement />} />
                            <Route path="/admin/settings" element={<Settings />} />
                        </Route>

                        {/* Borrower/Lender Routes */}
                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/wallet" element={<Wallet />} />
                            <Route path="/loans" element={<MyLoans />} />
                            <Route path="/loans/create" element={<RequestLoan />} />
                            <Route path="/repayments" element={<Repayments />} />
                            <Route path="/repayments/schedule/:loanId" element={<RepaymentSchedule />} />
                            <Route path="/kyc" element={<KycVerification />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        {/* Protected Dashboard Routes - Lender */}
                        <Route element={<DashboardLayout />}>
                            <Route path="/lender" element={<LenderDashboard />} />
                            <Route path="/lender/wallet" element={<Wallet />} />
                            <Route path="/lender/loans" element={<BrowseLoans />} />
                            <Route path="/lender/investments" element={<MyInvestments />} />
                            <Route path="/lender/repayments" element={<LenderRepayments />} />
                            <Route path="/lender/audit-log" element={<ViewAuditLog />} />
                            <Route path="/lender/kyc" element={<KycVerification />} />
                            <Route path="/lender/settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    )
}

export default App

