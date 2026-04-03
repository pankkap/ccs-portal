import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, CheckCircle, Award, Clock, ArrowRight, PlayCircle, Loader2, Zap, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import enrollmentService from '../../services/enrollmentService';
import courseService from '../../services/courseService';
import placementService from '../../services/placementService';
import ProfileCompletionModal from '../../components/Student/ProfileCompletionModal';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [matchedPlacements, setMatchedPlacements] = useState([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      
      try {
        setLoading(true);
        // Concurrent Fetching for Dashboard Performance
        const [enrollRes, matchedRes, appsRes] = await Promise.all([
          enrollmentService.getMyEnrollments(),
          placementService.getMatchedPlacements(),
          placementService.getApplications()
        ]);

        if (enrollRes.success) setEnrollments(enrollRes.data.enrollments || []);
        if (matchedRes.success) setMatchedPlacements(matchedRes.data.placements || []);
        if (appsRes.success) setAppliedCount(appsRes.data.applications?.length || 0);

      } catch (error) {
        console.error("Dashboard synchronization error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const stats = [
    { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'blue' },
    { label: 'In Progress', value: enrollments.filter(e => e.status === 'in-progress').length, icon: Clock, color: 'orange' },
    { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, icon: CheckCircle, color: 'green' },
    { label: 'Applications', value: appliedCount, icon: Briefcase, color: 'purple' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Personalizing your campus dashboard...</p>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Student Success Hub</h1>
            <p className="text-gray-500 mt-2 text-lg">Welcome back, {profile?.name || 'Scholar'}. Ready for today's session?</p>
          </div>
          <Link to="/student/courses" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-100 group">
            Explore All Courses
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-lg transition-all border-b-4 border-b-transparent hover:border-b-blue-500">
              <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
                <Link to="/student/courses" className="text-sm font-bold text-blue-600 hover:text-blue-700 border-b-2 border-blue-100 hover:border-blue-600 transition-all py-1">
                  My Enrolled Courses
                </Link>
              </div>

              {enrollments.length > 0 ? (
                <div className="space-y-6">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment._id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-48 aspect-video md:aspect-square bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                          {enrollment.courseId.thumbnail ? (
                            <img src={enrollment.courseId.thumbnail} alt={enrollment.courseId.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                              <PlayCircle className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{enrollment.courseId.title}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{enrollment.courseId.description}</p>
                            </div>
                            <Link 
                              to={`/student/course/${enrollment.courseId._id}`}
                              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 shrink-0"
                            >
                              Resume Learning
                            </Link>
                          </div>
                          
                          <div className="space-y-3 pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                              <span>Mastery Progress</span>
                              <span className="text-blue-600">{enrollment.progress}% Complete</span>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-1000 shadow-sm" 
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-100 p-20 rounded-[40px] text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No active enrollments</h3>
                  <p className="text-gray-400 max-w-sm mx-auto mb-10">Start your professional transformation by enrolling in one of our expert-led courses.</p>
                  <Link to="/student/courses" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                    Explore Catalog
                  </Link>
                </div>
              )}
            </section>

            {recommendedCourses.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Recommended for Excellence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recommendedCourses.map((course) => (
                    <div key={course._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <div className="h-48 bg-gray-50 relative overflow-hidden">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <BookOpen className="w-16 h-16" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-900 shadow-lg">
                          {course.duration}
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">{course.title}</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-wider">{course.skills}</p>
                        <Link 
                          to={`/student/course/${course._id}`}
                          className="w-full py-3 border border-blue-600 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          Unlock Course Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="space-y-10">
            {matchedPlacements.length > 0 && (
              <section className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    Elite Matches
                 </h3>
                 <div className="space-y-4">
                    {matchedPlacements.slice(0, 3).map(job => (
                      <div key={job._id} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer" onClick={() => navigate('/student/placements')}>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-1">{job.companyName}</p>
                         <h4 className="text-sm font-bold truncate">{job.role}</h4>
                      </div>
                    ))}
                 </div>
                 <Link to="/student/placements" className="mt-8 flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition-colors">
                    View Verified Opportunities
                    <ArrowRight className="w-4 h-4" />
                 </Link>
              </section>
            )}

            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Certification Vault</h3>
              
              {enrollments.filter(e => e.status === 'completed').length > 0 ? (
                <div className="space-y-6">
                  {enrollments.filter(e => e.status === 'completed').map((enrollment) => (
                    <div key={enrollment._id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30 flex items-center gap-4 hover:border-yellow-200 transition-all">
                      <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 shrink-0 shadow-sm">
                        <Award className="w-7 h-7" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{enrollment.courseId.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Expert</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-10 rounded-[32px] text-center">
                  <Award className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No certificates earned yet</p>
                </div>
              )}
            </section>

            <section className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">Placement Drive</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed relative z-10">
                Exclusive career opportunities are waiting for verified learners. Complete your curriculum to qualify.
              </p>
              <Link to="/student/placements" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-blue-50 transition-all relative z-10 shadow-xl">
                Career Portal <ArrowRight className="w-5 h-5" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default StudentDashboard;
