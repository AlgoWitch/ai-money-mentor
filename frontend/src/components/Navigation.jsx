import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Flame, LayoutDashboard, LogOut } from 'lucide-react';
import { api } from '../utils/api';

export default function Navigation({ user, onLogout }) {
  const menuItems = [
    { name: 'Niveshak Chat', icon: <MessageSquare size={20} />, path: '/' },
    { name: 'FIRE Planner', icon: <Flame size={20} />, path: '/fire-plan' },
    { name: 'Command Center', icon: <LayoutDashboard size={20} />, path: '/dashboard' }
  ];

  return (
    <nav className="w-full md:w-64 bg-ql-bg/90 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/30 p-4 flex flex-row md:flex-col justify-between items-center md:items-stretch shadow-sm z-50">
      <div className="flex flex-col gap-8">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold tracking-tight text-ql-dark flex items-center gap-2">
            Niveshak AI
            <span className="bg-ql-primary text-ql-dark text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest hidden lg:inline-block">PRO</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 truncate">{user?.name || 'Private Mentor'}</p>
        </div>

        <div className="flex flex-row md:flex-col gap-2 w-full">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-ql-dark text-white shadow-soft font-semibold'
                    : 'text-slate-500 hover:bg-white/50 hover:text-ql-dark font-medium'
                }`
              }
            >
              {item.icon}
              <span className="hidden md:block">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <button 
         onClick={onLogout} 
         className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors mt-0 md:mt-8"
      >
        <LogOut size={20} />
        <span className="hidden md:block font-medium">Secure Logout</span>
      </button>
    </nav>
  );
}
