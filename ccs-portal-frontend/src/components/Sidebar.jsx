import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Briefcase, 
  Award, 
  Users, 
  Settings, 
  LogOut
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

export const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
      { icon: Users, label: 'User Management', path: '/admin/users' },
      { icon: Settings, label: 'System Governance', path: '/admin/governance' },
    ],
    faculty: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/faculty' },
      { icon: BookOpen, label: 'Course Creation', path: '/faculty/course/new' },
      { icon: CheckSquare, label: 'Assessment Creation', path: '/faculty/assessment/new' },
    ],
    placement: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/placement' },
    ],
    student: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
      { icon: BookOpen, label: 'My Courses', path: '/student/courses' },
      { icon: CheckSquare, label: 'Mock Tests', path: '/student/mock-tests' },
      { icon: Award, label: 'Certificates', path: '/student/certificates' },
      { icon: Briefcase, label: 'Placements', path: '/student/placements' },
    ],
  };

  const items = menuItems[role] || [];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            CCS
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">CCS Portal</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">IILM University</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
