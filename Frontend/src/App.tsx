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

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Dashboard Routes */}
                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/loans" element={<MyLoans />} />
                            <Route path="/loans/create" element={<RequestLoan />} />
                            <Route path="/repayments" element={<Repayments />} />
                            <Route path="/kyc" element={<KycVerification />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    )
}

export default App
