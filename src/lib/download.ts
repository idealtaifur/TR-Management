import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadHTMLTable(data: any[], columns: string[], filename: string, titleStr: string = "কম্পাউন্ড প্রজেকশন", subtitle: string = "") {
  const tableRows = data.map(row => 
    `<tr>${row.map((cell: any) => `<td>${cell}</td>`).join('')}</tr>`
  ).join('');

  const tableHtml = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { 
          font-family: 'Inter', sans-serif; 
          background: #f8fafc; 
          margin: 0; 
          padding: 20px; 
          color: #0f172a; 
          display: flex;
          justify-content: center;
        }
        .container {
          background: #ffffff;
          max-width: 800px;
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 20px;
        }
        .header h2 {
          margin: 0 0 10px 0;
          color: #0f172a;
          font-size: 24px;
        }
        .header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        table { 
          width: 100%; 
          border-collapse: separate; 
          border-spacing: 0;
          margin-top: 20px; 
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        th { 
          background: #0f172a; 
          color: #ffffff;
          padding: 16px; 
          text-align: left; 
          font-weight: 600;
          font-size: 14px;
        }
        td { 
          padding: 14px 16px; 
          border-bottom: 1px solid #e2e8f0; 
          color: #334155;
          font-size: 14px;
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .actions {
          margin-top: 30px;
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        button {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .btn-print { background: #059669; color: white; }
        .btn-print:hover { background: #059669; }
        .btn-close { background: #e2e8f0; color: #475569; }
        .btn-close:hover { background: #cbd5e1; }
        @media print {
          body { background: white; padding: 0; }
          .container { box-shadow: none; padding: 0; }
          .actions { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${titleStr}</h2>
          ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
        <table>
          <thead>
            <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="actions">
          <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
          <button class="btn-close" onclick="window.close()">Close</button>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const blob = new Blob([tableHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllDataJSON(data: any) {
  const profileRows = [
    ["Name", data.profile?.name || "N/A"],
    ["Email", data.profile?.email || "N/A"],
    ["Balance", "$" + Number(data.balance).toFixed(2)],
    ["Target Days", data.profile?.targetDays || "N/A"],
    ["Daily Target (%)", data.profile?.dailyProfitTarget + "%"],
    ["Current Day", data.dailyTarget?.dayNum || 1],
  ];
  
  const tradesHtml = data.journals?.length > 0 
    ? data.journals.map((j: any) => `
        <tr>
          <td>${new Date(j.date).toLocaleDateString()}</td>
          <td>${j.isWin ? '<span style="color:#059669">Win</span>' : '<span style="color:#ef4444">Loss</span>'}</td>
          <td>$${Number(j.amount).toFixed(2)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="text-align:center">No trades recorded</td></tr>';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trading Profile Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #0f172a; display: flex; justify-content: center; }
        .container { background: #ffffff; max-width: 800px; width: 100%; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
        .header h2 { margin: 0 0 10px 0; font-size: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        th { background: #0f172a; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .actions { display: flex; justify-content: center; gap: 15px; }
        button { padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
        .btn-print { background: #059669; color: white; }
        .btn-close { background: #e2e8f0; color: #475569; }
        @media print { .actions { display: none; } body { padding:0; background:white; } .container { box-shadow:none; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Trading Account Profile</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <h3>Profile Info</h3>
        <table>
          <tbody>
            ${profileRows.map((r: any) => `<tr><td style="font-weight:600; width: 40%;">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
          </tbody>
        </table>
        
        <h3>Recent Trade Journals</h3>
        <table>
          <thead>
            <tr><th>Date</th><th>Result</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${tradesHtml}
          </tbody>
        </table>

        <div class="actions">
          <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
          <button class="btn-close" onclick="window.close()">Close</button>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trading_profile_${new Date().getTime()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
