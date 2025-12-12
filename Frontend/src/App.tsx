import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Public/Landing'
import Login from './pages/Public/Login'
import Register from './pages/Public/Register'
import Dashboard from './pages/Borrower/Dashboard'
import MyLoans from './pages/loans/MyLoans'
import RequestLoan from './pages/loans/RequestLoan'
import Repayments from './pages/repayments/Repayments'
import KycVerification from './pages/kyc/KycVerification'
import Settings from './pages/settings/Settings'
import DashboardLayout from './components/layout/DashboardLayout'
import { AuthProvider } from './context/AuthContext'

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

                        {/* Protected Dashboard Routes - Borrower */}
                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/loans" element={<MyLoans />} />
                            <Route path="/loans/create" element={<RequestLoan />} />
                            <Route path="/repayments" element={<Repayments />} />
                            <Route path="/kyc" element={<KycVerification />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        {/* Protected Dashboard Routes - Lender */}
                        <Route element={<DashboardLayout />}>
                            <Route path="/lender" element={<LenderDashboard />} />
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

