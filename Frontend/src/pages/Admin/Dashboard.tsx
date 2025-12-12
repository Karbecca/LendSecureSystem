import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    CreditCard,
    Wallet,
    AlertCircle,
    TrendingUp,
    Activity
} from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { formatCurrency } from "../../lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.getAdminDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            setError("Failed to load dashboard data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            subtext: `${stats?.totalBorrowers} Borrowers, ${stats?.totalLenders} Lenders`,
            icon: Users,
            color: "bg-blue-500"
        },
        {
            title: "Total Loans",
            value: stats?.totalLoans || 0,
            subtext: `${stats?.pendingLoans} Pending Approval`,
            icon: CreditCard,
            color: "bg-purple-500"
        },
        {
            title: "Funded Amount",
            value: formatCurrency(stats?.totalFundedAmount || 0),
            subtext: `${stats?.fundedLoans} Loans Funded`,
            icon: Wallet,
            color: "bg-green-500"
        },
        {
            title: "Outstanding",
            value: formatCurrency(stats?.totalOutstandingAmount || 0),
            subtext: "Principal + Interest",
            icon: TrendingUp,
            color: "bg-orange-500"
        }
    ];

    const chartData = [
        { name: 'Pending', count: stats?.pendingLoans || 0 },
        { name: 'Approved', count: stats?.approvedLoans || 0 },
        { name: 'Funded', count: stats?.fundedLoans || 0 },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
                <p className="text-text-secondary">System statistics and performance metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className="p-6 border-none shadow-soft hover:shadow-float transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border-none shadow-soft">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Loan Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#0A2540" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-soft">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Pending KYC</p>
                                    <p className="text-xs text-yellow-600">{stats?.pendingKYCs || 0} documents to review</p>
                                </div>
                            </div>
                            <Link to="/admin/kyc" className="text-xs font-bold text-yellow-700 hover:text-yellow-800 hover:underline">Review</Link>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Pending Loans</p>
                                    <p className="text-xs text-blue-600">{stats?.pendingLoans || 0} applications waiting</p>
                                </div>
                            </div>
                            <Link to="/admin/loans" className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline">View</Link>
                        </div>
                    </div>
                </Card>
            </div >
        </div >
    );
}
