import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import { api } from './utils/api';
import MainChat from './pages/MainChat';
import FirePlanner from './pages/FirePlanner';
import CommandCenter from './components/CommandCenter';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      if (localStorage.getItem('niveshak_token')) {
        const userData = await api.getMe();
        setUser(userData.profile);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      localStorage.removeItem('niveshak_token');
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
     return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><LoadingSpinner /></div>;
  }

  if (!isAuthenticated) {
    return <AuthModal onLoginSuccess={checkAuth} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f4f3ec] overflow-hidden">
      {/* Global Navigation Wrapper */}
      <Navigation user={user} onLogout={handleLogout} />
      
      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 h-full overflow-hidden">
        <Routes>
          <Route path="/" element={<MainChat />} />
          <Route path="/fire-plan" element={<FirePlanner />} />
          <Route path="/dashboard" element={<CommandCenter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}