import React, { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../api';

const Loans = ({ navigateTo, navParams }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState(navParams?.filterTab || 'All');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadLoans = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_ENDPOINTS.LOANS_ALL);
        if (!res.ok) throw new Error("Failed to load loans");
        const data = await res.json();
        if (isMounted) setLoans(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadLoans();
    return () => { isMounted = false; };
  }, []);

  const filteredLoans = useMemo(() => {
    let filtered = loans;
    if (filterTab === 'Active') {
      filtered = filtered.filter(l => l.status !== 'completed' && l.status !== 'rejected');
    } else if (filterTab === 'Completed') {
      filtered = filtered.filter(l => l.status === 'completed');
    }

    const q = search.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((loan) => {
      const name = loan.userId?.name?.toLowerCase() || "";
      const phone = loan.userId?.phone?.toLowerCase() || "";
      const item = loan.items && loan.items.length > 0 
        ? loan.items.map(i => i.itemName?.toLowerCase()).join(" ")
        : (loan.itemId?.itemName?.toLowerCase() || "");
      return name.includes(q) || phone.includes(q) || item.includes(q);
    });
  }, [loans, search, filterTab]);

  return (
    <div className="flex flex-col h-full bg-background view-padding pt-6 md:pt-10 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="icon cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-full transition-colors text-textMain" onClick={() => navigateTo('home')}>arrow_back</span>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-bold text-textMain">Loans</h2>
            <span className="text-textMuted text-sm">{loading ? "Loading..." : `${filteredLoans.length} loan${filteredLoans.length === 1 ? "" : "s"}`}</span>
          </div>
        </div>
        <button className="bg-card p-2 rounded-lg border border-borderBase cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => navigateTo('add-loan')}>
          <span className="icon text-textMain">add</span>
        </button>
      </div>

      <div className="bg-card px-5 py-4 rounded-xl border border-borderBase flex items-center gap-3 shadow-sm mb-4 transition-colors duration-300">
        <span className="icon text-textMuted text-xl">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer or item..."
          className="w-full bg-transparent outline-none text-textMain placeholder-textMuted font-medium text-base md:text-lg"
        />
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
        {['All', 'Active', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              filterTab === tab
                ? 'bg-primary text-white shadow-md'
                : 'bg-card text-textMuted border border-borderBase hover:border-primary/50 hover:text-primary dark:hover:bg-gray-800'
            }`}
          >
            {tab} Loans
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-borderBase">
          <span className="icon text-red-400 text-[80px] mb-6">error</span>
          <p className="text-textMuted font-semibold text-xl">{error}</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-borderBase">
          <span className="icon text-gray-300 dark:text-gray-600 text-[80px] mb-6">receipt_long</span>
          <p className="text-textMuted font-semibold text-xl">No Loans found!</p>
          <p className="text-gray-400 text-sm mt-2 text-center max-w-sm">Create a new loan to start tracking repayments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-28">
          {filteredLoans.map((loan) => (
            <div key={loan._id} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-textMain font-semibold text-lg">{loan.userId?.name || "Customer"}</span>
                  <span className="text-textMuted text-sm">{loan.userId?.phone || "No phone"}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-light/20 text-primary-dark capitalize">{loan.status}</span>
              </div>
              <div className="flex flex-col gap-2 text-sm text-textMuted">
                <div className="flex items-center gap-2">
                  <span className="icon text-base">diamond</span>
                  <span className="truncate max-w-[150px] md:max-w-[200px]" title={loan.items && loan.items.length > 0 ? loan.items.map(i => i.itemName).join(", ") : (loan.itemId?.itemName || "Item")}>
                    {loan.items && loan.items.length > 0
                      ? loan.items.map(i => i.itemName).join(", ")
                      : (loan.itemId?.itemName || "Item")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon text-base">payments</span>
                  <span>₹{loan.loanAmount} principal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon text-base">hourglass_empty</span>
                  <span>{loan.durationMonths} months</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon text-base">receipt_long</span>
                  <span>Total payable: ₹{loan.totalPayable ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon text-base">check_circle</span>
                  <span>Paid: ₹{loan.paidTotal ?? 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon text-base">pending</span>
                  <span>Remaining: ₹{loan.remaining ?? "-"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-borderBase text-xs text-textMuted">
                <span>Created</span>
                <span>{loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Loans;
