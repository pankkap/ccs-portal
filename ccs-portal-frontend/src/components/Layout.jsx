import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '../lib/utils';

export const Layout = ({ children, className }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {user && profile && <Sidebar role={profile.role} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className={cn("flex-1 overflow-y-auto p-4 md:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};
