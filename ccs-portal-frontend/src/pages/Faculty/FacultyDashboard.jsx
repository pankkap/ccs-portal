import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, Users, CheckSquare, Library, Plus, ArrowRight, Edit3, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import { toast } from 'sonner';

const FacultyDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await courseService.getMyCourses();
        if (res.success) {
          setCourses(res.data.courses || []);
        }
      } catch (error) {
        console.error("Error fetching faculty dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'My Courses', value: courses.length, icon: BookOpen, color: 'blue' },
    { label: 'Total Students', value: '124+', icon: Users, color: 'green' },
    { label: 'Mock Tests', value: '8', icon: CheckSquare, color: 'purple' },
    { label: 'Engagement', value: '92%', icon: Library, color: 'orange' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Synchronizing Dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Faculty Intelligence</h1>
            <p className="text-gray-500 mt-2 text-lg">Welcome back, {profile?.name}. Here's your curriculum overview.</p>
          </div>
          <Link to="/faculty/course/new" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Create New Course
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
                <h2 className="text-2xl font-bold text-gray-900">Recent Curriculum</h2>
                <Link to="/faculty/courses" className="text-sm font-bold text-blue-600 hover:text-blue-700 border-b-2 border-blue-100 hover:border-blue-600 transition-all py-1">
                  Manage All Courses
                </Link>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {courses.slice(0, 4).map((course) => (
                    <div key={course._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                      <div className="h-44 bg-gray-50 relative">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <BookOpen className="w-16 h-16" />
                          </div>
                        )}
                        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg ${course.published ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {course.published ? 'Live' : 'Draft'}
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg">{course.title}</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-wider">{course.skills}</p>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => navigate(`/faculty/course/edit/${course._id}`)}
                            className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-100 p-16 rounded-[40px] text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Build your first course</h3>
                  <p className="text-gray-400 mb-8 max-w-xs mx-auto">Upload your PDFs, videos, and study materials to begin teaching.</p>
                  <Link to="/faculty/course/new" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                    Create Course
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Faculty Profile</h3>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl mb-4 overflow-hidden border border-gray-200">
                  {profile?.image ? (
                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Users className="w-12 h-12 text-gray-300 m-6" />
                  )}
                </div>
                <h4 className="font-bold text-gray-900">{profile?.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{profile?.designation || 'Master Trainer'}</p>
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-bold text-gray-900">{profile?.experience || '--'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Courses</span>
                  <span className="font-bold text-gray-900">{courses.length}</span>
                </div>
              </div>
              <Link to="/faculty/profile" className="w-full mt-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center">
                Edit Profile
              </Link>
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
