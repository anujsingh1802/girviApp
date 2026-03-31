import React, { useEffect, useState } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Already installed or dismissed before
    if (localStorage.getItem('pwa_install_dismissed')) return;

    // Running in standalone already (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('pwa_install_dismissed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-[85px] left-3 right-3 z-[200] animate-in slide-in-from-bottom-4 duration-300"
      style={{ maxWidth: 480, margin: '0 auto' }}
    >
      <div className="bg-card border border-borderBase rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <span className="icon text-white text-2xl">diamond</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-textMain text-sm leading-tight">Install GIRVI App</p>
          <p className="text-textMuted text-xs mt-0.5 leading-snug">
            Add to home screen for the best experience
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center text-textMuted hover:text-textMain transition-colors rounded-lg"
            aria-label="Dismiss"
          >
            <span className="icon text-[20px]">close</span>
          </button>
          <button
            onClick={handleInstall}
            className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl shadow-fab active:scale-95 transition-transform whitespace-nowrap"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
