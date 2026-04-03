import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        const userProfile = response.data.user;
        setUser({ uid: userProfile._id || userProfile.id, email: userProfile.email });
        setProfile(userProfile);
        localStorage.setItem('profile', JSON.stringify(userProfile));
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('profile');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success) {
      await initAuth();
    }
    return res;
  };

  const refreshProfile = async () => {
    await initAuth();
  };
  
  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success) {
        setProfile(res.data.user);
        localStorage.setItem('profile', JSON.stringify(res.data.user));
      }
      return res;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Firebase profile listener removed as we use backend API now.

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    refreshProfile,
    updateProfile,
    isAdmin: profile?.role === 'admin',
    isFaculty: profile?.role === 'faculty',
    isPlacement: profile?.role === 'placement',
    isStudent: profile?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
