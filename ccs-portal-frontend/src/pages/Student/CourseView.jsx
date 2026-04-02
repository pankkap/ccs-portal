import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, CheckCircle, Lock, ArrowLeft, CheckCircle2, Video, ExternalLink, FileDown, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import enrollmentService from '../../services/enrollmentService';
import assessmentService from '../../services/assessmentService';

const CourseView = () => {
  const { courseId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrollment details which includes the course
        const enrollRes = await enrollmentService.getEnrollmentByCourseId(courseId);
        if (enrollRes.success) {
          setEnrollment(enrollRes.data.enrollment);
          setCourse(enrollRes.data.enrollment.courseId);
          setModules(enrollRes.data.enrollment.courseId.modules || []);

          // Fetch assessment linked to this course
          const assessRes = await assessmentService.getAllAssessments({ courseId });
          if (assessRes.success && assessRes.data.assessments.length > 0) {
            setAssessment(assessRes.data.assessments[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Module synchronized failed. Are you enrolled?");
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  const handleCompleteModule = async (moduleId) => {
    if (!enrollment) return;

    const alreadyCompleted = enrollment.completedModules.includes(moduleId);
    if (alreadyCompleted) return;

    const updatedCompletedModules = [...enrollment.completedModules, moduleId];
    const progress = Math.round((updatedCompletedModules.length / modules.length) * 100);

    try {
      const res = await enrollmentService.updateProgress(enrollment._id, {
        completedModules: updatedCompletedModules,
        progress: progress
      });
      
      if (res.success) {
        setEnrollment(prev => ({ 
          ...prev, 
          completedModules: updatedCompletedModules, 
          progress 
        }));
        toast.success("Module archived as completed!");
      }
    } catch (error) {
      toast.error("Failed to update curriculum progress");
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Streaming Curriculum Content...</p>
      </div>
    </Layout>
  );

  if (!course) return null;

  const isAssessmentUnlocked = enrollment && (modules.length === 0 || enrollment.completedModules.length === modules.length);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">
        <Link to="/student/dashboard" className="inline-flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-blue-600 mb-10 transition-all group">
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          Return to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Course Content */}
          <div className="lg:col-span-2 space-y-12">
            <header className="space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                <Sparkles className="w-3 h-3" />
                Active Enrollment
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">{course.title}</h1>
              <p className="text-gray-500 text-xl leading-relaxed font-medium">{course.description}</p>
            </header>

            <section className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                   <BookOpen className="w-5 h-5" />
                </div>
                Curriculum Structure
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {modules.map((module, i) => {
                  const isCompleted = enrollment?.completedModules.includes(module._id) || enrollment?.completedModules.includes(module.title);
                  return (
                    <div key={module._id || i} className={`bg-white rounded-[32px] border transition-all duration-500 group ${isCompleted ? 'border-green-100 bg-green-50/10' : 'border-gray-100'}`}>
                      <div className="p-8 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                            {module.type === 'video' ? <Video className="w-6 h-6" /> : module.type === 'pdf' ? <FileDown className="w-6 h-6" /> : <ExternalLink className="w-6 h-6" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-bold text-lg truncate transition-colors ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>{module.title}</h3>
                            <div className="flex items-center gap-4 mt-1">
                               <a 
                                href={module.contentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                onClick={() => !isCompleted && handleCompleteModule(module._id || module.title)}
                              >
                                View Material
                              </a>
                              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{module.type}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCompleteModule(module._id || module.title)}
                          disabled={isCompleted}
                          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                            isCompleted 
                              ? 'bg-green-100 text-green-700 cursor-default flex items-center gap-2' 
                              : 'bg-gray-900 text-white hover:bg-black shadow-xl shadow-gray-200'
                          }`}
                        >
                          {isCompleted ? <><CheckCircle2 className="w-4 h-4" /> Finished</> : 'Verify Completion'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="pt-10 border-t border-gray-100">
               <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  Certification Exam
                </h2>
              </div>

              {assessment ? (
                <div className={`relative rounded-[40px] p-12 text-center transition-all duration-700 ${isAssessmentUnlocked ? 'bg-white border border-gray-100 shadow-2xl' : 'bg-gray-50 border-2 border-dashed border-gray-100'}`}>
                  {!isAssessmentUnlocked && (
                    <div className="absolute inset-0 bg-gray-50/40 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-12 transition-all">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                        <Lock className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Examination Locked</h3>
                      <p className="text-gray-400 text-center max-w-sm font-medium leading-relaxed">
                        Verify all curriculum modules to unlock your certification assessment.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">{assessment.title}</h3>
                      <p className="text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">{assessment.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                      <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Threshold</p>
                        <p className="text-2xl font-black text-gray-900">{assessment.passingScore}%</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Duration</p>
                        <p className="text-2xl font-black text-gray-900">{assessment.timeLimit}m</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Proctored</p>
                        <p className="text-xs font-black text-green-600 uppercase tracking-widest mt-2">{assessment.proctored ? 'Enabled' : 'No'}</p>
                      </div>
                    </div>

                    <Link 
                      to={`/student/course/${courseId}/assessment/${assessment._id}`}
                      className={`inline-flex items-center gap-3 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 uppercase tracking-widest text-xs ${!isAssessmentUnlocked && 'pointer-events-none'}`}
                    >
                      Authenticate & Start Assessment
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/50 border-2 border-dashed border-gray-100 p-16 rounded-[40px] text-center">
                  <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No assessment configured for this curriculum</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - Progress & Faculty */}
          <div className="space-y-10">
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Real-time Progress</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Completion</span>
                  <span className="text-2xl font-black text-blue-600">{enrollment?.progress || 0}%</span>
                </div>
                <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 shadow-lg shadow-blue-100" 
                    style={{ width: `${enrollment?.progress || 0}%` }}
                  ></div>
                </div>
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <CheckCircle2 className={`w-5 h-5 ${isAssessmentUnlocked ? 'text-green-500' : 'text-gray-300'}`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">Graduation Ready</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{isAssessmentUnlocked ? 'Unlocked' : 'Pending Modules'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Curriculum Expert</h3>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-50/50 border border-blue-100">
                  {course.facultyName?.charAt(0)}
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900">{course.facultyName}</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Lead Instructor</p>
                </div>
              </div>
              <button className="w-full py-4 bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all transition-colors">
                Archived Q&A
              </button>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseView;
