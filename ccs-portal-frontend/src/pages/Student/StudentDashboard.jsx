import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, CheckCircle, Award, Clock, ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/utils';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch enrollments
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid),
          limit(5)
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        const enrollmentsData = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEnrollments(enrollmentsData);

        // Fetch recent certificates
        const certsQuery = query(
          collection(db, 'certificates'),
          where('studentId', '==', user.uid),
          orderBy('issuedAt', 'desc'),
          limit(3)
        );
        const certsSnap = await getDocs(certsQuery);
        setCertificates(certsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch some available courses if not many enrollments
        if (enrollmentsData.length < 3) {
          const coursesQuery = query(collection(db, 'courses'), where('published', '==', true), limit(4));
          const coursesSnap = await getDocs(coursesQuery);
          setRecentCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error fetching student dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'blue' },
    { label: 'In Progress', value: enrollments.filter(e => e.status === 'in-progress').length, icon: Clock, color: 'orange' },
    { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, icon: CheckCircle, color: 'green' },
    { label: 'Certificates', value: certificates.length, icon: Award, color: 'purple' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back! Continue your learning journey.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content - Continue Learning */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                <Link to="/student/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <PlayCircle className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Course Title Placeholder</h3>
                            <p className="text-sm text-gray-500">Last accessed: {formatDate(enrollment.enrolledAt)}</p>
                          </div>
                        </div>
                        <Link 
                          to={`/student/courses/${enrollment.courseId}`}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                        >
                          Resume
                        </Link>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 p-10 rounded-3xl text-center">
                  <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No active enrollments</h3>
                  <p className="text-gray-600 mb-6">Explore our course catalog and start learning today.</p>
                  <Link to="/student/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                    Browse Courses
                  </Link>
                </div>
              )}
            </section>

            {recentCourses.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                      <div className="h-40 bg-gray-200 relative">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <BookOpen className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900">
                          {course.duration}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">{course.description}</p>
                        <Link 
                          to={`/student/courses/${course.id}`}
                          className="w-full py-2.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Content - Certificates & Notifications */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Certificates</h2>
                <Link to="/student/certificates" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View All
                </Link>
              </div>

              {certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{cert.courseTitle}</h4>
                        <p className="text-xs text-gray-500">Issued: {formatDate(cert.issuedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-2xl text-center">
                  <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Complete courses to earn certificates.</p>
                </div>
              )}
            </section>

            <section className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-xl font-bold mb-4 relative z-10">Placement Drive</h3>
              <p className="text-gray-400 text-sm mb-6 relative z-10">
                New job openings are available in the placement portal. Check them out and apply now!
              </p>
              <Link to="/student/placements" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all relative z-10">
                View Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
