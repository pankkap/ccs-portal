import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, CheckCircle, Lock, ArrowLeft, CheckCircle2, Video, ExternalLink, FileDown } from 'lucide-react';
import { toast } from 'sonner';

const CourseView = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !courseId) return;

    const fetchData = async () => {
      try {
        // Fetch course
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          toast.error("Course not found");
          navigate('/student/courses');
          return;
        }
        setCourse({ id: courseDoc.id, ...courseDoc.data() });

        // Fetch modules
        const modulesQuery = query(
          collection(db, 'courses', courseId, 'modules'),
          orderBy('order', 'asc')
        );
        const modulesSnap = await getDocs(modulesQuery);
        setModules(modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch enrollment
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid),
          where('courseId', '==', courseId)
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        if (!enrollmentsSnap.empty) {
          setEnrollment({ id: enrollmentsSnap.docs[0].id, ...enrollmentsSnap.docs[0].data() });
        }

        // Fetch assessment
        const assessmentsQuery = query(collection(db, 'courses', courseId, 'assessments'));
        const assessmentsSnap = await getDocs(assessmentsQuery);
        if (!assessmentsSnap.empty) {
          setAssessment({ id: assessmentsSnap.docs[0].id, ...assessmentsSnap.docs[0].data() });
        }

      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, courseId, navigate]);

  const handleCompleteModule = async (moduleId) => {
    if (!enrollment || !user) return;

    const alreadyCompleted = enrollment.completedModules.includes(moduleId);
    if (alreadyCompleted) return;

    const updatedCompletedModules = [...enrollment.completedModules, moduleId];
    const progress = Math.round((updatedCompletedModules.length / modules.length) * 100);

    try {
      await updateDoc(doc(db, 'enrollments', enrollment.id), {
        completedModules: updatedCompletedModules,
        progress: progress
      });
      setEnrollment({ ...enrollment, completedModules: updatedCompletedModules, progress });
      toast.success("Module completed!");
    } catch (error) {
      console.error("Error updating module status:", error);
      toast.error("Failed to update progress.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!course) return null;

  const isAssessmentUnlocked = enrollment && enrollment.completedModules.length === modules.length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <Link to="/student/courses" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to My Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Course Content */}
          <div className="lg:col-span-2 space-y-10">
            <header>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-500 text-lg leading-relaxed">{course.description}</p>
            </header>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Course Modules
              </h2>
              <div className="space-y-4">
                {modules.map((module, i) => {
                  const isCompleted = enrollment?.completedModules.includes(module.id);
                  return (
                    <div key={module.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-6 flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {module.type === 'video' ? <Video className="w-6 h-6" /> : module.type === 'pdf' ? <FileDown className="w-6 h-6" /> : <ExternalLink className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Module {i + 1}: {module.title}</h3>
                            <a 
                              href={module.contentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-600 hover:underline mt-1 inline-block"
                            >
                              View Content
                            </a>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCompleteModule(module.id)}
                          disabled={isCompleted}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            isCompleted 
                              ? 'bg-green-50 text-green-700 cursor-default flex items-center gap-1' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isCompleted ? <><CheckCircle2 className="w-3 h-3" /> Completed</> : 'Mark as Complete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Final Assessment
              </h2>
              {assessment ? (
                <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center relative overflow-hidden ${!isAssessmentUnlocked && 'opacity-75'}`}>
                  {!isAssessmentUnlocked && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6">
                      <Lock className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Assessment Locked</h3>
                      <p className="text-sm text-gray-500 text-center max-w-xs">
                        Complete all course modules to unlock the final assessment and earn your certification.
                      </p>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h3>
                  <p className="text-gray-500 mb-8">{assessment.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pass Mark</p>
                      <p className="text-lg font-bold text-gray-900">{assessment.passingScore}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time Limit</p>
                      <p className="text-lg font-bold text-gray-900">{assessment.timeLimit}m</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Attempts</p>
                      <p className="text-lg font-bold text-gray-900">{assessment.allowedAttempts}</p>
                    </div>
                  </div>

                  <Link 
                    to={`/student/courses/${courseId}/assessment/${assessment.id}`}
                    className={`inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 ${!isAssessmentUnlocked && 'pointer-events-none'}`}
                  >
                    Start Assessment
                  </Link>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-10 rounded-3xl text-center">
                  <p className="text-gray-500">No assessment available for this course.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - Progress & Faculty */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Course Progress</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-gray-500">Completion</span>
                  <span className="text-blue-600">{enrollment?.progress || 0}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000" 
                    style={{ width: `${enrollment?.progress || 0}%` }}
                  ></div>
                </div>
                <div className="pt-4 border-t border-gray-50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <CheckCircle2 className={`w-4 h-4 ${enrollment?.progress === 100 ? 'text-green-500' : 'text-gray-300'}`} />
                    Modules Completed: {enrollment?.completedModules.length || 0} / {modules.length}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <CheckCircle2 className={`w-4 h-4 ${isAssessmentUnlocked ? 'text-green-500' : 'text-gray-300'}`} />
                    Assessment Unlocked
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Instructor</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                  {course.facultyName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{course.facultyName}</h4>
                  <p className="text-xs text-gray-500">IILM University Faculty</p>
                </div>
              </div>
              <button className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                Contact Instructor
              </button>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseView;
