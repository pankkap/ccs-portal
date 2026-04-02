import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Save, ArrowLeft, Trash2, PlusCircle, Image, FileText, Loader2, UploadCloud, X, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import courseService from '../../services/courseService';
import uploadService from '../../services/uploadService';

const CourseCreation = () => {
  const { courseId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const thumbnailInputRef = useRef(null);

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
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingModuleIndex, setUploadingModuleIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (courseId) {
        try {
          const res = await courseService.getCourseById(courseId);
          if (res.success) {
            setCourse(res.data.course);
            setModules(res.data.course.modules || []);
          }
        } catch (error) {
          toast.error("Error fetching course details");
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [courseId]);

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image size must be less than 2MB");
    }

    setUploadingThumbnail(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        setCourse(prev => ({ ...prev, thumbnail: res.data.url }));
        toast.success("Thumbnail uploaded!");
      }
    } catch (error) {
      toast.error("Failed to upload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleModuleUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be less than 5MB");
    }

    setUploadingModuleIndex(index);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        updateModule(index, 'contentUrl', res.data.url);
        toast.success("Document uploaded!");
      }
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploadingModuleIndex(null);
    }
  };

  const handleSaveCourse = async () => {
    if (!course.title || !course.description || !course.skills || !course.duration) {
      toast.error("Title, Description, Skills, and Duration are required");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...course, modules };
      let res;
      
      if (courseId) {
        res = await courseService.updateCourse(courseId, payload);
      } else {
        res = await courseService.createCourse(payload);
      }

      if (res.success) {
        toast.success(courseId ? "Course updated!" : "Course created successfully!");
        navigate('/faculty/courses');
      }
    } catch (error) {
      toast.error(error.message || "Failed to save course");
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
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Link to="/faculty/courses" className="p-3 hover:bg-gray-100 rounded-2xl transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{courseId ? 'Edit Course' : 'Create New Course'}</h1>
              <p className="text-gray-500 text-sm mt-1">Design a premium learning experience for your students.</p>
            </div>
          </div>
          <button 
            onClick={handleSaveCourse}
            disabled={saving}
            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Basic Info */}
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutTemplate className="w-6 h-6 text-blue-600" />
                Course Architecture
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Course Title</label>
                  <input 
                    type="text" 
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    placeholder="e.g. Master Full-Stack Web Development"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Expert Description</label>
                  <textarea 
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    placeholder="Describe the curriculum and learning outcomes..."
                    rows={5}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Core Skills</label>
                    <input 
                      type="text" 
                      value={course.skills}
                      onChange={(e) => setCourse({ ...course, skills: e.target.value })}
                      placeholder="e.g. React, Node.js, MongoDB"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Curriculum Duration</label>
                    <input 
                      type="text" 
                      value={course.duration}
                      onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                      placeholder="e.g. 12 Weeks (45 Hours)"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Modules Section */}
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Curriculum Modules
                </h2>
                <button 
                  onClick={addModule}
                  className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Study Module
                </button>
              </div>

              <div className="space-y-6">
                {modules.map((module, index) => (
                  <div key={index} className="p-8 border border-gray-100 rounded-[32px] bg-gray-50/50 relative group">
                    <button 
                      onClick={() => removeModule(index)}
                      className="absolute top-6 right-6 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-100">
                          {index + 1}
                        </div>
                        <input 
                          type="text" 
                          value={module.title}
                          onChange={(e) => updateModule(index, 'title', e.target.value)}
                          placeholder="Module Title (e.g. Introduction to DOM)"
                          className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                        />
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <select 
                          value={module.type}
                          onChange={(e) => updateModule(index, 'type', e.target.value)}
                          className="w-full md:w-48 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-700 appearance-none"
                        >
                          <option value="video">🎥 Video Link</option>
                          <option value="pdf">📄 PDF Document</option>
                          <option value="link">🔗 External Link</option>
                        </select>
                        
                        <div className="flex-1 flex gap-2">
                           <input 
                            type="text" 
                            value={module.contentUrl}
                            onChange={(e) => updateModule(index, 'contentUrl', e.target.value)}
                            placeholder={module.type === 'pdf' ? "Paste URL or Upload ->" : "Content URL (YouTube, Link, etc.)"}
                            className="flex-1 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                          {(module.type === 'pdf' || module.type === 'video') && (
                            <label className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-all group/up">
                              {uploadingModuleIndex === index ? (
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                              ) : (
                                <UploadCloud className="w-5 h-5 text-gray-400 group-hover/up:text-blue-600" />
                              )}
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => handleModuleUpload(index, e)}
                                accept={module.type === 'pdf' ? '.pdf' : 'video/*,image/*'}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {modules.length === 0 && (
                  <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/20">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-4 border border-gray-50">
                      <PlusCircle className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Begin building your curriculum</p>
                  </div>
                )}
              </div>

              {/* Bottom Save Action */}
              <div className="pt-10 flex items-center justify-center border-t border-gray-50 mt-10">
                  <button 
                    onClick={handleSaveCourse}
                    disabled={saving}
                    className="group px-12 py-5 bg-gray-900 text-white rounded-[24px] font-bold hover:bg-black transition-all shadow-2xl flex items-center gap-3"
                  >
                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 text-blue-400" />}
                    {saving ? 'Publishing curriculum...' : 'Confirm & Publish Course'}
                  </button>
              </div>
            </section>
          </div>

          {/* Right Sidebar Assets */}
          <div className="space-y-10">
            {/* Thumbnail Selection */}
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Course Thumbnail</h3>
              <div className="relative aspect-video bg-gray-50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 group">
                {course.thumbnail ? (
                  <div className="h-full w-full relative">
                    <img src={course.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setCourse({...course, thumbnail: ''})}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <Image className="w-12 h-12 text-gray-200" />
                    <button 
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={uploadingThumbnail}
                      className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
                    >
                      {uploadingThumbnail ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <UploadCloud className="w-4 h-4" />}
                      Select Media
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailUpload}
                  accept="image/*"
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">Recommended: 1280x720 • Max 2MB</p>
            </section>

            {/* Publication Settings */}
            <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Status & Settings</h3>
              <div className="space-y-4">
                 <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-blue-50/50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-6 h-6 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
                      checked={course.published}
                      onChange={(e) => setCourse({ ...course, published: e.target.checked })}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">Make Public</span>
                      <span className="text-[10px] text-gray-500">Live for student enrollment</span>
                    </div>
                 </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseCreation;
