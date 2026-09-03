export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printFormattedReport(title: string, subtitle: string, tableHTML: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print reports.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} — OnboardPro</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 40px;
            color: #0f172a;
          }
          .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #2563eb;
          }
          .subtitle {
            color: #64748b;
            font-size: 14px;
            margin-top: 4px;
          }
          .meta {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            font-size: 12px;
            color: #94a3b8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 10px 14px;
            text-align: left;
            font-size: 13px;
          }
          th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #334155;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
          }
          .badge-completed { background: #dcfce7; color: #15803d; }
          .badge-ontrack { background: #dbeafe; color: #1d4ed8; }
          .badge-inprogress { background: #e0f2fe; color: #0369a1; }
          .badge-atrisk { background: #fef3c7; color: #b45309; }
          .badge-overdue { background: #fee2e2; color: #b91c1c; }
          @media print {
            body { margin: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">OnboardPro</div>
          <h2>${title}</h2>
          <div class="subtitle">${subtitle}</div>
          <div class="meta">
            <span>Generated: ${new Date().toLocaleString()}</span>
            <span>Software Engineering Training & Onboarding Portal</span>
          </div>
        </div>
        ${tableHTML}
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
