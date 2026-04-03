import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Briefcase,
  Award,
  Users,
  Settings,
  LogOut,
  Shield,
  Edit,
  GraduationCap,
  Book,
  ArrowLeft,
  Menu,
  School
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
      { icon: Shield, label: 'Access Control', path: '/admin/access-control' },
      { icon: Users, label: 'Faculty', path: '/admin/faculty' },
      { icon: GraduationCap, label: 'Students', path: '/admin/students' },
      { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
      { icon: Book, label: 'E-Library', path: '/admin/elibrary' },
      { icon: School, label: 'School Management', path: '/admin/schools' },
      { icon: Briefcase, label: 'Placement Drives', path: '/placement/manage' },
    ],
    faculty: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/faculty/dashboard' },
      { icon: Users, label: 'Profile', path: '/faculty/profile' },
      { icon: BookOpen, label: 'Courses', path: '/faculty/courses' },
      { icon: Award, label: 'Mock Tests', path: '/faculty/mock-tests' },
      { icon: Book, label: 'E-Library', path: '/faculty/elibrary' },
    ],
    placement: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/placement' },
      { icon: Briefcase, label: 'Manage Drives', path: '/placement/manage' },
    ],
    student: [
      { type: 'header', label: 'MAIN' },
      { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
      { icon: BookOpen, label: 'My Courses', path: '/student/courses' },
      { type: 'header', label: 'EVALUATION' },
      { icon: CheckSquare, label: 'Mock Tests', path: '/student/mock-tests' },
      { icon: Award, label: 'Certificates', path: '/student/certificates' },
      { type: 'header', label: 'CAREER' },
      { icon: Briefcase, label: 'Placements', path: '/student/placements' },
    ],
  };

  const items = menuItems[role] || [];

  // All active sidebars use dark styling to contrast with colored backgrounds
  const isDark = true;

  const getSidebarTheme = (roleName) => {
    switch (roleName) {
      case 'student': return "bg-[#79AE6F] border-[#65995b]";
      case 'faculty': return "bg-[#6367FF] border-[#4c50eb]";
      case 'placement': return "bg-[#6E026F] border-[#5e015e]";
      case 'admin':
      default: return "bg-[#0f172a] border-[#1e293b]";
    }
  };

  const getSidebarTitle = (roleName) => {
    switch (roleName) {
      case 'student': return "Student";
      case 'faculty': return "Faculty";
      case 'placement': return "Placement";
      case 'admin':
      default: return "Admin Panel";
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-50",
      isCollapsed ? "w-20" : "w-64",
      getSidebarTheme(role),
      "border-r relative"
    )}>
      <div className={cn(
        "h-16 flex items-center border-b transition-all duration-300 border-white/10",
        isCollapsed ? "justify-center px-0" : "px-6 justify-between"
      )}>
        {!isCollapsed && (
          <h2 className="text-white font-bold tracking-widest uppercase text-lg">
            {getSidebarTitle(role)}
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-black/10 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3 no-scrollbar">
        {items.map((item, index) => {
          if (item.type === 'header') {
            if (isCollapsed) return <div key={index} className="h-px bg-white/10 my-6" />;
            return (
              <div key={index} className="px-6 pt-8 pb-2 first:pt-0">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.25em] block border-b border-white/5 pb-2">{item.label}</span>
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                isActive
                  ? "bg-black/20 text-white shadow-lg shadow-black/10"
                  : "text-white/70 hover:bg-black/10 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                "opacity-90 group-hover:opacity-100 group-hover:scale-110"
              )} />

              {!isCollapsed && (
                <span className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap hidden md:block shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* We removed the User Footer completely from the Sidebar, moving its functionality to AdminNavbar */}
    </div>
  );
};
