import { useEffect, useState } from "react";

import api from "../../services/api";
import { Card } from "../../components/ui/Card";

import { formatDate } from "../../lib/utils";
import { ExportButtons } from "../../components/ui/ExportButtons";
import { exportToCSV, exportToPDF, formatDateForExport } from "../../lib/export";

interface AuditLog {
    logId: string;
    userEmail: string;
    action: string;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.getAuditLogs({ page, pageSize: 20 });
            if (response.success) {
                if (page === 1) {
                    setLogs(response.data.logs);
                } else {
                    setLogs(prev => [...prev, ...response.data.logs]);
                }
                setHasMore(response.data.logs.length === 20);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const exportData = logs.map(log => ({
            'Timestamp': formatDateForExport(log.createdAt),
            'User': log.userEmail || '-',
            'Action': log.action,
            'Details': log.details || '-',
            'IP Address': log.ipAddress || '-'
        }));
        exportToCSV(exportData, 'admin-audit-logs');
    };

    const handleExportPDF = () => {
        const exportData = logs.map(log => ({
            timestamp: formatDateForExport(log.createdAt),
            user: log.userEmail || '-',
            action: log.action,
            details: log.details || '-',
            ip: log.ipAddress || '-'
        }));

        const columns = [
            { header: 'Timestamp', dataKey: 'timestamp' },
            { header: 'User', dataKey: 'user' },
            { header: 'Action', dataKey: 'action' },
            { header: 'Details', dataKey: 'details' },
            { header: 'IP', dataKey: 'ip' }
        ];

        const summary = [
            { label: 'Total Logs', value: logs.length.toString() }
        ];

        exportToPDF(exportData, columns, 'Audit Logs Report', 'admin-audit-logs', summary);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
                    <p className="text-text-secondary">Track system activity and security events</p>
                </div>
                <ExportButtons
                    onExportCSV={handleExportCSV}
                    onExportPDF={handleExportPDF}
                    disabled={logs.length === 0}
                />
            </div>

            <Card className="p-0 border-none shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-muted border-b border-surface-border">
                            <tr className="text-left">
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {logs.map((log) => (
                                <tr key={log.logId} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                                        {formatDate(log.createdAt)}
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium text-slate-700">
                                        {log.userEmail}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-slate-600 max-w-md truncate" title={log.details}>
                                        {log.details.length > 50 ? log.details.substring(0, 50) + "..." : log.details}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-slate-500 font-mono">
                                        {log.ipAddress || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-4 text-center text-slate-500">Loading logs...</div>
                )}
                {!loading && hasMore && (
                    <div className="p-4 border-t border-surface-border text-center">
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
}
