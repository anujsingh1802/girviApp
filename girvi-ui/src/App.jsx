import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Fab from './components/Fab';
import InstallPrompt from './components/InstallPrompt';
import Home from './pages/Home';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import AddCustomer from './pages/AddCustomer';
import AddLoan from './pages/AddLoan';
import AddPayment from './pages/AddPayment';
import Loans from './pages/Loans';
import Dues from './pages/Dues';
import Account from './pages/Account';
import Report from './pages/Report';
import ItemsManagement from './pages/ItemsManagement';
import Transactions from './pages/Transactions';
import ReceiptView from './pages/ReceiptView';
import AccessLock from './components/AccessLock';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('girvi_auth_pin') === 'true';
  });
  const [currentView, setCurrentView] = useState('home');
  const [navParams, setNavParams] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navigateTo = (view, params = null) => {
    setCurrentView(view);
    setNavParams(params);
    setIsFabOpen(false);
  };

  const viewsWithoutNav = ['add-customer', 'add-loan', 'add-payment', 'report', 'loans', 'customer-profile', 'items-management', 'transactions'];
  const showNav = !viewsWithoutNav.includes(currentView);
  const showFab = ['home'].includes(currentView);

  if (!isAuthenticated) {
    return (
      <AccessLock onUnlock={() => {
        localStorage.setItem('girvi_auth_pin', 'true');
        setIsAuthenticated(true);
      }} />
    );
  }

  if (window.location.pathname.startsWith('/receipt/')) {
    const txnId = window.location.pathname.split('/receipt/')[1];
    return <ReceiptView txnId={txnId} />;
  }

  return (
    <div className="app-container">
      <div className="views-container">
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {currentView === 'home' && <Home navigateTo={navigateTo} />}
          {currentView === 'customers' && <Customers navigateTo={navigateTo} setSelectedCustomer={setSelectedCustomer} />}
          {currentView === 'customer-profile' && <CustomerProfile navigateTo={navigateTo} customerId={selectedCustomer} />}
          {currentView === 'add-customer' && <AddCustomer navigateTo={navigateTo} />}
          {currentView === 'add-loan' && <AddLoan navigateTo={navigateTo} />}
          {currentView === 'add-payment' && <AddPayment navigateTo={navigateTo} />}
          {currentView === 'loans' && <Loans navigateTo={navigateTo} navParams={navParams} />}
          {currentView === 'dues' && <Dues navigateTo={navigateTo} setSelectedCustomer={setSelectedCustomer} />}
          {currentView === 'account' && <Account navigateTo={navigateTo} isDark={isDark} setIsDark={setIsDark} />}
          {currentView === 'report' && <Report navigateTo={navigateTo} />}
          {currentView === 'items-management' && <ItemsManagement navigateTo={navigateTo} />}
          {currentView === 'transactions' && <Transactions navigateTo={navigateTo} />}
        </div>
      </div>

      {showFab && <Fab isFabOpen={isFabOpen} setIsFabOpen={setIsFabOpen} navigateTo={navigateTo} />}
      {showNav && <BottomNav currentView={currentView} navigateTo={navigateTo} />}
      <InstallPrompt />
    </div>
  );
}
