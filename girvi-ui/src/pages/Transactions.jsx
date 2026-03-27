import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api';

const Transactions = ({ navigateTo }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ENDPOINTS.PAYMENT_HISTORY)
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
      <div className="bg-primary text-white px-6 py-5 md:py-6 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('home')}>arrow_back</span>
        <h2 className="text-xl md:text-2xl font-semibold">Transactions Log</h2>
      </div>

      <div className="view-padding py-8 flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center py-20"><span className="icon animate-spin text-4xl text-primary">autorenew</span></div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-card rounded-2xl border border-borderBase">
            <span className="icon text-gray-300 dark:text-gray-600 text-6xl mb-4">receipt_long</span>
            <p className="text-textMuted font-medium text-lg">No Transactions log available.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-borderBase shadow-sm overflow-hidden">
            {transactions.map((txn, i) => (
              <div key={txn._id} className={`p-4 md:p-5 flex items-center justify-between hover:bg-[var(--color-background)] transition-colors ${i !== transactions.length - 1 ? 'border-b border-borderBase' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${txn.type === 'loan_disbursed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                    <span className="icon">{txn.type === 'loan_disbursed' ? 'call_made' : 'call_received'}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-textMain text-base md:text-lg">{txn.userId?.name || 'Unknown Customer'}</h4>
                    <p className="text-sm text-textMuted">{txn.createdAt ? new Date(txn.createdAt).toLocaleString() : 'Date missing'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold block text-lg ${txn.type === 'loan_disbursed' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                    {txn.type === 'loan_disbursed' ? '- ' : '+ '}₹{txn.amount}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize inline-block mt-1 ${txn.type === 'loan_disbursed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {txn.status || 'success'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
