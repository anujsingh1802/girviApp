import React, { useEffect, useState } from 'react';
import API_BASE_URL, { API_ENDPOINTS } from '../api';
import SignatureModal from '../components/SignatureModal';

const CustomerProfile = ({ navigateTo, customerId }) => {
  const [data, setData] = useState(null);
  const [userSummary, setUserSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null, isFinal: false, preventClose: false });
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CUSTOMER_PROFILE(customerId));
        const json = await res.json();
        
        if (res.ok && isMounted) {
          setData(json);
        }
        
        const sumRes = await fetch(API_ENDPOINTS.USER_SUMMARY(customerId));
        if (sumRes.ok) {
          const sumJson = await sumRes.json();
          if (isMounted) setUserSummary(sumJson);
        }
        
        if (isMounted) setData(json);
      } catch (err) {
        // Handle error implicitly
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (customerId) fetchProfile();
    return () => { isMounted = false; };
  }, [customerId]);

  if (loading) return <div className="p-8 text-textMain text-xl text-center">Loading Profile...</div>;
  if (!data) return <div className="p-8 text-textMain text-xl text-center">Profile not found.</div>;

  const { customer, loans, transactions, items, totalPending } = data;

  const handleDeleteCustomer = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Customer",
      message: "Are you sure you want to delete this customer? All their loans, collateral, and transaction history will be permanently deleted.",
      isFinal: false,
      preventClose: true,
      onConfirm: () => {
        setConfirmDialog({
          isOpen: true,
          title: "FINAL WARNING",
          message: "This action cannot be undone. Do you wish to proceed and completely erase this customer?",
          isFinal: true,
          preventClose: false,
          onConfirm: async () => {
            try {
              setLoading(true);
              const res = await fetch(`${API_BASE_URL}/api/auth/customer/${customerId}`, { method: 'DELETE' });
              if (res.ok) {
                alert("Customer deleted successfully.");
                navigateTo('customers');
              } else {
                alert("Failed to delete customer.");
                setLoading(false);
              }
            } catch(err) {
              alert("Error deleting customer.");
              setLoading(false);
            }
          }
        });
      }
    });
  };

  const handleDeleteLoan = (loanId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Loan",
      message: "Are you sure you want to delete this completed loan? Transaction history associated with it will also be deleted.",
      isFinal: false,
      preventClose: false,
      onConfirm: async () => {
        try {
          setLoading(true);
          const res = await fetch(`${API_BASE_URL}/api/loan/${loanId}`, { method: 'DELETE' });
          if (res.ok) {
            alert("Loan deleted successfully.");
            const refresh = await fetch(`${API_BASE_URL}/api/auth/customer/${customerId}`);
            const json = await refresh.json();
            const sumRes = await fetch(`${API_BASE_URL}/api/auth/user/${customerId}/summary`);
            if (sumRes.ok) {
              const sumJson = await sumRes.json();
              setUserSummary(sumJson);
            }
            setData(json);
          } else {
            const error = await res.json();
            alert(error.message || "Failed to delete loan.");
          }
        } catch(err) {
          alert("Error deleting loan.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleWhatsApp = () => {
    let text = "";
    if (totalPending <= 0) {
      text = `Hello ${customer.name},\nThank you for choosing सुनार आभूषण.\n`;
      text += `Your loan has been successfully cleared and your pending amount is ₹0.00.\n`;
      text += `We appreciate your prompt payments and look forward to serving you again.`;
    } else {
      text = `Hello ${customer.name},\nThis is a friendly reminder from सुनार आभूषण.\n`;
      text += `Your total pending loan amount is ₹${totalPending.toFixed(2)}.\n`;
      text += `Kindly clear the dues at the earliest.\nThank you!`;
    }
    
    // Clean phone number: keep only digits, grab last 10 digits, prepend 91
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const mobileNumber = cleanPhone.slice(-10);
    const url = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleUpdateCustomer = async (updates) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/customer/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const refreshRes = await fetch(API_ENDPOINTS.CUSTOMER_PROFILE(customerId));
        if (refreshRes.ok) {
          const updatedJson = await refreshRes.json();
          setData(updatedJson);
        }
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update customer.");
      }
    } catch (err) {
      alert("Error updating customer.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        await handleUpdateCustomer({ [type + 'Url']: result.url });
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (err) {
      alert("Error uploading document.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-5 md:py-6 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('customers')}>arrow_back</span>
          <h2 className="text-xl md:text-2xl font-semibold">Customer Profile</h2>
        </div>
        <button onClick={handleWhatsApp} className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] px-4 py-2 rounded-xl font-bold transition-colors shadow-sm">
          <span className="icon">chat</span>
          <span className="hidden md:block">WhatsApp</span>
        </button>
      </div>

      <div className="view-padding py-6 flex-1 overflow-y-auto pb-24 max-w-5xl mx-auto w-full flex flex-col gap-6">
        
        {/* Customer Card */}
        <div className="card p-6 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-borderBase relative overflow-visible">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
          <div className="flex items-center gap-5">
            {customer.profileUrl ? (
              <img src={customer.profileUrl} alt={customer.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-borderBase shadow-md bg-background shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-light/20 text-primary-dark flex items-center justify-center shrink-0 shadow-sm border border-borderBase">
                <span className="text-3xl font-bold">{customer.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-textMain">{customer.name}</h3>
              <p className="text-textMuted font-medium mt-1">{customer.phone} • {customer.email || 'No email'}</p>
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mt-2 inline-block">
                Joined: {new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end transition-all duration-500">
             {userSummary && userSummary.totalPayable > 0 && userSummary.pending === 0 ? (
                <div className="mb-2 transition-all duration-500 transform scale-100 opacity-100">
                  <span className="text-2xl font-bold text-accentGreen drop-shadow-sm flex items-center gap-2">Completed <span className="icon">check_circle</span></span>
                </div>
             ) : (
                <>
                  <div className="flex justify-between w-full md:w-auto gap-4 mt-1 transition-all">
                     <span className="text-textMuted text-sm font-semibold uppercase tracking-wider">Received</span>
                     <span className="text-xl font-bold text-accentGreen">₹{(userSummary?.received || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full md:w-auto gap-4 mt-1 transition-all">
                     <span className="text-textMuted text-sm font-semibold uppercase tracking-wider">Pending</span>
                     <span className="text-xl font-bold text-accentRed">₹{(userSummary ? userSummary.pending : totalPending).toFixed(2)}</span>
                  </div>
                </>
             )}
             <span className="text-sm font-medium text-textMuted mt-2">{loans.length} Total Loans</span>
          </div>
        </div>

        {/* Documents */}
        {(customer.aadhaarUrl || customer.panUrl || customer.signatureUrl || (customer.documents && customer.documents.length > 0)) && (
          <div>
            <h4 className="text-lg font-bold text-textMain mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="icon text-primary">description</span> 
                Documents & Signature
              </div>
              {isUpdating && <span className="text-xs text-primary animate-pulse font-bold">Syncing...</span>}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Aadhaar Box */}
              <div className="card p-3 border border-borderBase flex flex-col gap-2 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-textMain truncate">Aadhaar Card</span>
                  <label className="cursor-pointer hover:text-primary transition-colors">
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'aadhaar')} disabled={isUpdating} />
                    <span className="icon text-sm">{customer.aadhaarUrl ? 'edit' : 'add_circle'}</span>
                  </label>
                </div>
                {customer.aadhaarUrl ? (
                  <a href={customer.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-24 bg-gray-100 rounded-lg overflow-hidden relative group">
                    {customer.aadhaarUrl.endsWith('.pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-red-500 bg-white">
                        <span className="icon text-3xl">picture_as_pdf</span>
                      </div>
                    ) : (
                      <img src={customer.aadhaarUrl} alt="Aadhaar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    )}
                  </a>
                ) : (
                   <label className="block w-full h-24 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-dashed border-borderBase flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-100 transition-all">
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'aadhaar')} disabled={isUpdating} />
                      <span className="icon text-primary/40 text-2xl">cloud_upload</span>
                      <span className="text-[10px] font-bold text-textMuted uppercase">Upload</span>
                   </label>
                )}
              </div>

              {/* PAN Box */}
              <div className="card p-3 border border-borderBase flex flex-col gap-2 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-textMain truncate">PAN Card</span>
                  <label className="cursor-pointer hover:text-primary transition-colors">
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'pan')} disabled={isUpdating} />
                    <span className="icon text-sm">{customer.panUrl ? 'edit' : 'add_circle'}</span>
                  </label>
                </div>
                {customer.panUrl ? (
                  <a href={customer.panUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-24 bg-gray-100 rounded-lg overflow-hidden relative group">
                    {customer.panUrl.endsWith('.pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-red-500 bg-white">
                        <span className="icon text-3xl">picture_as_pdf</span>
                      </div>
                    ) : (
                      <img src={customer.panUrl} alt="PAN" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    )}
                  </a>
                ) : (
                  <label className="block w-full h-24 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-dashed border-borderBase flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-100 transition-all">
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'pan')} disabled={isUpdating} />
                    <span className="icon text-primary/40 text-2xl">cloud_upload</span>
                    <span className="text-[10px] font-bold text-textMuted uppercase">Upload</span>
                  </label>
                )}
              </div>

              {/* Signature Box */}
              <div className="card p-3 border border-borderBase flex flex-col gap-2 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-textMain truncate">Customer Signature</span>
                  <button onClick={() => setIsSignatureModalOpen(true)} className="hover:text-primary transition-colors disabled:opacity-50" disabled={isUpdating}>
                    <span className="icon text-sm">{customer.signatureUrl ? 'edit' : 'add_circle'}</span>
                  </button>
                </div>
                {customer.signatureUrl ? (
                  <a href={customer.signatureUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-24 bg-gray-100 rounded-lg overflow-hidden relative group border border-borderBase/50 p-1">
                    <img src={customer.signatureUrl} alt="Signature" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                  </a>
                ) : (
                   <button 
                     onClick={() => setIsSignatureModalOpen(true)} 
                     disabled={isUpdating}
                     className="block w-full h-24 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-dashed border-borderBase flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-all"
                   >
                     <span className="icon text-primary/40 text-2xl">draw</span>
                     <span className="text-[10px] font-bold text-textMuted uppercase">Capture</span>
                   </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collateral & Loans List */}
        <div>
          <h4 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
            <span className="icon text-primary">inventory_2</span> 
            Loan Details & Collateral (Girvi)
          </h4>
          {loans.length === 0 ? (
            <p className="text-textMuted text-sm">No loans found for this customer.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map(loan => (
                <div key={loan._id} className="card !p-5 border border-borderBase flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      {loan.items && loan.items.length > 0 ? (
                        <>
                          <div className="flex flex-col gap-2 mb-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {loan.items.map((it, idx) => (
                               <div key={it._id || idx} className="bg-gray-50/50 dark:bg-gray-900/20 p-2 rounded-lg border border-borderBase/50">
                                 <span className="text-sm font-bold block text-textMain mb-1">
                                   {idx + 1}. {it.itemName || "Item"} <span className="text-textMuted font-normal text-xs ml-1">[{it.category || "Unknown"}]</span>
                                 </span>
                                 <div className="flex flex-wrap gap-2 items-center">
                                   <span className="text-[11px] text-textMuted bg-background px-1.5 py-0.5 rounded border border-borderBase">₹{it.estimatedValue || 0}</span>
                                   {(Number(it.netWeight) > 0 || Number(it.grossWeight) > 0) && (
                                     <span className="text-[11px] text-textMuted bg-background px-1.5 py-0.5 rounded border border-borderBase">NW: {it.netWeight}g / GW: {it.grossWeight}g</span>
                                   )}
                                 </div>
                               </div>
                            ))}
                          </div>
                          <span className="text-xs text-textMuted block mt-2">Interest: {loan.interestRate}% ({loan.interestType})</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-bold block text-textMain bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md w-max mb-2">
                            {loan.itemId?.itemName || "Item"} • [{loan.itemId?.category || "Unknown"}]
                          </span>
                          <span className="text-xs text-textMuted block">Collateral Value: ₹{loan.itemId?.estimatedValue || 0}</span>
                          <span className="text-xs text-textMuted block mt-0.5">Interest: {loan.interestRate}% ({loan.interestType})</span>
                          {(Number(loan.itemId?.netWeight) > 0 || Number(loan.itemId?.grossWeight) > 0) && (
                             <span className="text-xs text-textMuted block mt-0.5">NW: {loan.itemId.netWeight}g / GW: {loan.itemId.grossWeight}g</span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 h-min">
                      <span className={`text-xs font-bold px-2 py-1 h-min rounded-full capitalize ${loan.status === 'active' ? 'bg-primary-light/20 text-primary' : loan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {loan.status}
                      </span>
                      {loan.status === 'completed' && (
                        <button 
                          onClick={() => handleDeleteLoan(loan._id)}
                          className="bg-red-100 dark:bg-red-900/30 text-red-600 hover:text-white hover:bg-red-500 rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-sm"
                          title="Delete Loan & History"
                        >
                          <span className="icon text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {((loan.items && loan.items.flatMap(i => i.images || [])) || loan.itemId?.images || []).length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      {((loan.items && loan.items.flatMap(i => i.images || [])) || loan.itemId?.images || []).map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-borderBase shadow-sm hover:opacity-80 transition-opacity">
                           {img.endsWith('.pdf') ? (
                             <div className="w-full h-full flex items-center justify-center bg-gray-50 text-red-500">
                                <span className="icon">picture_as_pdf</span>
                             </div>
                           ) : (
                             <img src={img} alt="Item" className="w-full h-full object-cover" />
                           )}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 pt-3 border-t border-borderBase grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-textMuted text-xs">Loan Amount</span>
                      <span className="font-bold text-textMain">₹{loan.loanAmount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-textMuted text-xs">Payable Total</span>
                      <span className="font-bold text-textMain">₹{loan.totalPayable.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-textMuted text-xs">Paid</span>
                      <span className="font-bold text-accentGreen">₹{loan.paidTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-textMuted text-xs">Pending</span>
                      <span className="font-bold text-accentRed">₹{loan.remaining.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction History (Ledger) */}
        <div className="mt-2">
          <h4 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
            <span className="icon text-primary">receipt_long</span> 
            Transaction Ledger
          </h4>
          {transactions.length === 0 ? (
            <p className="text-textMuted text-sm">No transactions available yet.</p>
          ) : (
            <div className="bg-card rounded-2xl border border-borderBase shadow-sm overflow-hidden">
              {transactions.map((txn, i) => (
                <div key={txn._id} onClick={() => setSelectedTransaction(txn)} className={`p-4 flex items-center justify-between hover:bg-[var(--color-background)] transition-colors cursor-pointer ${i !== transactions.length - 1 ? 'border-b border-borderBase' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${txn.type === 'loan_disbursed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                      <span className="icon text-[18px]">{txn.type === 'loan_disbursed' ? 'call_made' : 'call_received'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-textMain text-sm">{txn.type === 'loan_disbursed' ? 'Loan Disbursed' : 'Payment Received'}</h4>
                      <p className="text-xs text-textMuted font-medium">{new Date(txn.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold block ${txn.type === 'loan_disbursed' ? 'text-red-500' : 'text-accentGreen'}`}>
                      {txn.type === 'loan_disbursed' ? '- ' : '+ '}₹{txn.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Customer Section */}
        <div className="mt-8 pt-6 border-t border-borderBase flex justify-center pb-8">
           <button 
             onClick={handleDeleteCustomer}
             className="px-6 py-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
           >
             <span className="icon text-xl">delete_forever</span> Delete Customer & All Data
           </button>
        </div>

      </div>

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 outline-none">
          <div className="bg-card w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-borderBase relative">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${confirmDialog.isFinal ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                 <span className="icon text-3xl">{confirmDialog.isFinal ? 'warning' : 'help_outline'}</span>
              </div>
              <h3 className="text-xl font-bold text-textMain mb-2">{confirmDialog.title}</h3>
              <p className="text-textMuted text-sm leading-relaxed mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
                  className="flex-1 py-3 font-bold text-textMain bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                    if (!confirmDialog.preventClose) {
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }
                  }} 
                  className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 outline-none pb-8 md:pb-4" onClick={() => setSelectedTransaction(null)}>
          <div className="bg-card w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 border border-borderBase relative" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-bold text-textMain mb-4 border-b border-borderBase pb-3 flex justify-between items-center">
                Transaction Actions
                <span className="icon cursor-pointer text-textMuted hover:text-textMain" onClick={() => setSelectedTransaction(null)}>close</span>
              </h3>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    window.open(`/receipt/${selectedTransaction._id}`, '_blank');
                    setSelectedTransaction(null);
                  }}
                  className="w-full py-4 px-4 bg-primary-light/10 text-primary-dark font-bold rounded-xl flex items-center gap-3 hover:bg-primary-light/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-light/30 flex items-center justify-center shrink-0">
                    <span className="icon">receipt_long</span>
                  </div>
                  <span className="text-left flex-1">View & Download Receipt</span>
                  <span className="icon text-sm opacity-50">open_in_new</span>
                </button>

                <button 
                  onClick={() => {
                    const isPayment = selectedTransaction.type !== 'loan_disbursed';
                    const link = `${window.location.origin}/receipt/${selectedTransaction._id}`;
                    const text = `Hello ${customer.name},\nYour ${isPayment ? 'payment' : 'loan disbursement'} of ₹${selectedTransaction.amount} has been successfully recorded.\n\nPlease view and download your verified digital receipt here: ${link} \n\nThank you for choosing सुनार आभूषण.`;
                    
                    const cleanPhone = customer.phone.replace(/\D/g, '');
                    const mobileNumber = cleanPhone.slice(-10);
                    const url = `https://api.whatsapp.com/send?phone=91${mobileNumber}&text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                    setSelectedTransaction(null);
                  }}
                  className="w-full py-4 px-4 bg-[#25D366]/10 text-[#1DA851] font-bold rounded-xl flex items-center gap-3 hover:bg-[#25D366]/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0">
                    <span className="icon">chat</span>
                  </div>
                  <span className="text-left flex-1">Share via WhatsApp</span>
                  <span className="icon text-sm opacity-50">open_in_new</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SignatureModal 
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={async (dataURL) => {
          try {
            setIsUpdating(true);
            const blob = await (await fetch(dataURL)).blob();
            const file = new File([blob], "signature.png", { type: "image/png" });
            
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE_URL}/api/upload`, {
              method: "POST",
              body: formData,
            });
            const result = await res.json();
            if (res.ok) {
              await handleUpdateCustomer({ signatureUrl: result.url });
              setIsSignatureModalOpen(false);
            } else {
              alert("Upload failed: " + result.message);
            }
          } catch (err) {
            alert("Error saving signature.");
          } finally {
            setIsUpdating(false);
          }
        }}
      />

    </div>
  );
};

export default CustomerProfile;
