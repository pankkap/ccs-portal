import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { toast } from 'sonner';
import { Shield, GraduationCap, Briefcase, UserCheck, Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const navigate = useNavigate();

  const isStaff = roleParam === 'staff';

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        toast.success(`Welcome back, ${profile.name}!`);
        navigate('/dashboard');
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
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    toast.info("Email login is for demo purposes. Please use Google Login.");
  };

  // If no role is selected, default to student or show a selection (though Navbar handles it)
  useEffect(() => {
    if (!roleParam) {
      navigate('/login?role=student', { replace: true });
    }
  }, [roleParam, navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isStaff ? 'bg-[#0f172a]' : 'bg-[#e0f7f1]'}`}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          {/* Icon Header */}
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
            {isStaff ? 'Staff Portal' : 'Student Portal'}
          </h2>
          <p className="text-center text-gray-500 mb-8">
            {isStaff 
              ? 'Login for Admin, Faculty, and Placement Team members' 
              : 'Sign in with your university email (@iilm.edu)'}
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {isStaff ? 'Username' : 'University Email'}
              </label>
              <div className="relative">
                {!isStaff && (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type={isStaff ? "text" : "email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isStaff ? "admin" : "admin"}
                  className={`w-full ${isStaff ? 'px-4' : 'pl-12 pr-4'} py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                {!isStaff && (
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${isStaff ? 'px-4' : 'pl-12 pr-4'} py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full py-4 ${isStaff ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#0f9d58] hover:bg-[#0b8043]'} text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2`}
            >
              {isStaff && <LogIn className="w-5 h-5" />}
              {isStaff ? 'Login' : 'Sign In'}
            </motion.button>
          </form>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            {isStaff 
              ? 'Contact your administrator if you need access' 
              : 'Use the credentials provided by your faculty member'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
