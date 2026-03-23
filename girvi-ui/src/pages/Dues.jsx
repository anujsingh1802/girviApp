import React, { useState } from 'react';

const Dues = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

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
          <input type="text" placeholder="Search dues by customer name..." className="w-full bg-transparent outline-none text-textMain placeholder-textMuted font-medium text-base md:text-lg" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 mx-6 md:mx-12 mb-6 bg-card rounded-2xl border border-borderBase shadow-sm">
        <span className="icon text-gray-300 dark:text-gray-600 text-[80px] mb-6">receipt_long</span>
        <p className="text-textMuted font-semibold text-xl">No {activeTab} dues found!</p>
        <p className="text-gray-400 text-sm mt-2 text-center max-w-sm">All cleared up. There are no pending transactions for this filter.</p>
      </div>
    </div>
  );
};

export default Dues;