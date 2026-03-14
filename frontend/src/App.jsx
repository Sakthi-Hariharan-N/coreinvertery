import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Products from './Products';
import Operations from './Operations';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Basic auth check
    if (!token) {
      setActiveTab('auth');
    }
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setActiveTab('auth');
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-container animate-fade-in">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          CoreInventory
        </h1>
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </li>
          <li className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            📦 Products
          </li>
          <li className={`nav-item ${activeTab === 'operations' ? 'active' : ''}`} onClick={() => setActiveTab('operations')}>
            🔄 Operations
          </li>
          <li style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', borderRadius: 0 }} className="nav-item">
            👤 Profile Menu
          </li>
          <li className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            🚪 Logout
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <Products />}
        {activeTab === 'operations' && <Operations />}
      </main>
    </div>
  );
}
