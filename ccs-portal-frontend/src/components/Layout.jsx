import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import AdminNavbar from './AdminNavbar';
import ProfileCompletionModal from './Student/ProfileCompletionModal';
import { cn } from '../lib/utils';

export const Layout = ({ children, className }) => {
  const { user, profile, loading, isStudent } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Global Onboarding Synchronization
  React.useEffect(() => {
    const isSettingsPage = window.location.pathname === '/student/settings';
    
    if (isStudent && profile && !isSettingsPage) {
      const { college, department, year } = profile;
      const incomplete = !college || !department || !year || 
                        college.toString().trim() === '' || 
                        department.toString().trim() === '' || 
                        year.toString().trim() === '';
      
      if (incomplete) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } else {
      setShowOnboarding(false);
    }
  }, [isStudent, profile, window.location.pathname]);

  if (loading) return null;


  return (
    <div className="h-screen bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300 flex overflow-hidden">
      {user && profile && (
        <Sidebar role={profile.role} />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {user && profile ? (
          <AdminNavbar />
        ) : (
          <Navbar />
        )}
        <main className={cn("flex-1 overflow-y-auto p-4 md:p-8", className)}>
          {children}
        </main>
      </div>

      {/* Global Onboarding Overlay */}
      <ProfileCompletionModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
};
