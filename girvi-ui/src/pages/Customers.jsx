import React from 'react';

const Customers = ({ navigateTo }) => (
  <div className="flex flex-col h-full bg-background view-padding pt-6 md:pt-10 max-w-7xl mx-auto w-full">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-textMain">Customers</h2>
      <div className="bg-card p-2 rounded-lg border border-borderBase cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <span className="icon text-textMain">filter_list</span>
      </div>
    </div>
    
    <div className="bg-card px-5 py-4 rounded-xl border border-borderBase flex items-center gap-3 shadow-sm mb-6 transition-colors duration-300">
      <span className="icon text-textMuted text-xl">search</span>
      <input type="text" placeholder="Search by customer name or mobile number..." className="w-full bg-transparent outline-none text-textMain placeholder-textMuted font-medium text-base md:text-lg" />
    </div>

    <div className="flex-1 flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-borderBase">
      <span className="icon text-gray-300 dark:text-gray-600 text-[80px] mb-6">person_off</span>
      <p className="text-textMuted font-semibold text-xl">No Customers found!</p>
      <p className="text-gray-400 text-sm mt-2 text-center max-w-sm">You haven't added any customers yet. Add a new customer to start creating loans.</p>
    </div>

    {/* Local FAB just for customers */}
    <button onClick={() => navigateTo('add-customer')} className="fixed bottom-24 md:bottom-28 right-5 md:right-10 lg:right-16 w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-[20px] shadow-fab flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
      <span className="icon md:text-3xl">add</span>
    </button>
  </div>
);

export default Customers;