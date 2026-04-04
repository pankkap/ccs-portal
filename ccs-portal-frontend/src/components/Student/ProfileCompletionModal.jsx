import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, GraduationCap, Building2, Calendar, ArrowRight, Loader2, ShieldCheck, Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const ProfileCompletionModal = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    college: profile?.college || '',
    department: profile?.department || '',
    year: profile?.year || '',
    rollNo: profile?.rollNo || '',
    cgpa: profile?.cgpa || 0
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
          year: profile.year || '',
          rollNo: profile.rollNo || '',
          cgpa: profile.cgpa || 0
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
    if (!formData.college || !formData.department || !formData.year || !formData.rollNo || formData.cgpa === '') {
      return toast.error("Please provide all profile parameters including CGPA.");
    }

    setLoading(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success("Profile Architecture Finalized");
        // Ensure state synchronization before closing
        setTimeout(() => {
          onClose();
          navigate('/student');
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
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl relative overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="p-8 pb-4 shrink-0 border-b border-gray-50 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Finalize Your Profile</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 leading-relaxed">Required details to synchronize your training lifecycle.</p>
        </div>

        <div className="p-8 pt-6 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Student Roll Identification</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="Ex: 23CSE..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Assigned School / College</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <select
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select School...</option>
                  {schools.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Academic Department</label>
              <div className="relative group">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Department...</option>
                  {departments
                    .filter(d => !formData.college || d.parentId === schools.find(s => s.name === formData.college)?._id)
                    .map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Batch Year</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Year...</option>
                    {years.map(y => <option key={y._id} value={y.name}>{y.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Current CGPA</label>
                <div className="relative group">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 ring-1 ring-transparent focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-100 dark:shadow-blue-900/10 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Synchronize Identity
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
