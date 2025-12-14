import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    Users,
    ShieldCheck,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

import api from "../../services/api";

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState({ kyc: 0, loans: 0 });

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.getAdminDashboardStats();
                if (response.success) {
                    setNotifications({
                        kyc: response.data.pendingKYCs || 0,
                        loans: response.data.pendingLoans || 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        // Poll every minute for updates
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navigation = [
        { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Loan Management", href: "/admin/loans", icon: FileText },
        { name: "KYC Verification", href: "/admin/kyc", icon: ShieldCheck },
        { name: "Audit Logs", href: "/admin/audit", icon: ShieldCheck },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-surface-muted flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-20 overflow-y-auto">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">LendSecure</span>
                </div>

                <div className="px-6 py-2">
                    <span className="text-xs font-semibold bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">Admin Portal</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>

                    <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-xl">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/30">
                            {user?.firstName?.[0] || "A"}{user?.lastName?.[0] || "D"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">Administrator</p>
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
                "fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-40 transform transition-transform duration-300 lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
            )}>
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
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                                location.pathname === item.href
                                    ? "bg-primary text-white"
                                    : "text-slate-300 hover:bg-white/10"
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
                            Admin Portal
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-surface-muted px-3 py-2 rounded-lg border border-surface-border w-64">
                            <Search className="h-4 w-4 text-slate-400 mr-2" />
                            <input placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-500 hover:bg-surface-muted rounded-full transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                                {(notifications.kyc > 0 || notifications.loans > 0) && (
                                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.kyc === 0 && notifications.loans === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    No new notifications
                                                </div>
                                            ) : (
                                                <div className="py-2">
                                                    {notifications.kyc > 0 && (
                                                        <Link
                                                            to="/admin/kyc"
                                                            onClick={() => setShowNotifications(false)}
                                                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="mt-1 bg-yellow-100 p-1.5 rounded-full">
                                                                <ShieldCheck className="h-4 w-4 text-yellow-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">Pending KYC Requests</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{notifications.kyc} documents require review</p>
                                                            </div>
                                                        </Link>
                                                    )}
                                                    {notifications.loans > 0 && (
                                                        <Link
                                                            to="/admin/loans"
                                                            onClick={() => setShowNotifications(false)}
                                                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="mt-1 bg-blue-100 p-1.5 rounded-full">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">Loan Applications</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{notifications.loans} loans pending approval</p>
                                                            </div>
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
