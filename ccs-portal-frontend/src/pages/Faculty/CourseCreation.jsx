import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { 
  Save, ArrowLeft, Trash2, PlusCircle, Image, FileText, 
  Loader2, UploadCloud, X, LayoutTemplate, ShieldCheck, 
  Zap, ExternalLink, Settings, GraduationCap, Video, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import courseService from '../../services/courseService';
import uploadService from '../../services/uploadService';
import testService from '../../services/testService';
import certificateTemplateService from '../../services/certificateTemplateService';

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
    thumbnail: '',
    finalAssessmentId: null,
    finalAllowedAttempts: 3,
    certificateTemplateId: null
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingModuleIndex, setUploadingModuleIndex] = useState(null);
  
  // Assessment Selection States
  const [curriculumTests, setCurriculumTests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [fetchingTests, setFetchingTests] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingTests(true);
        const testRes = await testService.getMyTests();
        if (testRes.success) {
          // Filter strictly for Curriculum Assessments as per institutional policy
          const filtered = (testRes.data.tests || []).filter(t => t.testType === 'curriculum');
          setCurriculumTests(filtered);
        }

        if (courseId) {
          const res = await courseService.getCourseById(courseId);
          if (res.success) {
            setCourse(res.data.course);
            setModules(res.data.course.modules || []);
          }
        }

        // Fetch active certificate templates
        const templateRes = await certificateTemplateService.getAllTemplates();
        if (templateRes.success) {
          setTemplates(templateRes.data.templates || []);
        }
      } catch (error) {
        toast.error("Curriculum synchronization error");
      } finally {
        setLoading(false);
        setFetchingTests(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Asset size limit exceeded (2MB)");
    }

    setUploadingThumbnail(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        setCourse(prev => ({ ...prev, thumbnail: res.data.url }));
        toast.success("Identifier media uploaded!");
      }
    } catch (error) {
      toast.error("Asset archival failed");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleModuleUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Document size limit exceeded (5MB)");
    }

    setUploadingModuleIndex(index);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        updateModule(index, 'contentUrl', res.data.url);
        toast.success("Source document synchronized!");
      }
    } catch (error) {
      toast.error("Document archival failed");
    } finally {
      setUploadingModuleIndex(null);
    }
  };

  const handleSaveCourse = async () => {
    if (!course.title || !course.description || !course.skills || !course.duration) {
      toast.error("Critical metadata (Title, Description, Skills, Duration) required.");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...course, modules };
      const res = courseId 
        ? await courseService.updateCourse(courseId, payload)
        : await courseService.createCourse(payload);

      if (res.success) {
        toast.success(courseId ? "Curriculum blueprint updated" : "New curriculum initialized!");
        navigate('/faculty/courses');
      }
    } catch (error) {
      toast.error(error.message || "Blueprint archival failed");
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    setModules([...modules, { 
      title: '', 
      type: 'video', 
      contentUrl: '', 
      assessmentId: null, 
      allowedAttempts: 3,
      order: modules.length + 1 
    }]);
  };

  const updateModule = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setModules(updatedModules);
  };

  const removeModule = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  if (loading) return (
    <Layout>
       <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-sm">Decoding Curriculum...</p>
       </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 transition-all group-hover:scale-150 rounded-full blur-3xl -mr-16 -mt-16 opacity-30"></div>
          
          <div className="flex items-center gap-8 relative">
            <Link to="/faculty/courses" className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 hover:text-blue-600 hover:border-blue-100 transition-all">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-4 h-4" />
                 </div>
                 <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Pedagogical Architect</h3>
              </div>
              <h1 className="text-5xl font-black text-gray-950 tracking-tightest leading-none">{courseId ? 'Edit Curriculum' : 'Design Course'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
             <Link 
              to="/faculty/test-builder" 
              target="_blank"
              className="px-10 py-5 bg-gray-50 text-gray-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100 flex items-center gap-3 active:scale-95 shadow-sm"
             >
               <Zap className="w-4 h-4 text-amber-500" /> Init Assessment
             </Link>
             <button 
                onClick={handleSaveCourse}
                disabled={saving}
                className="px-10 py-5 bg-gray-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4 text-blue-400" />}
                {saving ? 'Publishing...' : 'Commit Blueprint'}
              </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white p-12 rounded-[4rem] border border-gray-50 shadow-sm space-y-10">
              <h2 className="text-3xl font-black text-gray-950 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                Foundational Schema
              </h2>
              
              <div className="grid gap-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Dossier Title</label>
                  <input 
                    type="text" 
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    placeholder="e.g. Strategic Data Intelligence (Masters Level)"
                    className="w-full px-8 py-6 bg-gray-50/50 border-none rounded-3xl text-sm focus:ring-4 ring-blue-50 transition-all font-black text-gray-950"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Learning Mandate & Career Alignment</label>
                  <textarea 
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    placeholder="Define the pedagogical requirements..."
                    rows={6}
                    className="w-full px-8 py-6 bg-gray-50/50 border-none rounded-[2.5rem] text-sm focus:ring-4 ring-blue-50 transition-all font-medium leading-relaxed resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Competencies</label>
                    <input 
                      type="text" 
                      value={course.skills}
                      onChange={(e) => setCourse({ ...course, skills: e.target.value })}
                      placeholder="React, AWS, ISO-27001..."
                      className="w-full px-8 py-6 bg-gray-50/50 border-none rounded-3xl text-sm focus:ring-4 ring-blue-50 transition-all font-black text-gray-950"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporal Commitment</label>
                    <input 
                      type="text" 
                      value={course.duration}
                      onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                      placeholder="e.g. 15 Weeks / 30 Credits"
                      className="w-full px-8 py-6 bg-gray-50/50 border-none rounded-3xl text-sm focus:ring-4 ring-blue-50 transition-all font-black text-gray-950"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex items-center justify-between px-8">
                <h2 className="text-3xl font-black text-gray-950 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-950 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  Curriculum Phasing
                </h2>
                <button 
                  onClick={addModule}
                  className="px-10 py-5 bg-white text-gray-950 border border-gray-100 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm"
                >
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  Inject Phase
                </button>
              </div>

              <div className="space-y-8">
                {modules.map((module, index) => (
                  <div key={index} className="bg-white p-12 rounded-[4rem] border border-gray-50 shadow-sm relative group hover:border-blue-100 transition-all">
                    <button 
                      onClick={() => removeModule(index)}
                      className="absolute top-10 right-10 p-4 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                    
                    <div className="space-y-10">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-gray-950 text-white rounded-[1.75rem] flex items-center justify-center font-black text-2xl shadow-2xl">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <input 
                          type="text" 
                          value={module.title}
                          onChange={(e) => updateModule(index, 'title', e.target.value)}
                          placeholder="Phase Title (e.g. Distributed Ledger Fundamentals)"
                          className="flex-1 px-10 py-5 bg-gray-50 border-none rounded-3xl text-sm focus:ring-4 ring-blue-50 transition-all font-black text-gray-950"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        <div className="md:col-span-4">
                           <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Asset Category</label>
                           <div className="grid grid-cols-1 gap-2">
                             {[
                               { id: 'video', label: '🎥 Video Lab', icon: Video },
                               { id: 'pdf', label: '📄 Whitepaper', icon: FileText },
                               { id: 'assessment', label: '🛡️ Audit Module', icon: ShieldCheck }
                             ].map(opt => (
                               <button 
                                 key={opt.id}
                                 onClick={() => updateModule(index, 'type', opt.id)}
                                 className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-left transition-all flex items-center gap-3 ${
                                   module.type === opt.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                 }`}
                               >
                                  <opt.icon className="w-4 h-4" />
                                  {opt.label}
                               </button>
                             ))}
                           </div>
                        </div>
                        
                        <div className="md:col-span-8 space-y-6">
                          {module.type === 'assessment' ? (
                            <div className="grid grid-cols-1 gap-6 animate-in zoom-in-95 duration-500 bg-blue-50/50 p-8 rounded-[3rem] border border-blue-50">
                               <div className="space-y-4">
                                  <div className="flex items-center justify-between px-2">
                                     <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Linked Assessment Blueprint</label>
                                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{curriculumTests.length} Valid Blueprints Available</span>
                                  </div>
                                  <select
                                    value={module.assessmentId || ''}
                                    onChange={(e) => updateModule(index, 'assessmentId', e.target.value)}
                                    className="w-full px-8 py-5 bg-white border border-blue-100 rounded-3xl text-sm font-black text-gray-950 outline-none focus:ring-4 ring-blue-100 appearance-none cursor-pointer"
                                  >
                                    <option value="">Query Registry for Curricular Asset...</option>
                                    {curriculumTests.map(t => (
                                       <option key={t._id} value={t._id}>
                                          {t.title} ({t.questions?.length} Competencies)
                                       </option>
                                    ))}
                                  </select>
                               </div>
                               <div className="space-y-4">
                                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest px-2">Institutional Attempt Cap</label>
                                  <input 
                                    type="number"
                                    min="1"
                                    value={module.allowedAttempts || 3}
                                    onChange={(e) => updateModule(index, 'allowedAttempts', parseInt(e.target.value))}
                                    className="w-24 px-6 py-4 bg-white border border-blue-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none"
                                  />
                               </div>
                               <div className="p-6 bg-white/50 rounded-[2rem] border border-blue-50/50">
                                  <p className="text-[11px] text-blue-700 font-bold leading-relaxed flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                                    This phase acts as a progression gate. Successful audit completion synchronizes the student dossier for phase advancement.
                                  </p>
                               </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Source Authenticator (URL)</label>
                                 <div className="flex gap-4">
                                    <input 
                                      type="text" 
                                      value={module.contentUrl}
                                      onChange={(e) => updateModule(index, 'contentUrl', e.target.value)}
                                      placeholder={module.type === 'pdf' ? "Archival URL or Upload to CDN ->" : "Knowledge Base URL (Internal/External)"}
                                      className="flex-1 px-8 py-5 bg-gray-50 border-none rounded-3xl text-sm font-medium focus:ring-4 ring-blue-50 transition-all font-black text-gray-950"
                                    />
                                    {(module.type === 'pdf' || module.type === 'video') && (
                                      <label className="flex-shrink-0 w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-black transition-all shadow-2xl relative overflow-hidden active:scale-95 group">
                                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        {uploadingModuleIndex === index ? (
                                          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                        ) : (
                                          <UploadCloud className="w-6 h-6 text-blue-400" />
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
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {modules.length === 0 && (
                  <div className="text-center py-32 border-4 border-dashed border-gray-50 rounded-[4rem] bg-white/50">
                    <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 mx-auto mb-8 border border-gray-100">
                       <PlusCircle className="w-16 h-16" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">Blueprint Ledger is Empty</h3>
                    <p className="text-sm text-gray-400 mt-4 font-medium max-w-xs mx-auto">Inject pedagogical phases to formalize this institutional track.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <section className="bg-white p-12 rounded-[4rem] border border-gray-50 shadow-sm space-y-10">
              <h3 className="text-2xl font-black text-gray-950 flex items-center gap-4">
                <Image className="w-6 h-6 text-blue-600" /> Identity Media
              </h3>
              <div className="relative aspect-square bg-gray-50 rounded-[3rem] overflow-hidden border-2 border-dashed border-gray-100 group transition-all hover:border-blue-100">
                {course.thumbnail ? (
                  <div className="h-full w-full relative">
                    <img src={course.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
                        <button 
                          onClick={() => setCourse({...course, thumbnail: ''})}
                          className="w-16 h-16 bg-rose-500 text-white rounded-[1.75rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                        >
                          <Trash2 className="w-8 h-8" />
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center space-y-8">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center border border-gray-50">
                       <UploadCloud className="w-10 h-10 text-gray-200" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-8 leading-relaxed">System requires a unique<br/>visual identifier for Publication</p>
                      <button 
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={uploadingThumbnail}
                        className="px-12 py-5 bg-gray-950 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95"
                      >
                        {uploadingThumbnail ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Archival Media Link'}
                      </button>
                    </div>
                  </div>
                )}
                <input type="file" className="hidden" ref={thumbnailInputRef} onChange={handleThumbnailUpload} accept="image/*" />
              </div>
            </section>

            <section className="bg-white p-12 rounded-[4rem] border border-gray-50 shadow-sm space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50"></div>
              <h3 className="text-2xl font-black text-gray-950 flex items-center gap-4 relative">
                <ShieldCheck className="w-7 h-7 text-blue-600" /> Professional Certification
              </h3>
              
              <div className="space-y-8 relative">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Institutional Audit (Final)</label>
                    <select
                      value={course.finalAssessmentId || ''}
                      onChange={(e) => setCourse({...course, finalAssessmentId: e.target.value})}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.75rem] text-[10px] font-black uppercase text-gray-950 outline-none ring-offset-0 focus:ring-4 ring-blue-100 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">No Final Certification Audit</option>
                      {curriculumTests.map(t => <option key={t._id} value={t._id}>{t.title} ({t.questions?.length} Items)</option>)}
                    </select>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Awarded Credential Template</label>
                    <select
                      value={course.certificateTemplateId || ''}
                      onChange={(e) => setCourse({...course, certificateTemplateId: e.target.value})}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.75rem] text-[10px] font-black uppercase text-gray-950 outline-none ring-offset-0 focus:ring-4 ring-blue-100 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">No Achievement Issued</option>
                      {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                 </div>

                 {course.finalAssessmentId && (
                   <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Certification Attempt Cap</label>
                      <input 
                        type="number"
                        min="1"
                        value={course.finalAllowedAttempts || 3}
                        onChange={(e) => setCourse({...course, finalAllowedAttempts: parseInt(e.target.value)})}
                        className="w-24 px-8 py-5 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-4 ring-blue-100 transition-all font-mono"
                      />
                   </div>
                 )}

                 <div className="pt-6 border-t border-gray-50">
                    <label className="flex items-center gap-6 p-8 bg-gray-950 rounded-[2.5rem] cursor-pointer hover:bg-black transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={course.published} onChange={(e) => setCourse({ ...course, published: e.target.checked })} />
                        <div className={`w-14 h-8 rounded-full transition-all flex items-center px-1.5 ${course.published ? 'bg-blue-600 shadow-xl' : 'bg-white/10'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-all ${course.published ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Public Deployment</span>
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter mt-1">Institutional Publication Active</span>
                      </div>
                    </label>
                 </div>
              </div>
            </section>

             <div className="bg-blue-600 p-10 rounded-[3.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-[80px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <Settings className="w-6 h-6 text-white" />
                   </div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Audit Trail Compliance</h4>
                </div>
                <p className="text-sm font-bold leading-relaxed text-blue-50">
                   Assessments are permanently linked to the curriculum protocol. Modifying linked tests after publication triggers version-control alerts in the student dossier registry.
                </p>
                <div className="pt-2">
                   <Link to="/faculty/mock-tests" className="text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-3 group/link underline underline-offset-8 decoration-white/20 hover:decoration-white transition-all">
                      Open Blueprint Registry <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseCreation;
