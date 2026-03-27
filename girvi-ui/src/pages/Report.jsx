import React, { useState } from 'react';
import { API_ENDPOINTS } from '../api';

const Report = ({ navigateTo }) => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadCSV = (headers, rows, filename) => {
    const escapeCsv = (str) => {
      if (str == null) return '""';
      const escaped = String(str).replace(/"/g, '""');
      
      // Prevent Excel from auto-converting phone numbers and long IDs to scientific notation
      if (/^\+?\d{10,}$/.test(escaped) || /^[0-9a-fA-F]{24}$/.test(escaped)) {
        return `="${escaped}"`;
      }
      
      return `"${escaped}"`;
    };
    
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map(row => row.map(escapeCsv).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async (type) => {
    setIsGenerating(type);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (type === 'Customers List') {
        const res = await fetch(API_ENDPOINTS.CUSTOMERS);
        const json = await res.json();
        let list = Array.isArray(json.customers) ? json.customers : [];
        list = list.filter(item => {
          if (!item.createdAt) return true; // Include legacy records without timestamps
          const dt = new Date(item.createdAt);
          return dt >= start && dt <= end;
        });

        const headers = ["Name", "Phone", "Email", "Address", "Joined Date"];
        const rows = list.map(c => [
          c.name, c.phone, c.email, c.address, new Date(c.createdAt).toLocaleDateString()
        ]);
        downloadCSV(headers, rows, `Customers_Report_${startDate}_to_${endDate}.csv`);
      } 
      else if (type === 'Loans Data') {
        const res = await fetch(API_ENDPOINTS.LOANS_ALL);
        const json = await res.json();
        let list = Array.isArray(json) ? json : (json.loans || []);
        list = list.filter(item => {
          if (!item.loanDate && !item.createdAt) return true;
          const dt = new Date(item.loanDate || item.createdAt);
          return dt >= start && dt <= end;
        });

        const headers = ["Loan ID", "Customer Name", "Customer Phone", "Item Name", "Category", "Net Wt", "Gross Wt", "Est. Value", "Loan Amount", "Interest Rate", "Duration", "Status", "Loan Date"];
        const rows = list.map(l => [
          l._id,
          l.userId?.name || "Unknown",
          l.userId?.phone || "Unknown",
          l.itemId?.itemName || "Unknown",
          l.itemId?.category || "Unknown",
          l.itemId?.netWeight || 0,
          l.itemId?.grossWeight || 0,
          l.itemId?.estimatedValue || 0,
          l.loanAmount,
          `${l.interestRate}% ${l.interestType}`,
          `${l.duration} ${l.durationUnit}`,
          l.status,
          new Date(l.loanDate || l.createdAt).toLocaleDateString()
        ]);
        downloadCSV(headers, rows, `Loans_Report_${startDate}_to_${endDate}.csv`);
      }
      else if (type === 'Transactions Log') {
        const res = await fetch(API_ENDPOINTS.PAYMENT_HISTORY);
        const json = await res.json();
        let list = Array.isArray(json) ? json : (json.transactions || []);
        list = list.filter(item => {
          if (!item.createdAt) return true; // Include legacy records without timestamps
          const dt = new Date(item.createdAt);
          return dt >= start && dt <= end;
        });

        const headers = ["Transaction ID", "Customer", "Type", "Amount", "Mode", "Reference", "Date"];
        const rows = list.map(t => [
          t._id,
          t.userId?.name || "Unknown",
          t.type === 'loan_disbursed' ? 'Loan Disbursed' : 'Payment Received',
          t.amount,
          t.paymentMode || "Cash",
          t.referenceId || "N/A",
          new Date(t.createdAt).toLocaleString()
        ]);
        downloadCSV(headers, rows, `Transactions_Report_${startDate}_to_${endDate}.csv`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
      <div className="bg-primary text-white px-6 py-5 md:py-6 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('account')}>arrow_back</span>
        <h2 className="text-xl md:text-2xl font-semibold">Download Reports</h2>
      </div>

      <div className="view-padding py-8 flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
        <div className="bg-card p-6 rounded-2xl border border-borderBase shadow-sm mb-8">
          <h4 className="text-lg font-bold text-textMain mb-4 border-b border-borderBase pb-3">Date Range Filter</h4>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-textMain mb-2">Start date :</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field py-3 text-base" />
            </div>
            <div className="flex-1 border-t md:border-t-0 md:border-l border-borderBase md:pl-6 pt-6 md:pt-0">
              <label className="block text-sm font-semibold text-textMain mb-2">End date :</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field py-3 text-base" />
            </div>
          </div>
        </div>

        <h4 className="font-bold text-textMain mb-4 ml-1 text-lg">Available Reports</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Customers List', desc: 'Get all active and inactive customer details.', iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', btnClass: 'bg-blue-600 hover:bg-blue-700 text-white', icon: 'group' },
            { title: 'Loans Data', desc: 'Complete breakdown of principal and metals.', iconClass: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', btnClass: 'bg-green-600 hover:bg-green-700 text-white', icon: 'diamond' },
            { title: 'Transactions Log', desc: 'Ledger report of payments and new loans.', iconClass: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white', icon: 'sync_alt' }
          ].map(item => (
            <div key={item.title} className="card !p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow border border-borderBase">
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold mb-4 ${item.iconClass}`}>
                  <span className="icon text-[28px]">{item.icon}</span>
                </div>
                <h4 className="font-bold text-textMain text-lg mb-1">{item.title}</h4>
                <p className="text-sm text-textMuted font-medium leading-relaxed mb-6">{item.desc}</p>
              </div>
              <button 
                onClick={() => handleGenerate(item.title)} 
                disabled={isGenerating !== false}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-sm transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${item.btnClass}`}
              >
                {isGenerating === item.title ? "Generating..." : "Generate & Download"} <span className="icon text-[18px]">download</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Report;

