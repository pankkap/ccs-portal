import React, { useEffect, useState, useRef } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  X, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  Trash,
  Settings2,
  Save,
  Layout as LayoutIcon,
  ShieldCheck,
  Globe,
  Lock
} from 'lucide-react';
import { Layout } from '../../components/Layout';
import certificateTemplateService from '../../services/certificateTemplateService';
import uploadService from '../../services/uploadService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const CertificateTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    backgroundUrl: '',
    isActive: true
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await certificateTemplateService.getAdminTemplates();
      if (res.success) {
        setTemplates(res.data.templates || []);
      }
    } catch (error) {
      toast.error("Failed to fetch achievement blueprints");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        // Correctly access res.data.url based on backend implementation
        const rawUrl = res.data.url;
        const url = rawUrl.startsWith('http') 
          ? rawUrl 
          : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${rawUrl}`;
        
        setFormData({ ...formData, backgroundUrl: url });
        toast.success("Blueprint background architecturalized");
      }
    } catch (error) {
      toast.error("Failed to upload assets");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.backgroundUrl) {
      return toast.error("Blueprint details incomplete");
    }

    try {
      if (isEditing) {
        const res = await certificateTemplateService.updateTemplate(formData._id, formData);
        if (res.success) toast.success("Credential architecture updated");
      } else {
        const res = await certificateTemplateService.createTemplate(formData);
        if (res.success) toast.success("New achievement blueprint registered");
      }
      setIsModalOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error(error.message || "Failed to persist blueprint");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently deconstruct this achievement blueprint?")) return;
    try {
      const res = await certificateTemplateService.deleteTemplate(id);
      if (res.success) {
        toast.success("Blueprint purged from registry");
        fetchTemplates();
      }
    } catch (error) {
      toast.error("Failed to deconstruct blueprint");
    }
  };

  const toggleStatus = async (template) => {
    try {
      const res = await certificateTemplateService.updateTemplate(template._id, {
        isActive: !template.isActive
      });
      if (res.success) {
        toast.success(`Blueprint ${!template.isActive ? 'activated' : 'vaulted'}`);
        fetchTemplates();
      }
    } catch (error) {
      toast.error("Toggle protocol failed");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      backgroundUrl: '',
      isActive: true
    });
    setIsEditing(false);
  };

  const editTemplate = (template) => {
    setFormData({ ...template });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-950 tracking-tightest leading-none">Achievement Templates</h1>
            <p className="text-gray-500 mt-3 text-lg font-medium">Govern the visual architecture of institutional credentials.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Initialize New Blueprint
          </button>
        </header>

        {/* Search Registry */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12 flex items-center gap-4 group focus-within:shadow-2xl focus-within:border-blue-100 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search Blueprint Registry..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 font-bold placeholder:text-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[48px] border border-gray-100">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
             <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Accessing Blueprint Vault...</p>
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredTemplates.map((template) => (
              <div key={template._id} className="bg-white rounded-[42px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group overflow-hidden">
                {/* Visual Preview */}
                <div className="aspect-[1.5/1] bg-gray-100 relative overflow-hidden">
                   <img 
                    src={template.backgroundUrl} 
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                      <div className="flex items-center gap-3">
                         <div className={`w-3 h-3 rounded-full ${template.isActive ? 'bg-emerald-400' : 'bg-gray-400'} shadow-[0_0_10px_rgba(0,0,0,0.2)]`} />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{template.isActive ? 'Active Blueprint' : 'Vaulted'}</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => editTemplate(template)}
                    className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-600 active:scale-95"
                   >
                      <Settings2 className="w-5 h-5" />
                   </button>
                </div>

                <div className="p-10 flex-grow flex flex-col">
                   <div className="mb-8">
                      <h3 className="text-2xl font-black text-gray-950 mb-2 leading-tight">{template.name}</h3>
                      <p className="text-gray-400 font-medium text-base line-clamp-2">{template.description || "N/A"}</p>
                   </div>

                   <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4 border-b border-gray-50">
                         <span>Authored By</span>
                         <span className="text-gray-900">{template.createdBy?.name || "System"}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-2">
                         <button 
                          onClick={() => toggleStatus(template)}
                          className={cn(
                            "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2",
                            template.isActive 
                              ? "border-emerald-50 text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50"
                              : "border-gray-50 text-gray-400 bg-gray-50/30 hover:bg-gray-50"
                          )}
                         >
                            {template.isActive ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                            {template.isActive ? 'Move to Vault' : 'Activate Live'}
                         </button>
                         <button 
                          onClick={() => handleDelete(template._id)}
                          className="w-14 h-14 border-2 border-red-50 text-red-500 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center"
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[48px] border-2 border-dashed border-gray-100 max-w-4xl mx-auto shadow-sm">
             <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mx-auto mb-8">
                < Award className="w-12 h-12" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">No Achievement Blueprints</h2>
             <p className="text-gray-400 font-medium max-w-md mx-auto text-lg leading-relaxed mb-10">Register institutional certificate layouts to enable faculty course credentialing.</p>
          </div>
        )}

        {/* Create/Edit Immersive Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
             <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-2xl transition-all" onClick={() => setIsModalOpen(false)}></div>
             <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden max-h-full">
                {/* Visual Preview Panel */}
                <div className="hidden md:flex md:w-[40%] bg-gray-950 p-12 flex-col justify-between relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                   
                   <div className="relative z-10">
                      <LayoutIcon className="w-12 h-12 text-blue-500 mb-8" />
                      <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-4">
                        {isEditing ? 'Architechural Audit' : 'Blueprint Initialization'}
                      </h2>
                      <p className="text-gray-400 font-medium">Define the core visual parameters for your digital credentials.</p>
                   </div>

                   <div className="mt-12 p-8 bg-white/5 backdrop-blur rounded-[2.5rem] border border-white/10">
                      <div className="aspect-[1.5/1] bg-gray-900 rounded-2xl overflow-hidden border border-white/5 relative group">
                        {formData.backgroundUrl ? (
                          <img src={formData.backgroundUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
                             <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Asset Missing</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 flex items-center gap-3">
                         <ShieldCheck className="w-4 h-4 text-emerald-400" />
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Audit Verified Visual</span>
                      </div>
                   </div>
                </div>

                {/* Form Panel */}
                <div className="flex-1 p-10 md:p-16 overflow-y-auto custom-scrollbar">
                   <form onSubmit={handleSubmit} className="space-y-10">
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Blueprint Identity</label>
                         <input 
                            type="text" 
                            required
                            placeholder="e.g. Executive Master Certification 2024"
                            className="w-full bg-gray-50 border-gray-100 rounded-3xl py-5 px-8 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all focus:bg-white"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                         />
                      </div>

                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Asset Orchestration (Background)</label>
                         <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="group border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50/30 transition-all relative overflow-hidden"
                         >
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleFileUpload}
                              className="hidden" 
                              accept="image/*"
                            />
                            
                            {uploading ? (
                              <div className="flex flex-col items-center">
                                 <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                 <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Synchronizing Asset...</p>
                              </div>
                            ) : formData.backgroundUrl ? (
                              <div className="flex flex-col items-center">
                                 <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                                    <Check className="w-8 h-8" />
                                 </div>
                                 <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Architectural Asset Loaded</p>
                                 <p className="text-[9px] text-gray-400 mt-2">Click to modify visual parameters</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                 <div className="w-16 h-16 bg-gray-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 mb-4 transition-all">
                                    <Upload className="w-8 h-8" />
                                 </div>
                                 <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Upload Blueprint Visual</p>
                                 <p className="text-[9px] text-gray-400 mt-2">PNG, JPG recommended (4:3 ratio)</p>
                              </div>
                            )}
                         </div>
                      </div>

                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Architectural Context</label>
                         <textarea 
                            rows="4" 
                            placeholder="Describe the usage scenario for this blueprint..."
                            className="w-full bg-gray-50 border-gray-100 rounded-[2rem] py-5 px-8 font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all focus:bg-white resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                         />
                      </div>

                      <div className="flex items-center gap-4 pt-4">
                         <button 
                            type="submit"
                            disabled={uploading}
                            className="flex-1 py-5 bg-gray-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                         >
                            <Save className="w-4 h-4" />
                            {isEditing ? 'Persist Updates' : 'Commit Blueprint'}
                         </button>
                         <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-8 py-5 border-2 border-gray-50 text-gray-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                         >
                            Cancel
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CertificateTemplates;
