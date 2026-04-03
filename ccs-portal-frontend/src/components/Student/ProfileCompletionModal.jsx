import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Building2, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const ProfileCompletionModal = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    college: profile?.college || '',
    department: profile?.department || '',
    year: profile?.year || ''
  });
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchAcademicData();
      // Sync form with profile if data arrived late
      if (profile) {
        setFormData({
          college: profile.college || '',
          department: profile.department || '',
          year: profile.year || ''
        });
      }
    }
  }, [isOpen, profile]);

  const fetchAcademicData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/academic', { withCredentials: true });
      if (res.data.success) {
        const data = res.data.data;
        setSchools(data.filter(i => i.type === 'School').sort((a, b) => a.name.localeCompare(b.name)));
        setDepartments(data.filter(i => i.type === 'Department').sort((a, b) => a.name.localeCompare(b.name)));
        setYears(data.filter(i => i.type === 'Year').sort((a, b) => b.name.localeCompare(a.name))); // Sort years descending
      }
    } catch (err) {
      console.error("Failed to load academic synchronization data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.college || !formData.department || !formData.year) {
      return toast.error("Please provide all profile parameters");
    }

    setLoading(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success("Profile Architecture Finalized");
        // Ensure state synchronization before closing
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      toast.error("Profile synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
        
        <div className="p-10 relative">
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Finalize Your Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">We need a few more details to synchronize your training and career opportunities.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Assigned School / College</label>
              <div className="relative group">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <select
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select School...</option>
                  {schools.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Academic Department</label>
              <div className="relative group">
                <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Department...</option>
                  {departments
                    .filter(d => !formData.college || d.parentId === schools.find(s => s.name === formData.college)?._id)
                    .map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Graduation Batch / Year</label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Batch Year...</option>
                  {years.map(y => <option key={y._id} value={y.name}>{y.name}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 mt-4 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Complete Onboarding
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

export default ProfileCompletionModal;
