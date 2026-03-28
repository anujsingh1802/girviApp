import React, { useEffect, useState } from 'react';
import API_BASE_URL, { API_ENDPOINTS } from '../api';

const HeaderStatsRow = ({ label, value, colorClass }) => (
  <div className="flex justify-between items-center w-full mb-1">
    <span className="text-gray-200 text-sm font-medium">{label}</span>
    <span className={`text-base font-bold ${colorClass}`}>{value}</span>
  </div>
);

const Home = ({ navigateTo }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [intervalDays, setIntervalDays] = useState(2);
  const [customersCount, setCustomersCount] = useState(0);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [summary, setSummary] = useState({
    principal: { total: 0, active: 0, overdue: 0 },
    weight: { net: 0, gross: 0 }
  });

  useEffect(() => {
    let isMounted = true;

    const loadCustomersCount = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CUSTOMERS);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          const count = Array.isArray(data.customers) ? data.customers.length : 0;
          setCustomersCount(count);
        }
      } catch (err) {
        // Ignore count errors to keep home lightweight
      }
    };

    loadCustomersCount();

    const loadLoans = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.LOANS_ALL);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setLoans(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // Ignore loan errors for home
      }
    };

    const loadTransactions = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PAYMENT_HISTORY);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // Ignore errors
      } finally {
        if (isMounted) setLoadingTxns(false);
      }
    };

    const loadSummary = async () => {
      try {
        const queryParam = selectedCategory !== 'All' ? `?category=${selectedCategory}` : '';
        const res = await fetch(`${API_ENDPOINTS.DASHBOARD_SUMMARY}${queryParam}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        // Ignore summary errors
      }
    };

    const loadNotifications = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.NOTIFICATIONS);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setNotifications(data.notifications || []);
          setIntervalDays(data.settings?.intervalDays || 2);
        }
      } catch (err) {}
    };

    loadLoans();
    loadTransactions();
    loadSummary();
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const handleIntervalChange = async (e) => {
    const newVal = Number(e.target.value);
    setIntervalDays(newVal);
    await fetch(`${API_BASE_URL}/api/notifications/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intervalDays: newVal })
    });
  };

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: "PUT" });
  };

  const totalLoans = loans.length;
  const closedLoans = loans.filter((loan) => loan.status === "completed").length;
  const tenureExpired = loans.filter((loan) => loan.status === "defaulted").length;

  return (
    <div className="view-content pb-28">
      {/* Curved Purple Header */}
      <div className="bg-primary pt-6 px-6 md:px-12 pb-20 rounded-b-[32px] md:rounded-b-[64px] relative origin-top">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 text-white">
              <span className="icon text-accentYellow md:text-3xl">diamond</span>
              <h1 className="text-xl md:text-2xl font-bold tracking-wide">GIRVI <span className="font-normal opacity-90 text-sm md:text-base">(सुनर आभूषण)</span></h1>
            </div>
            <div className="relative">
              <span onClick={() => setShowNotifications(!showNotifications)} className="icon text-white cursor-pointer hover:text-gray-300 transition-colors md:text-3xl relative">
                notifications
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-primary"></span>
                )}
              </span>
              
              {showNotifications && (
                 <div className="absolute top-10 right-0 w-80 bg-card rounded-2xl shadow-xl z-50 border border-borderBase overflow-hidden hidden md:block" style={{ display: showNotifications ? 'block' : 'none'}}>
                    <div className="p-4 border-b border-borderBase flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                      <h3 className="font-bold text-textMain">Notifications</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-textMuted font-medium">Alert every:</span>
                        <input type="number" value={intervalDays} onChange={handleIntervalChange} className="w-12 bg-white dark:bg-gray-900 border border-borderBase rounded px-1 text-xs outline-none text-center text-textMain" min="1" max="30" />
                        <span className="text-xs text-textMuted">days</span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-2">
                       {notifications.length === 0 && <p className="text-sm text-center text-textMuted py-4">No new notifications</p>}
                       {notifications.map(n => (
                         <div key={n._id} className={`p-3 rounded-xl border ${n.isRead ? 'border-transparent bg-transparent' : 'border-primary/20 bg-primary/5'}`}>
                           <h4 className="text-sm font-bold text-textMain">{n.title}</h4>
                           <p className="text-xs text-textMuted mt-1">{n.message}</p>
                           {!n.isRead && <span onClick={() => markRead(n._id)} className="text-[10px] font-bold text-primary cursor-pointer hover:underline mt-2 inline-block uppercase">Mark as read</span>}
                         </div>
                       ))}
                    </div>
                 </div>
              )}
            </div>
          </div>

          {/* Responsive Header Inputs and Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            <div className="flex flex-col gap-5 flex-1 max-w-2xl">
              <div className="flex items-center gap-3">
                <label className="text-white font-medium text-lg">Interest :</label>
                <div className="bg-accentYellow px-4 py-2 rounded-xl flex items-center text-primary-dark font-bold shadow-sm">
                  <span className="text-lg">₹</span>
                  <span className="ml-1 text-primary-dark font-bold text-lg">
                    {loans.reduce((acc, l) => acc + (l.interest || 0), 0).toFixed(2)}
                  </span>
                  <span className="icon text-[20px] ml-1 opacity-80">info</span>
                </div>
              </div>

              <div className="flex gap-4">
                <select className="flex-1 bg-primary-dark focus:bg-primary text-white border-2 border-transparent focus:border-white rounded-xl p-3.5 text-sm md:text-base outline-none appearance-none cursor-pointer font-medium transition-colors">
                  <option>Select Duration</option>
                  <option>1 Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                </select>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 bg-primary-dark focus:bg-primary text-white border-2 border-transparent focus:border-white rounded-xl p-3.5 text-sm md:text-base outline-none appearance-none cursor-pointer font-medium transition-colors"
                >
                  <option value="All">All Metals</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:w-64 bg-primary-dark p-4 rounded-xl border border-white/10 shadow-sm relative overflow-hidden transition-all duration-500">
               {(() => {
                  const receivedAmount = loans.reduce((acc, l) => acc + (l.paidTotal || 0), 0);
                  const pendingAmount = loans.reduce((acc, l) => acc + ((l.remaining > 0) ? l.remaining : 0), 0);
                  const totalPayable = loans.reduce((acc, l) => acc + (l.totalPayable || 0), 0);

                  
                  return (
                    <div className="flex flex-col justify-center h-full transition-all duration-500">
                      <HeaderStatsRow label="Received :" value={`₹${receivedAmount.toFixed(2)}`} colorClass="text-accentGreen" />
                      <HeaderStatsRow label="Pending :" value={`₹${pendingAmount.toFixed(2)}`} colorClass="text-accentRed" />
                    </div>
                  );
               })()}
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area overlapping header */}
      <div className="px-5 md:px-12 -mt-10 md:-mt-12 relative z-10 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Main Stats Cards */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="card flex-1 flex flex-col hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-textMain text-sm md:text-base">Principal (Total)</span>
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                <span className="icon">percent</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 border-t border-borderBase pt-3">
              <div className="flex justify-between"><span className="text-textMuted text-sm">Total:</span><span className="text-textMain font-bold">₹{summary.principal.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-textMuted text-sm">Active:</span><span className="text-accentGreen font-bold">₹{summary.principal.active.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-textMuted text-sm">Overdue:</span><span className="text-accentRed font-bold">₹{summary.principal.overdue.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="card flex-1 flex flex-col hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-textMain text-sm md:text-base">Weight (Total)</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-primary text-primary shrink-0">
                <span className="icon">scale</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-1 border-t border-borderBase pt-4">
              <div className="text-textMuted text-sm font-medium flex justify-between">Net Weight: <span className="text-textMain font-bold">{summary.weight.net} gm</span></div>
              <div className="text-textMuted text-sm font-medium flex justify-between">Gross Weight: <span className="text-textMain font-bold">{summary.weight.gross} gm</span></div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { label: 'Customers', val: `${customersCount}`, icon: 'group', onClick: () => navigateTo('customers') },
            { label: 'Total Loans', val: `${totalLoans}`, icon: 'description', onClick: () => navigateTo('loans') },
            { label: 'Tenure Expired', val: `${tenureExpired}`, icon: 'hourglass_empty', onClick: () => navigateTo('loans') },
            { label: 'Closed Loans', val: `${closedLoans}`, icon: 'cancel', onClick: () => navigateTo('loans') }
          ].map(stat => (
            <div key={stat.label} onClick={stat.onClick} className="card flex items-center gap-4 !p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-[14px] bg-primary-light/10 text-primary-dark flex items-center justify-center shrink-0">
                <span className="icon">{stat.icon}</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-xl">{stat.val}</span>
                  <span className="icon text-gray-300 dark:text-gray-600 text-[18px]">chevron_right</span>
                </div>
                <span className="text-textMuted text-[12px] font-semibold uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-textMain font-bold text-lg">Recent Transactions</h3>
            <span onClick={() => navigateTo('transactions')} className="text-primary font-semibold text-sm cursor-pointer hover:underline">See all</span>
          </div>
          
          {loadingTxns ? (
             <div className="flex justify-center items-center py-10"><span className="text-textMuted font-medium">Loading transactions...</span></div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-card rounded-2xl border-2 border-dashed border-borderBase transition-colors">
               <span className="icon text-gray-300 dark:text-gray-600 text-6xl mb-4">receipt_long</span>
               <p className="text-textMuted font-medium text-lg">No Transactions found!</p>
               <button className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-medium shadow-sm active:scale-95 transition-transform" onClick={() => navigateTo('add-payment')}>Make a Transaction</button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-borderBase shadow-sm overflow-hidden mb-6">
              {transactions.slice(0, 5).map((txn, i, arr) => (
                <div key={txn._id} className={`p-4 flex items-center justify-between hover:bg-[var(--color-background)] transition-colors ${i !== arr.length - 1 ? 'border-b border-borderBase' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${txn.type === 'loan_disbursed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                      <span className="icon">{txn.type === 'loan_disbursed' ? 'call_made' : 'call_received'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-textMain">{txn.userId?.name || 'Customer'}</h4>
                      <p className="text-sm text-textMuted font-medium">{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold block ${txn.type === 'loan_disbursed' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                      {txn.type === 'loan_disbursed' ? '- ' : '+ '}₹{txn.amount}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${txn.type === 'loan_disbursed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {txn.status || 'success'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
