import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage first (for backend JWT auth)
    const localToken = localStorage.getItem('token');
    const localProfile = localStorage.getItem('profile');
    
    if (localToken && localProfile) {
      try {
        const parsedProfile = JSON.parse(localProfile);
        setUser({ uid: parsedProfile._id || parsedProfile.id, email: parsedProfile.email });
        setProfile(parsedProfile);
        setLoading(false);
        return; // Don't subscribe to Firebase if using JWT backend
      } catch (e) {
        console.error('Error parsing local profile', e);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!localToken) { // Only update from Firebase if no backend token exists
        setUser(user);
        if (!user) {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Skip if we already loaded from local storage (meaning JWT auth is used)
    const localToken = localStorage.getItem('token');
    if (localToken && profile) return;

    if (user && !localToken) {
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        } else {
          // Profile might not exist yet if it's a new user
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });

      return () => unsubscribeProfile();
    }
  }, [user]);

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    await auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
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
