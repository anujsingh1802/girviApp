import React, { useState, useEffect, useMemo } from 'react';
import { API_ENDPOINTS } from '../api';

const Dues = ({ navigateTo, setSelectedCustomer }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLoans = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.LOANS_ALL);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) setLoans(Array.isArray(data) ? data : []);
      } catch (err) {
        // Handle error
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLoans();
    return () => { isMounted = false; };
  }, []);

  const { upcomingDues, pastDues } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeLoans = loans.filter(l => l.remaining > 0);
    
    // Filter by search
    const filtered = activeLoans.filter(l => {
      const q = search.toLowerCase();
      const name = l.userId?.name?.toLowerCase() || '';
      const phone = l.userId?.phone?.toLowerCase() || '';
      return name.includes(q) || phone.includes(q);
    });

    const upcoming = [];
    const past = [];

    filtered.forEach(loan => {
      const dueDate = new Date(loan.endDate);
      if (dueDate < today) {
        past.push(loan);
      } else {
        upcoming.push(loan);
      }
    });

    return { upcomingDues: upcoming, pastDues: past };
  }, [loans, search]);

  const displayedDues = activeTab === 'upcoming' ? upcomingDues : pastDues;

  const handleWhatsApp = (e, loan) => {
    e.stopPropagation();
    if (!loan.userId?.phone) return;
    
    let text = `Hello ${loan.userId.name},\nThis is a friendly reminder from सुनर आभूषण.\n`;
    text += `Your loan for ${loan.items && loan.items.length > 0 ? loan.items.map(i => i.itemName).join(', ') : (loan.itemId?.itemName || "Item")} is due. Your current pending amount is ₹${loan.remaining.toFixed(2)}.\n`;
    text += `Kindly clear the dues at the earliest.\nThank you!`;
    
    const cleanPhone = loan.userId.phone.replace(/\D/g, '');
    const mobileNumber = cleanPhone.slice(-10);
    const url = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-background pt-6 md:pt-10 max-w-5xl mx-auto w-full">
      <div className="px-6 md:px-12 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-textMain">Pending Dues</h2>
      </div>

      <div className="px-6 md:px-12 mb-6">
        <div className="flex bg-card p-1.5 rounded-xl border border-borderBase transition-colors duration-300 shadow-sm max-w-md">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-primary text-white shadow-md transform scale-[1.02]' : 'text-textMuted hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Upcoming Dues
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-primary text-white shadow-md transform scale-[1.02]' : 'text-textMuted hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Past Dues
          </button>
        </div>
      </div>

      <div className="px-6 md:px-12 mb-6">
        <div className="bg-card px-5 py-4 rounded-xl border border-borderBase flex items-center gap-3 shadow-sm transition-colors duration-300">
          <span className="icon text-textMuted text-xl">search</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dues by customer name..." className="w-full bg-transparent outline-none text-textMain placeholder-textMuted font-medium text-base md:text-lg" />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20"><span className="text-textMuted font-medium text-lg">Loading dues...</span></div>
      ) : displayedDues.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 mx-6 md:mx-12 mb-6 bg-card rounded-2xl border border-borderBase shadow-sm">
          <span className="icon text-gray-300 dark:text-gray-600 text-[80px] mb-6">receipt_long</span>
          <p className="text-textMuted font-semibold text-xl">No {activeTab} dues found!</p>
          <p className="text-gray-400 text-sm mt-2 text-center max-w-sm">All cleared up. There are no pending transactions for this filter.</p>
        </div>
      ) : (
        <div className="px-6 md:px-12 pb-28 grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedDues.map(loan => (
            <div 
              key={loan._id} 
              onClick={() => { setSelectedCustomer(loan.userId._id); navigateTo('customer-profile'); }}
              className="card p-5 border border-borderBase flex flex-col gap-3 relative hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-textMain font-bold text-lg">{loan.userId?.name || 'Customer'}</span>
                  <span className="text-sm font-semibold text-textMuted bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md w-max mt-1 mb-2 truncate max-w-full">
                    {loan.items && loan.items.length > 0 ? loan.items.map(i => i.itemName).join(', ') : (loan.itemId?.itemName || "Item")} 
                    • [{loan.items && loan.items.length > 0 ? Array.from(new Set(loan.items.map(i => i.category))).join(', ') : (loan.itemId?.category || "Unknown")}]
                  </span>
                  <span className="text-xs text-textMuted font-medium block">Due Date: {new Date(loan.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${activeTab === 'past' ? 'bg-red-100 text-red-600' : 'bg-primary-light/20 text-primary'}`}>
                    {activeTab === 'past' ? 'Overdue' : 'Upcoming'}
                  </span>
                  <button onClick={(e) => handleWhatsApp(e, loan)} className="bg-[#25D366] hover:bg-[#1DA851] text-white p-1.5 rounded-lg shadow-sm transition-colors mt-1">
                    <span className="icon text-sm">chat</span>
                  </button>
                </div>
              </div>
              <div className="mt-2 pt-3 border-t border-borderBase grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-textMuted text-xs">Total Loan</span>
                  <span className="font-bold text-textMain">₹{loan.loanAmount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-textMuted text-xs">Interest</span>
                  <span className="font-bold text-accentYellow">₹{loan.interest?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-textMuted text-xs">Pending Amount</span>
                  <span className="font-bold text-accentRed text-base">₹{loan.remaining.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dues;