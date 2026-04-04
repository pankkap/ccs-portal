import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { 
  BookOpen, CheckCircle, Lock, ArrowLeft, CheckCircle2, 
  Video, ExternalLink, FileDown, Loader2, Sparkles, 
  ShieldCheck, ShieldAlert, Zap, Layers 
} from 'lucide-react';
import { toast } from 'sonner';
import enrollmentService from '../../services/enrollmentService';
import testService from '../../services/testService';
import TestOverlay from '../../components/TestOverlay';

const CourseView = () => {
  const { courseId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assessment State
  const [activeTest, setActiveTest] = useState(null); // { testId, moduleId, type: 'module' | 'final' }

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const enrollRes = await enrollmentService.getEnrollmentByCourseId(courseId);
      if (enrollRes.success) {
        setEnrollment(enrollRes.data.enrollment);
        setCourse(enrollRes.data.enrollment.courseId);
        setModules(enrollRes.data.enrollment.courseId.modules || []);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Curriculum synchronization failed.");
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const isModulePassed = (moduleId, assessmentId) => {
    if (!enrollment) return false;
    if (!assessmentId) return enrollment.completedModules.includes(moduleId);
    
    // Check if there is a 'passed' attempt for this assessmentId in the record
    return enrollment.assessmentAttempts?.some(
      a => a.testId.toString() === assessmentId.toString() && a.status === 'passed'
    );
  };

  const handleManualComplete = async (moduleId) => {
    if (!enrollment) return;
    
    const alreadyCompleted = enrollment.completedModules.includes(moduleId);
    if (alreadyCompleted) return;

    try {
      const updatedModules = [...enrollment.completedModules, moduleId];
      const progress = Math.round((updatedModules.length / modules.length) * 100);
      
      const res = await enrollmentService.updateProgress(enrollment._id, {
        completedModules: updatedModules,
        progress
      });
      
      if (res.success) {
        setEnrollment(res.data.enrollment);
        toast.success("Module archived as completed!");
      }
    } catch (error) {
      toast.error("Failed to archive progress");
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Synchronizing Dossier...</p>
      </div>
    </Layout>
  );

  if (!course) return null;

  // Final Assessment Unlock Logic: All modules must be passed
  const allModulesPassed = modules.every((m, idx) => isModulePassed(m._id, m.assessmentId));
  const finalPassed = enrollment?.assessmentAttempts?.some(
    a => a.testId.toString() === course.finalAssessmentId?.toString() && a.status === 'passed'
  );

  // Self-heal visual progress for stuck enrollments
  let calculatedProgress = enrollment?.progress || 0;
  if (enrollment && modules.length > 0) {
     const dynamicProgress = Math.round(((enrollment.completedModules?.length || 0) / modules.length) * 100);
     if (dynamicProgress > calculatedProgress) {
        if (dynamicProgress >= 100 && course.finalAssessmentId && !finalPassed) {
           calculatedProgress = 99;
        } else {
           calculatedProgress = dynamicProgress;
        }
     }
  }

  return (
    <Layout>
      {/* Test Immersive Mode Overlay */}
      {activeTest && (
        <TestOverlay 
          testId={activeTest.testId}
          enrollmentId={enrollment._id}
          moduleId={activeTest.moduleId}
          onClose={() => setActiveTest(null)}
          onComplete={() => {
            setActiveTest(null);
            fetchData(); // Refresh to unlock progression
          }}
        />
      )}

      <div className="max-w-7xl mx-auto pb-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 px-4">
          <div className="space-y-6 max-w-3xl">
            <Link to="/student/dashboard" className="inline-flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-all group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Archives / {course.title}
            </Link>
            <div className="space-y-2">
               <h1 className="text-6xl font-black text-gray-950 tracking-tightest leading-[0.9]">{course.title}</h1>
               <div className="flex items-center gap-4 pt-2">
                 <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                    <Sparkles className="w-3 h-3" /> Active Dossier
                 </div>
                 <p className="text-gray-400 font-bold text-sm tracking-tight">• Managed by {course.facultyName}</p>
               </div>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed font-medium line-clamp-3">{course.description}</p>
          </div>

          {/* Progress Circular Visualization */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-8 group hover:shadow-2xl transition-all">
             <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                   <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                   <circle 
                    cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-blue-600 transition-all duration-1000"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * calculatedProgress) / 100}
                   />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-xl font-black text-gray-900">{calculatedProgress}%</span>
                </div>
             </div>
             <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Competency</h3>
                <p className="text-xl font-black text-gray-900">{enrollment?.status === 'completed' ? 'Certified' : 'In Progress'}</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4">
          {/* Main Curriculum Ledger */}
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-950 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                Pedagogical Phasing
              </h2>
              
              <div className="space-y-4">
                {modules.map((module, i) => {
                  const assessmentId = module.assessmentId;
                  const isPassed = isModulePassed(module._id, assessmentId);
                  
                  // A module is LOCKED if the PREVIOUS module is not passed
                  const isLocked = i > 0 && !isModulePassed(modules[i-1]._id, modules[i-1].assessmentId);
                  const isCurrent = !isPassed && !isLocked;

                  return (
                    <div key={module._id || i} className={`bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden relative group ${
                        isPassed ? 'border-emerald-100 bg-emerald-50/5' : 
                        isLocked ? 'border-gray-50 opacity-40 grayscale pointer-events-none scale-95' : 
                        'border-white shadow-sm hover:shadow-2xl hover:border-blue-100'
                      }`}>
                      
                      {isLocked && (
                         <div className="absolute inset-0 bg-gray-50/20 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <Lock className="w-10 h-10 text-gray-300" />
                         </div>
                      )}

                      <div className="p-8 flex items-center justify-between gap-8">
                        <div className="flex items-center gap-8 min-w-0">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm transition-all ${
                            isPassed ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white'
                          }`}>
                            {module.type === 'video' ? <Video className="w-7 h-7" /> : module.type === 'pdf' ? <FileDown className="w-7 h-7" /> : module.type === 'assessment' ? <ShieldCheck className="w-7 h-7" /> : <ExternalLink className="w-7 h-7" />}
                          </div>
                          
                          <div className="min-w-0">
                             <div className="flex items-center gap-3 mb-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                   Phase {i + 1} • {module.type}
                                </span>
                                {assessmentId && (
                                   <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1">
                                      <Zap className="w-3 h-3" /> Audit Required
                                   </span>
                                )}
                             </div>
                             <h3 className={`font-black text-xl truncate tracking-tight transition-colors ${isPassed ? 'text-emerald-900' : 'text-gray-900'}`}>
                                {module.title}
                             </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                           {module.type !== 'assessment' && module.contentUrl && (
                              <a 
                                href={module.contentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  isPassed ? 'text-emerald-600 bg-emerald-50' : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-blue-600 hover:text-blue-600'
                                }`}
                              >
                                Access Asset
                              </a>
                           )}

                           {assessmentId ? (
                              <button 
                                onClick={() => setActiveTest({ testId: assessmentId, moduleId: module._id, type: 'module' })}
                                disabled={isPassed}
                                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
                                   isPassed 
                                     ? 'bg-emerald-100 text-emerald-700 cursor-default flex items-center gap-2' 
                                     : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                                }`}
                              >
                                 {isPassed ? <><CheckCircle2 className="w-4 h-4" /> Passed</> : 'Initiate Audit'}
                              </button>
                           ) : (
                              <button 
                                onClick={() => handleManualComplete(module._id)}
                                disabled={isPassed}
                                className={`p-4 rounded-2xl transition-all ${
                                   isPassed 
                                     ? 'bg-emerald-500 text-white' 
                                     : 'bg-gray-50 text-gray-300 hover:bg-emerald-50 hover:text-emerald-500 border border-gray-100'
                                }`}
                              >
                                 <CheckCircle2 className="w-6 h-6" />
                              </button>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Final Assessment & Certification */}
          <div className="lg:col-span-4 space-y-10">
             <section className="bg-gray-950 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] -mr-24 -mt-24 opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-10 flex items-center gap-3">
                   <ShieldCheck className="w-4 h-4 text-blue-500" /> Professional Certification
                </h3>

                {course.finalAssessmentId ? (
                   <div className="space-y-8 relative">
                      <div className="space-y-3">
                         <h4 className="text-3xl font-black tracking-tightest leading-tight">Exit Competency Examination</h4>
                         <p className="text-gray-500 text-xs font-medium leading-relaxed">
                            Complete the curriculum phases to unlock the final institutional audit. Mastery threshold: 70%.
                         </p>
                      </div>

                      <div className="space-y-4">
                         {!allModulesPassed ? (
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                               <Lock className="w-5 h-5 text-gray-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Locked: Incomplete Phasing</span>
                            </div>
                         ) : finalPassed ? (
                            <div className="space-y-6">
                               <div className="p-8 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 text-center">
                                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                  <p className="text-lg font-black text-emerald-400 tracking-tight">Verified Credential Earned</p>
                               </div>
                               <button 
                                 onClick={() => navigate('/student/certificates')}
                                 className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-900/40 hover:scale-105 transition-all"
                               >
                                  View / Download Certificate
                               </button>
                            </div>
                         ) : (
                            <button 
                              onClick={() => setActiveTest({ testId: course.finalAssessmentId, type: 'final' })}
                              className="w-full py-6 bg-white text-gray-950 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest hover:bg-blue-50 transition-all shadow-2xl group flex items-center justify-center gap-3"
                            >
                               <Zap className="w-4 h-4 text-amber-500 group-hover:animate-bounce" />
                               Begin Certification Audit
                            </button>
                         )}
                      </div>
                   </div>
                ) : (
                   <div className="text-center py-10 opacity-40">
                      <Layers className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Final Exam Required</p>
                      {allModulesPassed && (
                        <p className="text-emerald-500 text-xs font-black uppercase tracking-widest mt-4">Certified Ready</p>
                      )}
                   </div>
                )}
             </section>

             <section className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black text-gray-950 border-b border-gray-50 pb-6 flex items-center gap-3">
                   <ShieldAlert className="w-5 h-5 text-amber-500" /> Governance Details
                </h3>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                          {course.facultyName?.charAt(0)}
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Instructor</p>
                          <p className="text-sm font-black text-gray-900">{course.facultyName || 'Institutional Staff'}</p>
                       </div>
                    </div>
                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-50">
                       <p className="text-[11px] font-bold text-blue-900 leading-relaxed">
                          Your progression is strictly audited. Attempting to bypass phase requirements will trigger a security flag in your academic dossier.
                       </p>
                    </div>
                </div>
             </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseView;
