import React, { useState, useEffect } from 'react';
import {
   Plus,
   MapPin,
   Briefcase,
   Globe,
   Link as LinkIcon,
   TrendingUp,
   Calendar,
   Layers,
   FileText,
   Save,
   ArrowLeft,
   ToggleLeft as Toggle,
   ToggleRight,
   ShieldCheck,
   Building2,
   Users,
   Tag,
   Hash,
   Check,
   X,
   School as SchoolIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import placementService from '../../services/placementService';
import academicService from '../../services/academicService';
import { Layout } from '../../components/Layout';

   const InputWrapper = ({ label, icon: Icon, children }) => (
      <div className="space-y-2">
         <label className="text-xs font-bold text-gray-500 flex items-center gap-2 ml-1">
            {Icon && <Icon className="w-3.5 h-3.5 text-blue-600" />}
            {label}
         </label>
         {children}
      </div>
   );

const CreatePlacementDrive = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const isEdit = !!id;

   const [loading, setLoading] = useState(false);
    const [driveData, setDriveData] = useState({
      companyName: '',
      role: '',
      jobDescription: '',
      companyType: 'Product Based',
      location: '',
      recruitmentProcess: '',
      companyLink: '',
      applyLink: '',
      eligibility: '',
      ctc: '',
      status: 'Open',
      deadline: '',
      targetSchools: [],
      targetDepartments: [],
      targetYears: [],
      skills: []
    });

    const [academicData, setAcademicData] = useState({
       schools: [],
       departments: [],
       years: []
    });

    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
       fetchAcademicData();
       if (isEdit) {
          fetchDriveDetails();
       }
    }, [id]);

    const fetchAcademicData = async () => {
       try {
          const res = await academicService.getAll();
          if (res.success) {
             setAcademicData({
                schools: res.data.filter(i => i.type === 'School'),
                departments: res.data.filter(i => i.type === 'Department'),
                years: res.data.filter(i => i.type === 'Year')
             });
          }
       } catch (err) {
          toast.error("Failed to fetch academic context");
       }
    };

   const fetchDriveDetails = async () => {
      try {
         const res = await placementService.getAllPlacements();
         if (res.success) {
            const drive = res.data.placements.find(d => d._id === id);
            if (drive) {
               setDriveData({
                  ...drive,
                  deadline: drive.deadline ? new Date(drive.deadline).toISOString().split('T')[0] : ''
               });
            }
         }
      } catch (err) {
         toast.error("Failed to fetch drive details");
      }
   };

   const handleSave = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         let res;
         if (isEdit) {
            res = await placementService.updateDrive(id, driveData);
         } else {
            res = await placementService.createDrive(driveData);
         }

         if (res.success) {
            toast.success(isEdit ? "Drive Architecture Updated" : "New Drive Broadcasted Successfully");
            navigate('/placement/manage');
         }
      } catch (err) {
         toast.error(isEdit ? "Update Failed" : "Initialization Failed");
      } finally {
         setLoading(false);
      }
   };

   const handleAddSkill = () => {
      if (skillInput.trim()) {
         if (!driveData.skills.includes(skillInput.trim())) {
            setDriveData({
               ...driveData,
               skills: [...driveData.skills, skillInput.trim()]
            });
         }
         setSkillInput('');
      }
   };

   return (
      <Layout>
         <div className="max-w-5xl mx-auto p-4 md:p-12 font-sans pb-32">
            {/* Header Control */}
            <div className="flex items-center justify-between mb-16 border-b border-gray-200 dark:border-gray-800 pb-12">
               <div className="flex items-center gap-6">
                  <button
                     onClick={() => navigate('/placement/manage')}
                     className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                     <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{isEdit ? 'Reconfigure Placement Drive' : 'Initialize Placement Drive'}</h1>
                     <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">Coordinate recruitment lifecycles and broadcast career opportunities.</p>
                  </div>
               </div>

                  <div className={`px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${driveData.status === 'Open' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                     onClick={() => setDriveData({ ...driveData, status: driveData.status === 'Open' ? 'Closed' : 'Open' })}
                  >
                     <span className="text-xs font-bold text-gray-900 dark:text-white">Status: {driveData.status}</span>
                     {driveData.status === 'Open' ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <Toggle className="w-5 h-5 text-rose-600" />}
                  </div>
            </div>

            <form onSubmit={handleSave} className="space-y-12">
               {/* Section 0: Target Audience */}
               <div className="p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full"></div>
                  <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8 text-gray-900 dark:text-white">
                     <Users className="w-6 h-6 text-blue-600" />
                     <h3 className="text-xl font-bold tracking-tight">Target Audience Selection</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <InputWrapper label="Target Schools" icon={SchoolIcon}>
                        <div className="space-y-2">
                           <select 
                              multiple
                              value={driveData.targetSchools}
                              onChange={(e) => {
                                 const values = Array.from(e.target.selectedOptions, option => option.value);
                                 setDriveData({...driveData, targetSchools: values});
                              }}
                              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-blue-600 transition-all min-h-[120px] no-scrollbar"
                           >
                              {academicData.schools.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                           </select>
                           <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2">Hold Ctrl/Cmd to select multiple</p>
                        </div>
                     </InputWrapper>

                     <InputWrapper label="Target Departments" icon={Building2}>
                        <div className="space-y-2">
                           <select 
                              multiple
                              value={driveData.targetDepartments}
                              onChange={(e) => {
                                 const values = Array.from(e.target.selectedOptions, option => option.value);
                                 setDriveData({...driveData, targetDepartments: values});
                              }}
                              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-blue-600 transition-all min-h-[120px] no-scrollbar"
                           >
                              {academicData.departments.map(d => (
                                 <option key={d._id} value={d.name}>
                                    {d.name} ({academicData.schools.find(s => s._id === d.parentId)?.name || 'Unknown'})
                                 </option>
                              ))}
                           </select>
                        </div>
                     </InputWrapper>

                     <InputWrapper label="Target Seniority" icon={Hash}>
                        <div className="space-y-2">
                           <select 
                              multiple
                              value={driveData.targetYears}
                              onChange={(e) => {
                                 const values = Array.from(e.target.selectedOptions, option => option.value);
                                 setDriveData({...driveData, targetYears: values});
                              }}
                              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-blue-600 transition-all min-h-[120px] no-scrollbar"
                           >
                              {academicData.years.map(y => <option key={y._id} value={y.name}>{y.name}</option>)}
                           </select>
                        </div>
                     </InputWrapper>
                  </div>
               </div>
               {/* Section 1: Company Profile */}
               <div className="p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full"></div>
                  <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8 text-gray-900 dark:text-white">
                     <Building2 className="w-6 h-6 text-blue-600" />
                     <h3 className="text-xl font-bold tracking-tight">Company Identity & Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-900 dark:text-white">
                     <InputWrapper label="Company Name" icon={Layers}>
                        <input
                           type="text"
                           required
                           value={driveData.companyName}
                           onChange={(e) => setDriveData({ ...driveData, companyName: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                           placeholder="e.g. Google Cloud Platform"
                        />
                     </InputWrapper>
                     <InputWrapper label="Company Type" icon={Building2}>
                        <select
                           value={driveData.companyType}
                           onChange={(e) => setDriveData({ ...driveData, companyType: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                        >
                           <option value="Product Based">Product Based Architecture</option>
                           <option value="Service Based">Service Based Architecture</option>
                        </select>
                     </InputWrapper>
                     <InputWrapper label="Role Specification" icon={Briefcase}>
                        <input
                           type="text"
                           required
                           value={driveData.role}
                           onChange={(e) => setDriveData({ ...driveData, role: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                           placeholder="e.g. Senior Software Architect"
                        />
                     </InputWrapper>
                     <InputWrapper label="Location Lattice" icon={MapPin}>
                        <input
                           type="text"
                           required
                           value={driveData.location}
                           onChange={(e) => setDriveData({ ...driveData, location: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                           placeholder="e.g. Remote / Bangalore Node"
                        />
                     </InputWrapper>
                  </div>
               </div>

               {/* Section 2: Financial & Eligibility */}
               <div className="p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] shadow-sm">
                  <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8 text-gray-900 dark:text-white">
                     <TrendingUp className="w-6 h-6 text-indigo-600" />
                     <h3 className="text-xl font-black uppercase tracking-tightest">Compensation & Thresholds</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-900 dark:text-white">
                     <InputWrapper label="Package (CTC)" icon={TrendingUp}>
                        <input
                           type="text"
                           value={driveData.ctc}
                           onChange={(e) => setDriveData({ ...driveData, ctc: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                           placeholder="e.g. 12 - 18 LPA"
                        />
                     </InputWrapper>
                     <InputWrapper label="Eligibility Check" icon={ShieldCheck}>
                        <input
                           type="text"
                           value={driveData.eligibility}
                           onChange={(e) => setDriveData({ ...driveData, eligibility: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                           placeholder="e.g. 60% Throughout / 2024 Batch"
                        />
                     </InputWrapper>
                     <InputWrapper label="Application Deadline" icon={Calendar}>
                        <input
                           type="date"
                           value={driveData.deadline}
                           onChange={(e) => setDriveData({ ...driveData, deadline: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all dark:invert dark:brightness-90 select-none"
                        />
                     </InputWrapper>
                  </div>
               </div>

               {/* Section 3: Content Repository */}
               <div className="p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] shadow-sm">
                  <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8 text-gray-900 dark:text-white">
                     <FileText className="w-6 h-6 text-indigo-600" />
                     <h3 className="text-xl font-black uppercase tracking-tightest">Knowledge Repository</h3>
                  </div>

                  <div className="space-y-10 text-gray-900 dark:text-white">
                     <InputWrapper label="Detailed Job Description" icon={FileText}>
                        <textarea
                           rows="6"
                           required
                           value={driveData.jobDescription}
                           onChange={(e) => setDriveData({ ...driveData, jobDescription: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl px-8 py-8 text-sm font-medium leading-relaxed outline-none focus:border-indigo-600 transition-all no-scrollbar"
                           placeholder="Architectural overview of the role and responsibilities..."
                        />
                     </InputWrapper>

                     <InputWrapper label="Recruitment Pipeline Process" icon={Users}>
                        <textarea
                           rows="6"
                           required
                           value={driveData.recruitmentProcess}
                           onChange={(e) => setDriveData({ ...driveData, recruitmentProcess: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl px-8 py-8 text-sm font-medium leading-relaxed outline-none focus:border-indigo-600 transition-all no-scrollbar"
                           placeholder="Step 1: Technical Screening\nStep 2: Architecture Discussion..."
                        />
                     </InputWrapper>

                     <InputWrapper label="Required Skills Architecture" icon={Tag}>
                        <div className="space-y-4">
                           <div className="flex flex-wrap gap-2">
                              {driveData.skills.map((skill, idx) => (
                                 <span key={idx} className="bg-indigo-600/10 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-600/20 group">
                                    {skill}
                                    <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setDriveData({...driveData, skills: driveData.skills.filter(s => s !== skill)})} />
                                 </span>
                              ))}
                           </div>
                           <div className="relative">
                              <input 
                                 type="text"
                                 value={skillInput}
                                 onChange={(e) => setSkillInput(e.target.value)}
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter' && skillInput.trim()) {
                                       e.preventDefault();
                                       handleAddSkill();
                                    }
                                 }}
                                 className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all pr-16"
                                 placeholder="Enter skill and press Enter (e.g. React.js, Python, AWS)"
                              />
                              <button 
                                 type="button"
                                 onClick={handleAddSkill}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                              >
                                 <Plus className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                     </InputWrapper>
                  </div>
               </div>

               {/* Section 4: External Links */}
               <div className="p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] shadow-sm">
                  <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8 text-gray-900 dark:text-white">
                     <Globe className="w-6 h-6 text-indigo-600" />
                     <h3 className="text-xl font-black uppercase tracking-tightest">External Gateway Nodes</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-900 dark:text-white">
                     <InputWrapper label="Company Portal Link" icon={LinkIcon}>
                        <input
                           type="url"
                           value={driveData.companyLink}
                           onChange={(e) => setDriveData({ ...driveData, companyLink: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all font-mono"
                           placeholder="https://company.com/careers"
                        />
                     </InputWrapper>
                     <InputWrapper label="Application Gateway (Form/Link)" icon={Globe}>
                        <input
                           type="url"
                           value={driveData.applyLink}
                           onChange={(e) => setDriveData({ ...driveData, applyLink: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-indigo-600 transition-all font-mono"
                           placeholder="https://forms.gle/application"
                        />
                     </InputWrapper>
                  </div>
               </div>

               {/* Non-Fixed Broadcast Bar */}
               <div className="mt-20 p-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                     <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Final Validation</h4>
                        <p className="text-sm font-medium text-gray-400 dark:text-gray-600 mt-1">Review your targeting configuration before broadcasting.</p>
                     </div>
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                        {loading ? (
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : <Save className="w-5 h-5" />}
                        {isEdit ? 'Update Configuration' : 'Broadcast Placement Drive'}
                     </button>
                  </div>
               </div>
            </form>
         </div>
      </Layout>
   );
};

export default CreatePlacementDrive;
