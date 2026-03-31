import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Save, ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '../../lib/utils';

const CourseCreation = () => {
  const { courseId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: '',
    description: '',
    skills: '',
    duration: '',
    published: false,
    thumbnail: ''
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      if (courseId) {
        try {
          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          if (courseDoc.exists()) {
            setCourse({ id: courseDoc.id, ...courseDoc.data() });
            
            const modulesQuery = query(
              collection(db, 'courses', courseId, 'modules'),
              orderBy('order', 'asc')
            );
            const modulesSnap = await getDocs(modulesQuery);
            setModules(modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        } catch (error) {
          console.error("Error fetching course:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user, courseId]);

  const handleSaveCourse = async () => {
    if (!user || !profile) return;
    if (!course.title) {
      toast.error("Course title is required");
      return;
    }

    setSaving(true);
    try {
      const id = courseId || generateId();
      const courseData = {
        ...course,
        id,
        facultyId: user.uid,
        facultyName: profile.name,
        createdAt: course.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, 'courses', id), courseData);
      
      // Save modules
      for (const module of modules) {
        const moduleId = module.id || generateId();
        const moduleData = {
          ...module,
          id: moduleId,
          courseId: id,
          order: module.order || 0
        };
        await setDoc(doc(db, 'courses', id, 'modules', moduleId), moduleData);
      }

      toast.success(courseId ? "Course updated!" : "Course created!");
      navigate('/faculty');
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    setModules([...modules, { title: '', type: 'video', contentUrl: '', order: modules.length + 1 }]);
  };

  const updateModule = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setModules(updatedModules);
  };

  const removeModule = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link to="/faculty" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{courseId ? 'Edit Course' : 'Create New Course'}</h1>
          </div>
          <button 
            onClick={handleSaveCourse}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </header>

        <div className="space-y-8">
          {/* Course Details */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Course Details</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                <input 
                  type="text" 
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="What will students learn?"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Skills Covered</label>
                  <input 
                    type="text" 
                    value={course.skills}
                    onChange={(e) => setCourse({ ...course, skills: e.target.value })}
                    placeholder="e.g. C++, Java, Problem Solving"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                  <input 
                    type="text" 
                    value={course.duration}
                    onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                    placeholder="e.g. 8 Weeks"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="published"
                  checked={course.published}
                  onChange={(e) => setCourse({ ...course, published: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-sm font-bold text-gray-700">Publish course to students</label>
              </div>
            </div>
          </section>

          {/* Modules Section */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Course Modules</h2>
              <button 
                onClick={addModule}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Module
              </button>
            </div>

            <div className="space-y-6">
              {modules.map((module, index) => (
                <div key={index} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 relative group">
                  <button 
                    onClick={() => removeModule(index)}
                    className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <input 
                        type="text" 
                        value={module.title}
                        onChange={(e) => updateModule(index, 'title', e.target.value)}
                        placeholder="Module Title"
                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select 
                        value={module.type}
                        onChange={(e) => updateModule(index, 'type', e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="video">Video Link</option>
                        <option value="pdf">PDF Document</option>
                        <option value="link">External Link</option>
                      </select>
                      <input 
                        type="text" 
                        value={module.contentUrl}
                        onChange={(e) => updateModule(index, 'contentUrl', e.target.value)}
                        placeholder="Content URL"
                        className="md:col-span-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {modules.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-sm text-gray-400">No modules added yet. Click "Add Module" to start.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default CourseCreation;
