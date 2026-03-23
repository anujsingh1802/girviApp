import React from 'react';

const Account = ({ navigateTo, isDark, setIsDark }) => {
  const menuItems = [
    { label: 'My Subscriptions', icon: 'workspace_premium', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400', action: null },
    { label: 'Buy Subscription', icon: 'store', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-400', action: null },
    { label: 'Items Management', icon: 'category', color: 'text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400', action: null },
    { label: 'Download Report', icon: 'download', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400', action: () => navigateTo('report') },
    { label: 'Theme Toggle', icon: isDark ? 'light_mode' : 'dark_mode', color: 'text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-300', action: () => setIsDark(!isDark), hasToggle: true },
    { label: 'Help & Support', icon: 'help', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', action: null },
    { label: 'Terms & Conditions', icon: 'gavel', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', action: null },
    { label: 'Privacy Policy', icon: 'policy', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', action: null }
  ];

  return (
    <div className="flex flex-col h-full bg-background pt-6 md:pt-10 max-w-3xl mx-auto w-full">
      <div className="px-6 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-textMain">Account Settings</h2>
      </div>

      <div className="px-6 mb-8">
        <div className="card flex items-center gap-5 p-6 shadow-md border-borderBase">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--color-background)] flex items-center justify-center shrink-0 border-4 border-borderBase">
             <span className="icon text-gray-400 dark:text-gray-600 text-[40px] md:text-[48px]">person</span>
          </div>
          <div className="flex flex-col flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-textMain leading-tight">Test User</h3>
            <p className="text-textMuted text-base font-medium mt-1">+91 9876543210</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800/50">Valid till: 31 Dec 2026</span>
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/50">100 SMS left</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-28 flex-1 overflow-y-auto">
        <h4 className="font-bold text-textMain mb-3 ml-2 text-sm uppercase tracking-wider opacity-60">Preferences</h4>
        <div className="card !p-3 flex flex-col shadow-sm border-borderBase">
          {menuItems.map((item, index) => (
            <div key={index} className="flex items-center p-3.5 hover:bg-[var(--color-background)] rounded-xl cursor-pointer transition-colors group" onClick={item.action}>
               <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mr-4 ${item.color} shadow-sm group-hover:scale-105 transition-transform`}>
                 <span className="icon text-[22px]">{item.icon}</span>
               </div>
               <span className="flex-1 font-bold text-textMain text-[15px]">{item.label}</span>
               
               {item.hasToggle ? (
                 <div className={`w-12 h-6.5 rounded-full relative mr-1 transition-colors duration-300 flex items-center ${isDark ? 'bg-primary' : 'bg-gray-300'}`}>
                   <div className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-all duration-300 ${isDark ? 'left-[24px]' : 'left-[3px]'}`}></div>
                 </div>
               ) : (
                 <span className="icon text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
               )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Account;