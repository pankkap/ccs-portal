import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, PlayCircle, Loader2, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import enrollmentService from '../../services/enrollmentService';
import courseService from '../../services/courseService';

const StudentMyCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrollments
        const enrollRes = await enrollmentService.getMyEnrollments();
        const enrollmentsData = enrollRes.success ? enrollRes.data.enrollments : [];
        setEnrollments(enrollmentsData);

        // Fetch all published courses
        const coursesRes = await courseService.getAllCourses();
        const coursesData = coursesRes.success ? coursesRes.data.courses : [];
        
        // Filter out already enrolled courses for "Available" tab
        const enrolledCourseIds = new Set(enrollmentsData.map(e => e.courseId._id));
        setAvailableCourses(coursesData.filter(c => !enrolledCourseIds.has(c._id)));

      } catch (error) {
        console.error("Error fetching courses data:", error);
        toast.error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEnroll = async (course) => {
    try {
      const res = await enrollmentService.enrollInCourse(course._id);
      if (res.success) {
        // Find the full course object for the new enrollment state
        const newEnrollment = {
          ...res.data.enrollment,
          courseId: course // Use the course object we already have
        };
        
        setEnrollments([newEnrollment, ...enrollments]);
        setAvailableCourses(availableCourses.filter(c => c._id !== course._id));
        toast.success(`Welcome to ${course.title}!`);
        setActiveTab('my');
      }
    } catch (error) {
      toast.error(error.message || "Enrollment failed");
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Curating your learning path...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Academic Catalog</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your active enrollments or discover new frontiers.</p>
          </div>
          <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('my')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Enrolled ({enrollments.length})
            </button>
            <button 
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'available' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Browse Catalog ({availableCourses.length})
            </button>
          </div>
        </header>

        {activeTab === 'my' ? (
          enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrollments.map((enrollment) => (
                <div key={enrollment._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="h-48 bg-gray-50 relative overflow-hidden shrink-0">
                    {enrollment.courseId.thumbnail ? (
                      <img src={enrollment.courseId.thumbnail} alt={enrollment.courseId.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <PlayCircle className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-14 h-14 text-white drop-shadow-2xl" />
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">{enrollment.courseId.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px] tracking-tight">{enrollment.courseId.description}</p>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span>Mastery</span>
                          <span className="text-blue-600">{enrollment.progress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-1000 shadow-sm" 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Link 
                        to={`/student/course/${enrollment.courseId._id}`}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-100"
                      >
                        Continue Curriculum
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-100 p-24 rounded-[48px] text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner shadow-blue-100">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">No active enrollments</h3>
              <p className="text-gray-400 mb-10 leading-relaxed font-medium">You haven't added any courses to your curriculum yet. Discover professional programs in the explore tab.</p>
              <button 
                onClick={() => setActiveTab('available')}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Browse Catalog
              </button>
            </div>
          )
        ) : (
          availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCourses.map((course) => (
                <div key={course._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="h-48 bg-gray-50 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <BookOpen className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-900 shadow-xl border border-white/50">
                      {course.duration}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-widest">{course.skills}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors tracking-tight">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-8 line-clamp-2 min-h-[40px] leading-relaxed">{course.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-gray-400 capitalize">{course.facultyName?.charAt(0)}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-bold">Prof. {course.facultyName}</span>
                      </div>
                      <button 
                        onClick={() => handleEnroll(course)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100 max-w-2xl mx-auto">
              <Filter className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Catalog Under Maintenance</h3>
              <p className="text-gray-400 font-medium tracking-tight">Our academic team is curating new professional curriculums. Check back shortly.</p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default StudentMyCourses;
