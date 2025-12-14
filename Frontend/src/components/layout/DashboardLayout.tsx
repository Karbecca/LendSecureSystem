import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    Wallet,
    FileText,
    CreditCard,
    ShieldCheck,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    PiggyBank,
    TrendingUp,
    DollarSign
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Check if we're on lender routes
    const isLenderRoute = location.pathname.startsWith('/lender');

    // Borrower navigation
    const borrowerNavigation = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Wallet", href: "/wallet", icon: Wallet },
        { name: "My Loans", href: "/loans", icon: FileText },
        { name: "Request Loan", href: "/loans/create", icon: CreditCard },
        { name: "Repayments", href: "/repayments", icon: DollarSign },
        { name: "KYC Verification", href: "/kyc", icon: ShieldCheck },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    // Lender navigation
    const lenderNavigation = [
        { name: "Dashboard", href: "/lender", icon: LayoutDashboard },
        { name: "Wallet", href: "/lender/wallet", icon: Wallet },
        { name: "Browse Loans", href: "/lender/loans", icon: Search },
        { name: "My Investments", href: "/lender/investments", icon: PiggyBank },
        { name: "Repayments", href: "/lender/repayments", icon: TrendingUp },
        { name: "Audit Log", href: "/lender/audit-log", icon: FileText },
        { name: "KYC Verification", href: "/lender/kyc", icon: ShieldCheck },
        { name: "Settings", href: "/lender/settings", icon: Settings },
    ];

    // Choose navigation based on route
    const navigation = isLenderRoute ? lenderNavigation : borrowerNavigation;
    const menuLabel = isLenderRoute ? "Lender" : "Menu";


    return (
        <div className="min-h-screen bg-surface-muted flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 text-white fixed h-full z-20 shadow-xl" style={{ background: 'linear-gradient(to bottom, #0F2A44, #0a1d30)' }}>
                <div className="p-6 flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", isLenderRoute ? "bg-indigo-600" : "bg-primary")}>
                        {isLenderRoute ? <DollarSign className="h-6 w-6 text-white" /> : <ShieldCheck className="h-6 w-6 text-white" />}
                    </div>
                    <span className="text-xl font-bold tracking-tight">LendSecure</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{menuLabel}</p>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm",
                                    isActive
                                        ? isLenderRoute
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-extrabold border-l-4 border-white"
                                            : "bg-primary text-white shadow-lg shadow-primary/20 font-extrabold border-l-4 border-white"
                                        : "text-slate-300 hover:bg-white/10 hover:text-white font-medium"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>

                    <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border",
                            isLenderRoute
                                ? "bg-indigo-600/20 text-indigo-400 border-indigo-600/30"
                                : "bg-primary/20 text-primary border-primary/30"
                        )}>
                            {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || "S"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{isLenderRoute ? "Lender" : user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 text-white z-40 transform transition-transform duration-300 lg:translate-x-0 shadow-xl",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
            )} style={{ background: 'linear-gradient(to bottom, #0F2A44, #0a1d30)' }}>
                <div className="p-6 flex items-center justify-between">
                    <span className="text-xl font-bold">LendSecure</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6" /></button>
                </div>
                <nav className="px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm",
                                location.pathname === item.href
                                    ? isLenderRoute ? "bg-indigo-600 text-white font-extrabold border-l-4 border-white" : "bg-primary text-white font-extrabold border-l-4 border-white"
                                    : "text-slate-300 hover:bg-white/10 font-medium"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:text-red-400 text-sm font-medium">
                        <LogOut className="h-5 w-5" /> Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-surface-border sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-text-secondary">
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800 capitalize">
                            {navigation.find(n => n.href === location.pathname)?.name || "Dashboard"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-surface-muted px-3 py-2 rounded-lg border border-surface-border w-64">
                            <Search className="h-4 w-4 text-slate-400 mr-2" />
                            <input placeholder={isLenderRoute ? "Search investments..." : "Search loans..."} className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                        <button className="relative p-2 text-slate-500 hover:bg-surface-muted rounded-full transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

