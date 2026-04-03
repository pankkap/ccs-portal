import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, LogOut, ArrowLeft, ChevronDown, User, Moon, Sun } from 'lucide-react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const AdminNavbar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync theme class on mount and state change
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    localStorage.setItem('theme', !isDarkTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <nav className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-[#1e293b] transition-colors duration-300 sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* CCS Portal Logo Component */}
          <div className="w-10 h-10 rounded-[10px] bg-[#1a56db] flex items-center justify-center shadow-sm">
            <span className="text-white text-[15px] font-bold tracking-tight">CCS</span>
          </div>
          <div className="leading-none hidden sm:flex flex-col justify-center ml-1">
            <h1 className="text-[20px] text-[#0f172a] dark:text-white font-[800] tracking-tight mb-1 transition-colors">CCS Portal</h1>
            <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 font-semibold transition-colors">IILM University</span>
          </div>
        </div>
      </div>

      {/* Right side: User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
        >
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center font-bold transition-colors">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left mr-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none transition-colors">{profile?.name || 'System Admin'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1 transition-colors">{profile?.role || 'Admin'}</p>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:text-white rounded-lg transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  Settings
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:text-white rounded-lg transition-colors flex items-center gap-3"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                  Back to Site
                </button>
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1 !mt-2 !mb-2"></div>
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:text-white rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {isDarkTheme ? <Moon className="w-4 h-4 text-gray-400" /> : <Sun className="w-4 h-4 text-gray-400" />}
                    {isDarkTheme ? 'Dark Mode' : 'Light Mode'}
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkTheme ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isDarkTheme ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </button>
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1 !mt-2 !mb-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default AdminNavbar;
