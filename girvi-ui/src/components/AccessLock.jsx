import React, { useState } from 'react';

// ==========================================
// EDIT YOUR 10-DIGIT SECURITY PIN RIGHT HERE:
// ==========================================
const SECRET_PIN = '9111465347'; 

const AccessLock = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === SECRET_PIN) { 
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 fixed inset-0 z-[100]">
      <div className="w-full max-w-sm bg-card p-8 md:p-10 rounded-[32px] shadow-2xl border-2 border-borderBase text-center relative overflow-hidden">
        {/* Top styling flare */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accentYellow to-primary"></div>
        
        <div className="w-20 h-20 bg-primary/10 text-primary mx-auto rounded-[24px] flex items-center justify-center mb-6 shadow-sm border border-primary/20">
          <span className="icon text-4xl">lock</span>
        </div>
        
        <h2 className="text-2xl font-bold text-textMain mb-2 tracking-tight">App Locked</h2>
        <p className="text-textMuted text-sm mb-8 font-medium">Please enter the 10-digit security PIN to access the Girvi App.</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            inputMode="numeric"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            placeholder="••••••••••"
            maxLength={10}
            className={`w-full text-center text-3xl tracking-widest py-5 bg-background border-2 rounded-2xl outline-none font-bold transition-all shadow-inner ${error ? 'border-red-500 text-red-500' : 'border-borderBase focus:border-primary text-primary'}`}
            autoFocus
          />
          <div className="h-6 mt-2">
             {error && <p className="text-red-500 text-xs font-bold animate-pulse">Incorrect PIN. Try again.</p>}
          </div>
          
          <button type="submit" className="w-full mt-4 bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2">
            Unlock <span className="icon">key</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccessLock;
