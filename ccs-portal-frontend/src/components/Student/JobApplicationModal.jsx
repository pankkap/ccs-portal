import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, Sparkles, Plus, Trash2, ShieldCheck, Briefcase, Target, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import placementService from '../../services/placementService';
import uploadService from '../../services/uploadService';

const JobApplicationModal = ({ isOpen, onClose, job, onSuccess }) => {
  const { profile } = useAuth();
  const [skills, setSkills] = useState(() => {
    if (!profile?.skills) return [];
    if (Array.isArray(profile.skills)) return profile.skills;
    return profile.skills.split(',').map(s => s.trim()).filter(s => s);
  });
  const [newSkill, setNewSkill] = useState('');
  const [resumeUrl, setResumeUrl] = useState(profile?.resume || '');
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
       return toast.error("Curriculum Dossier must be in PDF format.");
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Dossier size exceeds 5MB limit.");
    }

    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        setResumeUrl(res.data.url);
        toast.success("Dossier Synchronized Successfully!");
      }
    } catch (error) {
      toast.error("Cloud synchronization failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleApplication = async () => {
    if (!resumeUrl) {
      return toast.error("Dossier (CV) is mandatory for this drive.");
    }

    setApplying(true);
    try {
      const res = await placementService.applyForJob({
        placementId: job._id,
        skills: skills,
        resume: resumeUrl,
        notes: "Institutional dossier submitted with profile skills alignment."
      });

      if (res.success) {
        toast.success(`Application Transmitted to ${job.companyName}!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      // 400 = Already applied — treat gracefully, refresh the page state
      if (error?.response?.status === 400) {
        toast.info("You have already applied to this drive. Refreshing status...");
        onSuccess();
        onClose();
      } else {
        toast.error(error?.response?.data?.message || "Transmission failure. Please try again.");
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        <header className="p-10 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Sync Professional Dossier</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Completing Application for {job.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {/* Skill Alignment section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <Target className="w-5 h-5 text-blue-600" />
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Skill Alignment & Tagging</h3>
            </div>
            
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
               <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="px-4 py-2 bg-white border border-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                       {skill}
                       <button onClick={() => removeSkill(index)} className="text-gray-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                       </button>
                    </div>
                  ))}
               </div>
               
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add specific tech stack or skill..."
                    className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                  />
                  <button 
                    onClick={handleAddSkill}
                    className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </section>

          {/* CV Upload Section */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
               <FileText className="w-5 h-5 text-blue-600" />
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global CV / Dossier Repository</h3>
            </div>

            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-[40px] text-center transition-all cursor-pointer group ${resumeUrl ? 'border-green-200 bg-green-50/20' : 'border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/20'}`}
            >
               {uploading ? (
                 <div className="space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Verifying Digital Integrity...</p>
                 </div>
               ) : resumeUrl ? (
                 <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-[28px] flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                       <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 uppercase">Dossier Locked & Ready</p>
                      <p className="text-[10px] text-gray-500 font-bold mt-1">Click to re-upload your professional CV</p>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="w-16 h-16 bg-white rounded-[28px] border border-gray-100 flex items-center justify-center text-gray-300 mx-auto group-hover:scale-110 transition-transform shadow-sm">
                       <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-600 uppercase tracking-tight">Sync Professional CV (PDF)</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Maximum File Size: 5MB</p>
                    </div>
                 </div>
               )}
               <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 onChange={handleFileUpload}
                 accept=".pdf"
               />
            </div>
          </section>

          {/* Warning/Info */}
          <div className="p-6 bg-red-50/50 border border-red-50 rounded-[32px] flex items-start gap-4">
             <ShieldCheck className="w-6 h-6 text-red-400 shrink-0 mt-1" />
             <p className="text-[11px] text-red-800 leading-relaxed font-medium">
               <span className="font-black uppercase tracking-tight block mb-1">Institutional Disclaimer</span>
               Submission of this dossier constitutes a formal application. Your verified academic records and professional skills will be synchronized with the recruiter's corporate vault.
             </p>
          </div>
        </div>

        <footer className="p-10 border-t border-gray-50 bg-gray-50/30 flex items-center justify-center shrink-0">
           <button 
             onClick={handleApplication}
             disabled={applying || uploading || !resumeUrl}
             className="px-16 py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 flex items-center gap-3 relative overflow-hidden group"
           >
             {applying ? (
               <>
                 <Loader2 className="w-5 h-5 animate-spin" />
                 Transmitting...
               </>
             ) : (
               <>
                 <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                 Confirm & Deploy Dossier
               </>
             )}
           </button>
        </footer>
      </div>
    </div>
  );
};

export default JobApplicationModal;
