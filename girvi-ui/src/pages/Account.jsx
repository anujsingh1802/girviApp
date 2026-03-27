import React, { useState } from 'react';

const Account = ({ navigateTo, isDark, setIsDark }) => {
  const [showSupport, setShowSupport] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState(() => localStorage.getItem('ownerPhone') || '+91 9876543210');

  const handlePhoneSave = () => {
    localStorage.setItem('ownerPhone', ownerPhone);
    setIsEditingPhone(false);
  };

  const menuItems = [
    { label: 'Items Management', icon: 'category', color: 'text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400', action: () => navigateTo('items-management') },
    { label: 'Download Report', icon: 'download', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400', action: () => navigateTo('report') },
    { label: 'Theme Toggle', icon: isDark ? 'light_mode' : 'dark_mode', color: 'text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-300', action: () => setIsDark(!isDark), hasToggle: true },
    { label: 'Help & Support', icon: 'help', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', action: () => setShowSupport(true) }
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
            <h3 className="text-xl md:text-2xl font-bold text-textMain leading-tight">सुनर आभूषण</h3>
            {isEditingPhone ? (
               <div className="flex items-center gap-2 mt-2">
                 <input type="text" className="input-field !py-1 !px-2 !text-sm w-32" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} autoFocus />
                 <button onClick={handlePhoneSave} className="bg-primary text-white p-1 rounded-md hover:bg-primary-dark transition-colors"><span className="icon text-sm">check</span></button>
               </div>
            ) : (
               <p className="text-textMuted text-base font-medium mt-1 flex items-center gap-2">
                 {ownerPhone} 
                 <span className="icon text-[14px] cursor-pointer hover:text-primary transition-colors" onClick={() => setIsEditingPhone(true)}>edit</span>
               </p>
            )}
            <p className="text-textMuted text-xs font-medium mt-0.5 opacity-80">App made by Trozyx</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800/50">Valid till: Lifetime</span>
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

        <div className="card !p-0 mt-6 shadow-sm border-borderBase overflow-hidden">
          <div 
            onClick={() => {
              localStorage.removeItem('girvi_auth_pin');
              window.location.reload();
            }}
            className="flex items-center p-4 hover:bg-[var(--color-background)] cursor-pointer transition-colors group"
          >
             <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mr-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-sm group-hover:scale-105 transition-transform">
               <span className="icon text-[22px]">lock_outline</span>
             </div>
             <span className="flex-1 font-bold text-red-600 dark:text-red-500 text-[15px]">Lock App</span>
             <span className="icon text-gray-300 dark:text-gray-600 group-hover:text-red-500 transition-colors">chevron_right</span>
          </div>
        </div>
      </div>

      {showSupport && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 outline-none">
          <div className="bg-card w-full max-w-md rounded-2xl md:rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-borderBase relative">
            <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-textMuted hover:text-textMain transition-colors" onClick={() => setShowSupport(false)}>
              <span className="icon text-xl">close</span>
            </button>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-light/20 text-primary-dark rounded-full flex items-center justify-center mb-4">
                <span className="icon text-2xl">support_agent</span>
              </div>
              <h3 className="text-xl font-bold text-textMain mb-2">Help & Support</h3>
              <p className="text-textMuted text-sm leading-relaxed mb-6">
                 If you face any issues or technical difficulties with your Girvi App account, our dedicated support team is available to assist you. Please reach out to our assigned service providers via the contact numbers below for swift resolution and uninterrupted service.
              </p>
              
              <div className="flex flex-col gap-3">
                 <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-borderBase rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors">
                    <span className="font-bold text-sm text-textMain">Anuj Singh Thakur</span>
                    <a href="tel:9111465347" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"><span className="icon text-sm">call</span> 9111465347</a>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-borderBase rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors">
                    <span className="font-bold text-sm text-textMain">Sarthak</span>
                    <a href="tel:7999603547" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"><span className="icon text-sm">call</span> 7999603547</a>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-borderBase rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors">
                    <span className="font-bold text-sm text-textMain">Uday</span>
                    <a href="tel:8319436465" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"><span className="icon text-sm">call</span> 8319436465</a>
                 </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-borderBase flex justify-end">
               <button onClick={() => setShowSupport(false)} className="px-5 py-2 font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;