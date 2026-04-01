import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import authService from '../services/authService';
import { toast } from 'sonner';
import { Shield, GraduationCap, Briefcase, UserCheck, Mail, Lock, LogIn, Users, Settings, FileEdit } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const navigate = useNavigate();

  const isStaff = roleParam === 'staff' || roleParam === 'admin' || roleParam === 'faculty' || roleParam === 'placement';

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('google'); // 'google' or 'email'

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        toast.success(`Welcome back, ${profile.name}!`);
        
        // Redirect based on role
        if (profile.role === 'admin' || profile.role === 'staff') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // First time login - assign role based on param or default to student
        const assignedRole = roleParam || 'student';
        
        const profile = {
          id: user.uid,
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          photoURL: user.photoURL || '',
          role: assignedRole,
          status: 'active',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', user.uid), profile);
        toast.success(`Account created as ${assignedRole}!`);
        
        if (assignedRole === 'admin' || assignedRole === 'staff') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        toast.success(`Welcome back, ${response.data.user.name}!`);
        
        // Use window.location instead of navigate so AuthContext mounts and reads localStorage correctly
        if (response.data.user.role === 'admin' || response.data.user.role === 'staff') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error("Email login error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isStaff ? 'bg-[#0f172a]' : 'bg-[#e0f7f1]'}`}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          {/* Dynamic Role Icon Display */}
          <div className="flex justify-center mb-6">
            {isStaff ? (
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <GraduationCap className="w-8 h-8" />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {roleParam === 'admin' ? 'Admin Portal' : 
             roleParam === 'staff' ? 'Staff Portal' :
             roleParam === 'faculty' ? 'Faculty Portal' :
             roleParam === 'placement' ? 'Placement Portal' :
             'Student Portal'}
          </h2>
          <p className="text-center text-gray-500 mb-8">
            {roleParam === 'admin' ? 'Manage system settings, users, and content' :
             roleParam === 'staff' ? 'Manage web pages and portal content' :
             roleParam === 'faculty' ? 'Create courses and assessments' :
             roleParam === 'placement' ? 'Manage placement activities' :
             'Access courses, assessments, and placement opportunities'}
          </p>

          {/* Login Type Toggle */}
          <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setLoginType('google')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginType === 'google' ? 'bg-white shadow' : ''}`}
            >
              Google Login
            </button>
            <button
              onClick={() => setLoginType('email')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${loginType === 'email' ? 'bg-white shadow' : ''}`}
            >
              Email Login
            </button>
          </div>

          {loginType === 'google' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </motion.button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@iilm.edu"
                    className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
