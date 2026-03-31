import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, Users, CheckSquare, Library, Plus, ArrowRight, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch faculty's courses
        const coursesQuery = query(
          collection(db, 'courses'),
          where('facultyId', '==', user.uid)
        );
        const coursesSnap = await getDocs(coursesQuery);
        const coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesData);

        // Fetch faculty's mock tests
        const mockTestsQuery = query(
          collection(db, 'mockTests'),
          limit(5)
        );
        const mockTestsSnap = await getDocs(mockTestsQuery);
        setMockTests(mockTestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch total students (mock count for demo)
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const studentsSnap = await getDocs(studentsQuery);
        setStudentsCount(studentsSnap.size);

      } catch (error) {
        console.error("Error fetching faculty dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    { label: 'My Courses', value: courses.length, icon: BookOpen, color: 'blue' },
    { label: 'Total Students', value: studentsCount, icon: Users, color: 'green' },
    { label: 'Mock Tests', value: mockTests.length, icon: CheckSquare, color: 'purple' },
    { label: 'Content Items', value: 12, icon: Library, color: 'orange' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-500 mt-2">Welcome, {profile?.name}! Manage your courses and students.</p>
          </div>
          <Link to="/faculty/courses/new" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus className="w-5 h-5" />
            Add New Course
          </Link>
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
          {/* My Courses */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                <Link to="/faculty/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                      <div className="h-40 bg-gray-200 relative">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <BookOpen className="w-12 h-12" />
                          </div>
                        )}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {course.published ? 'Published' : 'Draft'}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                        <p className="text-xs text-gray-500 mb-6">{course.skills}</p>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/faculty/courses/${course.id}`}
                            className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit3 className="w-3 h-3" />
                            Manage
                          </Link>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-12 rounded-3xl text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No courses created yet</h3>
                  <p className="text-gray-500 mb-6">Start by creating your first course for students.</p>
                  <Link to="/faculty/courses/new" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                    Create Course
                  </Link>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Mock Tests</h2>
                <Link to="/faculty/mock-tests" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</Link>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Test Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockTests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{test.title}</p>
                          <p className="text-xs text-gray-500">{test.questionsCount} Questions</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">Practice Test</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${test.published ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {test.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 font-bold text-xs">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Faculty Profile</h3>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl mb-4 overflow-hidden border border-gray-200">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Users className="w-12 h-12 text-gray-300 m-6" />
                  )}
                </div>
                <h4 className="font-bold text-gray-900">{profile?.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{profile?.qualifications || 'Master Trainer'}</p>
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-bold text-gray-900">{profile?.experience || '15 Years'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Courses</span>
                  <span className="font-bold text-gray-900">{courses.length}</span>
                </div>
              </div>
              <button className="w-full mt-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                Edit Profile
              </button>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white">
              <Library className="w-10 h-10 mb-6 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Content Library</h3>
              <p className="text-blue-100 text-sm mb-6">
                Upload PDFs, External Website Links, and YouTube Video Links to the E-Library for students.
              </p>
              <Link to="/faculty/content" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all">
                Manage Content <ExternalLink className="w-4 h-4" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;
