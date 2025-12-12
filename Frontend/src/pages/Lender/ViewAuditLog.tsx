import { useEffect, useState } from "react";
import {
    Loader2,
    History,
    Calendar,
    Activity,
    Globe,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../services/api";

interface AuditLog {
    logId: string;
    action: string;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export default function ViewAuditLog() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await api.getMyAuditLogs(page, pageSize);
                setLogs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [page]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const getActionColor = (action: string) => {
        if (action.toLowerCase().includes('login')) return 'bg-blue-100 text-blue-700';
        if (action.toLowerCase().includes('fund')) return 'bg-indigo-100 text-indigo-700';
        if (action.toLowerCase().includes('logout')) return 'bg-slate-100 text-slate-700';
        if (action.toLowerCase().includes('register')) return 'bg-purple-100 text-purple-700';
        return 'bg-slate-100 text-slate-700';
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={item} className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl">
                    <History className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
                    <p className="text-slate-500 text-sm">View your account activity and actions</p>
                </div>
            </motion.div>

            {/* Audit Logs Table */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Activity Yet</h3>
                        <p className="text-slate-500 text-sm">Your activity will appear here as you use the platform.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-muted/50 text-xs uppercase text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Details</th>
                                        <th className="px-6 py-4">IP Address</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log) => (
                                        <tr key={log.logId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                                {log.details || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-slate-400" />
                                                    {log.ipAddress || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Page {page} - Showing {logs.length} entries
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={logs.length < pageSize}
                                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
