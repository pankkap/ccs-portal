import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { GripVertical, Edit2, Trash2, BookOpen, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/adminService';
import courseService from '../../services/courseService';
import { useNavigate } from 'react-router-dom';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Drag and drop state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCourses();
      if (res.success) {
        setCourses(res.data.courses || []);
      }
    } catch (error) {
      toast.error("Failed to load courses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = async () => {
    const _courses = [...courses];
    const draggedItemContent = _courses.splice(dragItem.current, 1)[0];
    _courses.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;

    // Local sequence update
    const updatedOrderList = _courses.map((item, index) => ({
      ...item,
      order: index
    }));

    setCourses(updatedOrderList);

    // Persist to backend
    try {
      const payload = updatedOrderList.map(c => ({ id: c._id, order: c.order }));
      await adminService.reorderCourses(payload);
      toast.success("Order saved successfully");
    } catch (err) {
      toast.error("Error saving new order");
      fetchCourses(); // revert if failed
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This will remove it for both the faculty and students.")) return;
    try {
      await courseService.deleteCourse(courseId);
      toast.success("Course deleted successfully");
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (error) {
      toast.error(error.message || "Failed to delete course");
    }
  };

  const handleEditCourse = (courseId) => {
    navigate(`/faculty/course/edit/${courseId}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-sans">Course Management</h1>
            <p className="text-gray-500 mt-2">Manage all courses across the portal. Drag and drop to rearrange their public order.</p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium font-sans">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-sans">No courses found</h2>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto font-sans">
              There are no courses created by faculties yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div
                key={course._id}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="text-gray-300 cursor-move hover:text-gray-500 transition-colors p-1">
                    <GripVertical className="w-6 h-6" />
                  </div>
                  
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-50">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg font-sans">{course.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${course.published ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 font-sans">
                        <span className="font-bold text-gray-400 text-[10px] uppercase tracking-tighter">Faculty:</span>
                        <span className="font-semibold text-gray-700">{course.facultyName}</span>
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 font-sans">
                        <span className="font-bold text-gray-400 text-[10px] uppercase tracking-tighter">Duration:</span>
                        <span className="font-semibold text-gray-700">{course.duration}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <button 
                    onClick={() => handleEditCourse(course._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(course._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gray-50 rounded-[2rem] p-8 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-sans">Need to add a new course?</h2>
            <p className="text-gray-500 text-sm font-sans">While faculties primarily create courses, you can also initiate course creation as an admin.</p>
          </div>
          <button 
            onClick={() => navigate('/faculty/course/new')}
            className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-2 whitespace-nowrap"
          >
            Create New Course
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CourseManagement;
