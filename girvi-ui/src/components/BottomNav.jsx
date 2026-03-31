import React from 'react';

const BottomNav = ({ currentView, navigateTo }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'customers', icon: 'group', label: 'Customers' },
    { id: 'dues', icon: 'checklist', label: 'Dues' },
    { id: 'account', icon: 'person', label: 'Account' }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full bg-card border-t border-borderBase flex justify-around md:justify-center md:gap-20 items-start z-50 transition-colors duration-300"
      style={{
        height: 'calc(70px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => navigateTo(tab.id)}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-16 pt-2 h-[70px] transition-colors ${
            currentView === tab.id ? 'text-primary' : 'text-textMuted hover:text-primary-light'
          }`}
        >
          <span className={`icon text-[26px] ${currentView === tab.id ? '' : 'outlined'}`}>{tab.icon}</span>
          <span className={`text-[10px] md:text-[11px] leading-tight ${currentView === tab.id ? 'font-semibold' : 'font-medium'}`}>
            {tab.label}
          </span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;