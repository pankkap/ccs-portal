import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const MyCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch enrollments
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid)
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        const enrollmentsData = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEnrollments(enrollmentsData);

        // Fetch all published courses
        const coursesQuery = query(collection(db, 'courses'), where('published', '==', true));
        const coursesSnap = await getDocs(coursesQuery);
        const coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter out already enrolled courses for "Available" tab
        const enrolledCourseIds = new Set(enrollmentsData.map(e => e.courseId));
        setAvailableCourses(coursesData.filter(c => !enrolledCourseIds.has(c.id)));

      } catch (error) {
        console.error("Error fetching courses data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleEnroll = async (course) => {
    if (!user) return;
    
    try {
      const enrollment = {
        studentId: user.uid,
        courseId: course.id,
        progress: 0,
        completedModules: [],
        status: 'in-progress',
        enrolledAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'enrollments'), enrollment);
      setEnrollments([...enrollments, { id: docRef.id, ...enrollment }]);
      setAvailableCourses(availableCourses.filter(c => c.id !== course.id));
      toast.success(`Enrolled in ${course.title}!`);
      setActiveTab('my');
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Failed to enroll in course.");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-2">Explore and manage your learning journey.</p>
        </header>

        <div className="flex items-center justify-between mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('my')}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'my' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Courses ({enrollments.length})
              {activeTab === 'my' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('available')}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'available' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Available Courses ({availableCourses.length})
              {activeTab === 'available' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full"></div>}
            </button>
          </div>
        </div>

        {activeTab === 'my' ? (
          enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                  <div className="h-40 bg-blue-600 relative flex items-center justify-center text-white">
                    <BookOpen className="w-16 h-16 opacity-20 absolute" />
                    <PlayCircle className="w-12 h-12 relative z-10 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">Course ID: {enrollment.courseId}</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-500" 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Link 
                        to={`/student/courses/${enrollment.courseId}`}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses enrolled</h3>
              <p className="text-gray-500 mb-8">You haven't enrolled in any courses yet.</p>
              <button 
                onClick={() => setActiveTab('available')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Browse Available Courses
              </button>
            </div>
          )
        ) : (
          availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                  <div className="h-48 bg-gray-200 relative">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <BookOpen className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900">
                      {course.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">{course.skills}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-xs text-gray-500 font-medium">By {course.facultyName}</span>
                      <button 
                        onClick={() => handleEnroll(course)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No available courses</h3>
              <p className="text-gray-500">Check back later for new courses.</p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default MyCourses;
