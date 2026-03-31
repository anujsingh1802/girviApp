import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { API_ENDPOINTS } from '../api';

const ReceiptView = ({ txnId }) => {
  const receiptRef = useRef(null);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchReceipt = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.RECEIPT_PUBLIC(txnId));
        const json = await res.json();
        if (isMounted) {
          if (res.ok) {
            setData(json);
          } else {
            setError(json.message || "Failed to load receipt");
          }
        }
      } catch (err) {
        if (isMounted) setError("Network error generating receipt.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    if (txnId) fetchReceipt();
    return () => { isMounted = false; };
  }, [txnId]);

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // higher resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_SunarAbhushan_${txnId.slice(-6).toUpperCase()}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
      alert("Failed to generate PDF");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-textMuted bg-gray-50">Loading Receipt...</div>;
  if (error) return <div className="flex flex-col h-screen items-center justify-center text-red-500 bg-gray-50"><span className="icon text-6xl mb-4">error</span><span className="text-xl font-bold">{error}</span></div>;
  if (!data) return null;

  const { transaction, loan, customer } = data;
  const isPayment = transaction.amount > 0 && transaction.type !== 'loan_disbursed';
  const receiptNo = `REC-${transaction._id.substring(transaction._id.length - 8).toUpperCase()}`;
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 flex flex-col items-center">
      
      {/* Action Bar (Not visible in PDF) */}
      <div className="w-full max-w-2xl flex justify-between gap-4 mb-6 sticky top-4 z-50">
        <button onClick={() => window.history.back()} className="bg-white text-gray-800 shadow-md border border-gray-200 rounded-full px-6 py-3 font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <span className="icon text-lg">arrow_back</span> Back
        </button>
        <button onClick={handleDownloadPdf} className="bg-[#2980b9] text-white shadow-md rounded-full px-6 py-3 font-bold flex items-center gap-2 hover:bg-[#1f618d] transition-colors">
          <span className="icon text-lg">download</span> Download PDF
        </button>
      </div>

      {/* Receipt Container */}
      <div 
        ref={receiptRef} 
        className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header / Brand */}
        <div className="bg-[#1a252f] text-white text-center py-6 px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] -z-0"></div>
          <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-sm mb-1 relative z-10" style={{ letterSpacing: '1px' }}>सुनर आभूषण</h1>
          <p className="text-gray-300 text-sm font-medium tracking-wider relative z-10 uppercase">Sunar Abhushan • Payment Receipt</p>
        </div>

        {/* Content */}
        <div className="p-8">
          
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Receipt Number</p>
              <p className="text-gray-900 font-bold text-lg">{receiptNo}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-gray-900 font-bold">{new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Customer Details</p>
              <h3 className="text-gray-900 font-bold text-lg">{customer.name}</h3>
              <p className="text-gray-600 mt-1 flex items-center gap-1.5"><span className="icon text-[14px] text-gray-400">phone</span> {customer.phone}</p>
              {customer.address && <p className="text-gray-600 mt-1 flex items-start gap-1.5 leading-snug"><span className="icon text-[14px] text-gray-400 mt-0.5">home</span> <span className="flex-1">{customer.address}</span></p>}
            </div>
            {customer.signatureUrl && (
              <div className="flex flex-col items-center border rounded-lg p-3 bg-white shadow-sm">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Customer Signature</p>
                <img src={customer.signatureUrl} alt="Customer Signature" className="max-h-24 object-contain border rounded-md" />
              </div>
            )}

            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Loan Information</p>
              <p className="text-gray-600 mb-1"><span className="font-semibold text-gray-800">Principal:</span> ₹{loan.loanAmount}</p>
              <p className="text-gray-600 mb-1"><span className="font-semibold text-gray-800">Interest:</span> {loan.interestRate}% ({loan.interestType})</p>
              <p className="text-gray-600 mb-1 flex items-center"><span className="font-semibold text-gray-800 mr-1">Status:</span> 
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${loan.status === 'active' ? 'bg-blue-100 text-blue-700' : loan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {loan.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Item Details */}
          <div className="mb-8 bg-gray-50 rounded-lg p-5 border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Item Provided (Girvi)</p>
            {loan.items && loan.items.length > 0 ? (
              <div className="flex flex-col gap-2">
                {loan.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-gray-800">{i+1}. {it.itemName} <span className="text-gray-500 font-normal">[{it.category}]</span></span>
                    <span className="text-gray-600 font-medium whitespace-nowrap">{(it.netWeight || it.grossWeight) && `W: ${it.netWeight || it.grossWeight}g`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-between items-center text-sm">
                 <span className="font-semibold text-gray-800">{loan.itemId?.itemName || "Item"} <span className="text-gray-500 font-normal">[{loan.itemId?.category || "Unknown"}]</span></span>
                 <span className="text-gray-600 font-medium whitespace-nowrap">{(loan.itemId?.netWeight || loan.itemId?.grossWeight) && `W: ${loan.itemId?.netWeight || loan.itemId?.grossWeight}g`}</span>
              </div>
            )}
          </div>

          {/* Transaction Summary */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
            <div className={`py-3 px-5 text-white font-bold tracking-wide uppercase text-sm ${isPayment ? 'bg-[#27ae60]' : 'bg-[#e74c3c]'}`}>
              {isPayment ? 'Amount Received' : 'Amount Disbursed'}
            </div>
            <div className="p-5 bg-white flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Transaction Amount</p>
                <p className={`text-4xl font-black mt-1 ${isPayment ? 'text-[#27ae60]' : 'text-[#e74c3c]'}`}>₹{transaction.amount.toLocaleString()}</p>
                <p className="text-gray-400 text-xs font-semibold mt-2 uppercase tracking-wide flex items-center gap-1">
                  <span className="icon text-[14px]">payments</span> Mode: Cash
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                 <span className={`icon text-3xl ${isPayment ? 'text-[#27ae60]' : 'text-[#e74c3c]'}`}>
                   {isPayment ? 'call_received' : 'call_made'}
                 </span>
              </div>
            </div>
          </div>

          {/* Account Standing */}
          <div className="flex justify-end pt-4 border-t-2 border-dashed border-gray-200">
            <div className="w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Total Payable:</span>
                <span className="text-gray-900 font-bold">₹{loan.totalPayable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Paid So Far:</span>
                <span className="text-green-600 font-bold">₹{loan.paidTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-800 font-bold text-lg">Remaining:</span>
                <span className="text-red-600 font-black text-xl">₹{Math.max(0, loan.remaining).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
          <p className="text-gray-800 text-sm font-bold mb-1">Thank you for trusting सुनर आभूषण!</p>
          <p className="text-gray-500 text-xs">This is a system generated digital receipt and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
