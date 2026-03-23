import React from 'react';

const HeaderStatsRow = ({ label, value, colorClass }) => (
  <div className="flex justify-between items-center w-full mb-1">
    <span className="text-gray-200 text-sm font-medium">{label}</span>
    <span className={`text-base font-bold ${colorClass}`}>{value}</span>
  </div>
);

const Home = ({ navigateTo }) => {
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
            <span className="icon text-white cursor-pointer hover:text-gray-300 transition-colors md:text-3xl">notifications</span>
          </div>

          {/* Responsive Header Inputs and Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            <div className="flex flex-col gap-5 flex-1 max-w-2xl">
              <div className="flex items-center gap-3">
                <label className="text-white font-medium text-lg">Interest :</label>
                <div className="bg-accentYellow px-4 py-2 rounded-xl flex items-center text-primary-dark font-bold shadow-sm">
                  <span className="text-lg">₹</span>
                  <input type="number" defaultValue="0.00" className="bg-transparent border-none outline-none w-20 ml-1 text-primary-dark font-bold text-lg" />
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
                <select className="flex-1 bg-primary-dark focus:bg-primary text-white border-2 border-transparent focus:border-white rounded-xl p-3.5 text-sm md:text-base outline-none appearance-none cursor-pointer font-medium transition-colors">
                  <option>Metals</option>
                  <option>Gold</option>
                  <option>Silver</option>
                  <option>Platinum</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:w-64 bg-primary-dark p-4 rounded-xl border border-white/10 shadow-sm">
               <HeaderStatsRow label="Received :" value="₹0.00" colorClass="text-accentGreen" />
               <HeaderStatsRow label="Pending :" value="₹0.00" colorClass="text-accentRed" />
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
              <div className="flex justify-between"><span className="text-textMuted text-sm">Total:</span><span className="text-textMain font-bold">₹0.00</span></div>
              <div className="flex justify-between"><span className="text-textMuted text-sm">Active:</span><span className="text-accentGreen font-bold">₹0.00</span></div>
              <div className="flex justify-between"><span className="text-textMuted text-sm">Overdue:</span><span className="text-accentRed font-bold">₹0.00</span></div>
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
              <div className="text-textMuted text-sm font-medium flex justify-between">Net Weight: <span className="text-textMain font-bold">0 gm</span></div>
              <div className="text-textMuted text-sm font-medium flex justify-between">Gross Weight: <span className="text-textMain font-bold">0 gm</span></div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { label: 'Customers', val: '0', icon: 'group' },
            { label: 'Total Loans', val: '0', icon: 'description' },
            { label: 'Tenure Expired', val: '0', icon: 'hourglass_empty' },
            { label: 'Closed Loans', val: '0', icon: 'cancel' }
          ].map(stat => (
            <div key={stat.label} className="card flex items-center gap-4 !p-4 hover:shadow-md transition-shadow cursor-pointer">
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
            <span className="text-primary font-semibold text-sm cursor-pointer hover:underline">See all</span>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-card rounded-2xl border-2 border-dashed border-borderBase transition-colors">
             <span className="icon text-gray-300 dark:text-gray-600 text-6xl mb-4">receipt_long</span>
             <p className="text-textMuted font-medium text-lg">No Transactions found!</p>
             <button className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-medium shadow-sm active:scale-95 transition-transform" onClick={() => {}}>Make a Transaction</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;