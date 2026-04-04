import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Key, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from '../../services/authService';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const PasswordUpgradeModal = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // High-Level Security Logic: Check if user has an existing password
  const hasExistingPassword = profile?.hasPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (hasExistingPassword && !formData.currentPassword) {
      return toast.error("Current password is required for verification.");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Security Key must be at least 6 characters.");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (res.success) {
        toast.success("Security credentials upgraded successfully.");
        // Clear form
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        {/* Header */}
        <div className="p-8 pb-6 shrink-0 border-b border-gray-50 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Account Security</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1.5 leading-relaxed">
            {hasExistingPassword 
              ? "Update your portal credentials to maintain maximum protection." 
              : "Establish a secure login password for your portal identity."}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 pt-6 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Conditional Current Password Field */}
            {hasExistingPassword && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Verify Current identity
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Existing Password"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {!hasExistingPassword && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 flex items-start gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                  You are currently using <strong>Google SSO</strong>. Setting a password adds an extra layer of security and allows you to log in via email as well.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Create New Security Key</label>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Min. 6 Characters"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Confirm New Security Key</label>
                <div className="relative group">
                  <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat Password"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-emerald-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {hasExistingPassword ? "Update Credentials" : "Secure My Identity"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpgradeModal;
