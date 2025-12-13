import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

interface ExportButtonsProps {
    onExportCSV: () => void;
    onExportPDF: () => void;
    disabled?: boolean;
}

export function ExportButtons({ onExportCSV, onExportPDF, disabled = false }: ExportButtonsProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: 'csv' | 'pdf') => {
        setIsExporting(true);
        try {
            if (type === 'csv') {
                onExportCSV();
            } else {
                onExportPDF();
            }
        } finally {
            setTimeout(() => setIsExporting(false), 500);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleExport('csv')}
                disabled={disabled || isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Export CSV</span>
            </button>
            <button
                onClick={() => handleExport('pdf')}
                disabled={disabled || isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Export PDF</span>
            </button>
        </div>
    );
}
