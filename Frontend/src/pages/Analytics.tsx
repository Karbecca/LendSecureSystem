import { motion } from "framer-motion";
import {
    TrendingUp,
    DollarSign,
    Users,
    FileText,
    PieChart,
    BarChart3,
    ArrowUp
} from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function Analytics() {
    // Mock data - in real app, fetch from API
    const stats = {
        totalUsers: 1250,
        totalLoans: 342,
        totalVolume: 45000000,
        activeLoans: 128,
        completedLoans: 198,
        defaultedLoans: 16,
        averageLoanSize: 131579,
        averageROI: 12.5
    };

    const monthlyData = [
        { month: "Jan", volume: 3200000, loans: 28 },
        { month: "Feb", volume: 3800000, loans: 32 },
        { month: "Mar", volume: 4200000, loans: 35 },
        { month: "Apr", volume: 3900000, loans: 31 },
        { month: "May", volume: 4500000, loans: 38 },
        { month: "Jun", volume: 5100000, loans: 42 }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Analytics & Reports</h1>
                <p className="text-slate-500 text-sm mt-1">Platform performance and statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-indigo-50 p-3 rounded-xl">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <span className="flex items-center text-emerald-600 text-sm font-bold">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            12%
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.totalUsers.toLocaleString()}</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="flex items-center text-emerald-600 text-sm font-bold">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            8%
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Loans</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.totalLoans}</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-emerald-50 p-3 rounded-xl">
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span className="flex items-center text-emerald-600 text-sm font-bold">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            15%
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Volume</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalVolume)}</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-50 p-3 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-amber-600" />
                        </div>
                        <span className="flex items-center text-emerald-600 text-sm font-bold">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            3%
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Average ROI</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.averageROI}%</h3>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Loan Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-indigo-600" />
                        Loan Status Distribution
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">Active</span>
                                <span className="text-sm font-bold text-slate-800">{stats.activeLoans} ({((stats.activeLoans / stats.totalLoans) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.activeLoans / stats.totalLoans) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">Completed</span>
                                <span className="text-sm font-bold text-slate-800">{stats.completedLoans} ({((stats.completedLoans / stats.totalLoans) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.completedLoans / stats.totalLoans) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">Defaulted</span>
                                <span className="text-sm font-bold text-slate-800">{stats.defaultedLoans} ({((stats.defaultedLoans / stats.totalLoans) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats.defaultedLoans / stats.totalLoans) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Monthly Volume */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                        Monthly Loan Volume
                    </h3>
                    <div className="space-y-3">
                        {monthlyData.map((data, index) => {
                            const maxVolume = Math.max(...monthlyData.map(d => d.volume));
                            const percentage = (data.volume / maxVolume) * 100;
                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-slate-600 font-medium">{data.month}</span>
                                        <span className="text-sm font-bold text-slate-800">{formatCurrency(data.volume)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Additional Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
                <h3 className="text-lg font-bold text-slate-800 mb-6">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 text-sm mb-2">Average Loan Size</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.averageLoanSize)}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 text-sm mb-2">Default Rate</p>
                        <p className="text-2xl font-bold text-red-600">{((stats.defaultedLoans / stats.totalLoans) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 text-sm mb-2">Completion Rate</p>
                        <p className="text-2xl font-bold text-emerald-600">{((stats.completedLoans / stats.totalLoans) * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
