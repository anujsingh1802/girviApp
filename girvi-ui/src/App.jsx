import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Fab from './components/Fab';
import Home from './pages/Home';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import Dues from './pages/Dues';
import Account from './pages/Account';
import Report from './pages/Report';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsFabOpen(false);
  };

  const viewsWithoutNav = ['add-customer', 'report'];
  const showNav = !viewsWithoutNav.includes(currentView);
  const showFab = ['home'].includes(currentView);

  return (
    <div className="app-container">
      <div className="views-container pb-20">
        <div className="animate-in fade-in zoom-in-95 duration-200 h-full">
          {currentView === 'home' && <Home navigateTo={navigateTo} />}
          {currentView === 'customers' && <Customers navigateTo={navigateTo} />}
          {currentView === 'add-customer' && <AddCustomer navigateTo={navigateTo} />}
          {currentView === 'dues' && <Dues />}
          {currentView === 'account' && <Account navigateTo={navigateTo} isDark={isDark} setIsDark={setIsDark} />}
          {currentView === 'report' && <Report navigateTo={navigateTo} />}
        </div>
      </div>

      {showFab && <Fab isFabOpen={isFabOpen} setIsFabOpen={setIsFabOpen} navigateTo={navigateTo} />}
      {showNav && <BottomNav currentView={currentView} navigateTo={navigateTo} />}
    </div>
  );
}