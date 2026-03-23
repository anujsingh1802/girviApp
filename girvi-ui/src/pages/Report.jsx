import React from 'react';

const Report = ({ navigateTo }) => (
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
            <input type="date" className="input-field py-3 text-base" defaultValue="2026-03-22" />
          </div>
          <div className="flex-1 border-t md:border-t-0 md:border-l border-borderBase md:pl-6 pt-6 md:pt-0">
            <label className="block text-sm font-semibold text-textMain mb-2">End date :</label>
            <input type="date" className="input-field py-3 text-base" defaultValue="2026-03-22" />
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
            <button className={`w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-sm transition-colors active:scale-95 ${item.btnClass}`}>
              Generate & Download <span className="icon text-[18px]">download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Report;
