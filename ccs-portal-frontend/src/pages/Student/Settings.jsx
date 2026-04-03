import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Plus, 
  X, 
  Save, 
  Loader2, 
  Sparkles, 
  ShieldCheck,
  Building2,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const Settings = () => {
  const { profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    college: profile?.college || '',
    department: profile?.department || '',
    year: profile?.year || '',
    skills: profile?.skills || [],
    preferences: {
      skipSkillPrompt: profile?.preferences?.skipSkillPrompt || false
    }
  });

  // Sync with global identity state if updated elsewhere
  useEffect(() => {
    if (profile) {
      setFormData({
        college: profile.college || '',
        department: profile.department || '',
        year: profile.year || '',
        skills: profile.skills || [],
        preferences: {
          skipSkillPrompt: profile.preferences?.skipSkillPrompt || false
        }
      });
    }
  }, [profile]);

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/academic', { withCredentials: true });
        if (res.data.success) {
          const data = res.data.data;
          setSchools(data.filter(i => i.type === 'School').sort((a, b) => a.name.localeCompare(b.name)));
          setDepartments(data.filter(i => i.type === 'Department').sort((a, b) => a.name.localeCompare(b.name)));
          setYears(data.filter(i => i.type === 'Year').sort((a, b) => b.name.localeCompare(a.name)));
        }
      } catch (err) {
        toast.error("Failed to load institutional parameters");
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicData();
  }, []);

  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success("Identity Architecture Synchronized");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Initializing Parameters...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Identity Management</h1>
          </div>
          <p className="text-gray-500 font-medium ml-14">Maintain your institutional verification parameters and verified technical aptitude.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Institutional Data Card */}
          <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm transition-all hover:shadow-xl group">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                   <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">Academic Identity</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Institutional Verification</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">School / College</label>
                   <div className="relative group/input">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-blue-600 transition-colors pointer-events-none" />
                      <select 
                        value={formData.college}
                        onChange={(e) => setFormData({...formData, college: e.target.value, department: ''})}
                        className="w-full pl-16 pr-10 py-5 bg-gray-50 border-2 border-transparent rounded-[1.8rem] text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600/20 transition-all appearance-none cursor-pointer"
                        required
                      >
                         <option value="">Select School...</option>
                         {schools.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Department</label>
                   <div className="relative group/input">
                      <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-blue-600 transition-colors pointer-events-none" />
                      <select 
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full pl-16 pr-10 py-5 bg-gray-50 border-2 border-transparent rounded-[1.8rem] text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600/20 transition-all appearance-none cursor-pointer"
                        required
                        disabled={!formData.college}
                      >
                         <option value="">Select Department...</option>
                         {departments
                           .filter(d => !formData.college || d.parentId === schools.find(s => s.name === formData.college)?._id)
                           .map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Academic Year / Batch</label>
                   <div className="relative group/input">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-blue-600 transition-colors pointer-events-none" />
                      <select 
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full pl-16 pr-10 py-5 bg-gray-50 border-2 border-transparent rounded-[1.8rem] text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600/20 transition-all appearance-none cursor-pointer"
                        required
                      >
                         <option value="">Select Batch Year...</option>
                         {years.map(y => <option key={y._id} value={y.name}>{y.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                </div>
             </div>
          </section>

          {/* Technical Prowess Card */}
          <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm transition-all hover:shadow-xl group">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:text-emerald-600 transition-colors">
                   <Sparkles className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">Technical Prowess</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Skill Repository</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="flex flex-wrap gap-3 min-h-12 bg-gray-50/50 p-6 rounded-[2rem] border border-dashed border-gray-100">
                   {formData.skills.map(skill => (
                     <div key={skill} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-bold uppercase tracking-tight text-emerald-600 shadow-sm group/skill">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors">
                           <X className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   ))}
                   {formData.skills.length === 0 && <p className="text-xs text-gray-400 italic">No primary skills registered in your verified index.</p>}
                </div>

                <div className="relative group/skillinput">
                   <button 
                     type="button"
                     onClick={handleAddSkill}
                     className="absolute left-6 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-50 rounded-lg transition-colors group/plus"
                   >
                     <Plus className="w-6 h-6 text-gray-300 group-focus-within/skillinput:text-emerald-600 group-hover/plus:text-emerald-600 transition-colors" />
                   </button>
                   <input 
                     type="text"
                     value={newSkill}
                     onChange={(e) => setNewSkill(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                     placeholder="Inscribe new skill (e.g., Reactive Architecture, Neural Networks)..."
                     className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-emerald-600/20 transition-all placeholder:text-gray-300"
                   />
                </div>

                <div className="flex items-center gap-4 px-6 py-4 bg-emerald-50/20 border border-emerald-100 rounded-3xl">
                   <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                   <div>
                      <p className="text-xs font-bold text-emerald-700">Cognitive Synchronization</p>
                      <p className="text-[10px] text-emerald-600/70 font-medium">Validating your skills ensures your profile is prioritized for Elite Placement Matches.</p>
                   </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem]">
                   <span className="text-sm font-bold text-gray-600">Skip skill prompts during applications?</span>
                   <button
                     type="button"
                     onClick={() => setFormData({...formData, preferences: { ...formData.preferences, skipSkillPrompt: !formData.preferences.skipSkillPrompt }})}
                     className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.preferences.skipSkillPrompt ? 'bg-indigo-600' : 'bg-gray-200'}`}
                   >
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform ${formData.preferences.skipSkillPrompt ? 'translate-x-6 shadow-md' : 'translate-x-0'}`}></div>
                   </button>
                </div>
             </div>
          </section>

          <footer className="flex justify-end gap-6 pt-10">
             <button 
               type="submit" 
               disabled={saving}
               className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-sm flex items-center gap-3 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
             >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Synchronize Profile
             </button>
          </footer>
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
