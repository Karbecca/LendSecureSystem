import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to CSV file
 */
export function exportToCSV(data: any[], filename: string) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${getDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Export data to PDF file with table
 */
export function exportToPDF(
    data: any[],
    columns: { header: string; dataKey: string }[],
    title: string,
    filename: string,
    summary?: { label: string; value: string }[]
) {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text(title, 14, 20);

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    let startY = 35;

    // Add summary if provided
    if (summary && summary.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        summary.forEach((item, index) => {
            doc.text(`${item.label}: ${item.value}`, 14, startY + (index * 7));
        });
        startY += (summary.length * 7) + 5;
    }

    // Add table
    autoTable(doc, {
        startY: startY,
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
        theme: 'grid',
        headStyles: {
            fillColor: [79, 70, 229], // Indigo
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    // Add footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save the PDF
    doc.save(`${filename}-${getDateString()}.pdf`);
}

/**
 * Get current date as string for filenames
 */
function getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number, currency: string = 'RWF'): string {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format percentage for export
 */
export function formatPercentageForExport(value: number): string {
    return `${value.toFixed(2)}%`;
}
