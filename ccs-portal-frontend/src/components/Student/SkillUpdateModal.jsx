import React, { useState } from 'react';
import { X, Cpu, Plus, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const SkillUpdateModal = ({ isOpen, onClose, onApply }) => {
  const { profile, updateProfile } = useAuth();
  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipPrompt, setSkipPrompt] = useState(profile?.preferences?.skipSkillPrompt || false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile({
        skills,
        preferences: { skipSkillPrompt: skipPrompt }
      });
      
      if (res.success) {
        onApply();
        onClose();
      }
    } catch (err) {
      toast.error("Failed to synchronize curriculum skills");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
        
        <div className="p-10 relative">
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Cpu className="w-8 h-8" />
            </div>
            <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Refine Your Architecture</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">Ensure your core skills are synchronized before transmitting your application to acquisition teams.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Current Skill Stack</label>
              
              <div className="flex flex-wrap gap-2 mb-4 min-h-[4rem] p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-800">
                {skills.length > 0 ? skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold border border-gray-100 dark:border-slate-700 flex items-center gap-2 group/tag">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="text-gray-300 hover:text-rose-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )) : (
                  <p className="text-gray-400 text-xs italic py-2">No skills registered in dynamic profile...</p>
                )}
              </div>

              <div className="relative group">
                <button 
                  type="button" 
                  onClick={handleAddSkill}
                  className="absolute left-5 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-50 rounded-lg transition-colors group/plus"
                >
                  <Plus className="w-5 h-5 text-gray-300 group-focus-within:text-emerald-600 group-hover/plus:text-emerald-600 transition-colors" />
                </button>
                <input
                  type="text"
                  placeholder="Inscribe new skill (Press Enter)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-50 dark:focus:ring-emerald-900/10 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <button 
                type="button"
                onClick={() => setSkipPrompt(!skipPrompt)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${skipPrompt ? 'bg-emerald-600 border-emerald-600 shadow-sm' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
              >
                {skipPrompt && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer select-none" onClick={() => setSkipPrompt(!skipPrompt)}>
                Do not broadcast skill synchronization prompts in the future
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Transmit Application
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

export default SkillUpdateModal;
