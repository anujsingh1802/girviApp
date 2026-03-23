import React from 'react';

const Fab = ({ isFabOpen, setIsFabOpen, navigateTo }) => {
  return (
    <div className="absolute right-5 md:right-10 lg:right-16 bottom-[90px] md:bottom-[100px] z-50 flex flex-col items-end">
      {/* Menu Options */}
      <div className={`flex flex-col gap-4 mb-4 transition-all duration-300 origin-bottom ${isFabOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { navigateTo('add-customer'); setIsFabOpen(false); }}>
          <span className="bg-primary-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-md transition-transform group-hover:scale-105">New Customer</span>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-soft transition-transform group-hover:scale-105"><span className="icon">person_add</span></div>
        </div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <span className="bg-primary-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-md transition-transform group-hover:scale-105">New Payment</span>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-soft transition-transform group-hover:scale-105"><span className="icon">payments</span></div>
        </div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <span className="bg-primary-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-md transition-transform group-hover:scale-105">New Loan</span>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-soft transition-transform group-hover:scale-105"><span className="icon">diamond</span></div>
        </div>
      </div>

      {/* Main Button */}
      <button 
        onClick={() => setIsFabOpen(!isFabOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-[20px] shadow-fab flex items-center justify-center transition-transform hover:bg-primary-dark duration-300 ${isFabOpen ? 'rotate-45' : ''}`}
      >
        <span className="icon text-[28px] md:text-[32px]">add</span>
      </button>
    </div>
  );
};

export default Fab;
