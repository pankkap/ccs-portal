import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { BookOpen, Plus, Search, Edit3, Trash2, Eye, Clock, Calendar, MoreVertical, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import courseService from '../../services/courseService';

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getMyCourses();
      if (res.success) {
        setCourses(res.data.courses);
      }
    } catch (error) {
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    try {
      await courseService.deleteCourse(id);
      toast.success("Course deleted successfully");
      setCourses(courses.filter(c => c._id !== id));
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.skills.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-500 mt-2">Manage and monitor the courses you've created.</p>
          </div>
          <Link 
            to="/faculty/course/new" 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-5 h-5" />
            Create New Course
          </Link>
        </header>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading your courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <BookOpen className="w-16 h-16" />
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${course.published ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-amber-500 text-white shadow-lg shadow-amber-200'}`}>
                    {course.published ? 'Live' : 'Draft'}
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px]">{course.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate(`/faculty/course/edit/${course._id}`)}
                      className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Course
                    </button>
                    <button 
                      onClick={() => handleDelete(course._id)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses found</h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-10">
              {searchQuery ? `No courses matching "${searchQuery}"` : "You haven't created any courses yet. Start by creating your first professional training course."}
            </p>
            {!searchQuery && (
              <Link 
                to="/faculty/course/new" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                <Plus className="w-5 h-5" />
                Create First Course
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyCourses;
