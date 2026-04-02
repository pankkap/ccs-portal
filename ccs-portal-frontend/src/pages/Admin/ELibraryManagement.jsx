import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { 
  GripVertical, 
  Edit2, 
  Trash2, 
  Plus, 
  Search, 
  FileText, 
  Video, 
  Music, 
  Link as LinkIcon, 
  ExternalLink, 
  Loader2,
  X,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/adminService';
import elibraryService from '../../services/elibraryService';
import uploadService from '../../services/uploadService';

const ELibraryManagement = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Link',
    contentUrl: '',
    description: ''
  });

  // Drag and drop state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await adminService.getELibrary();
      if (res.success) {
        setResources(res.data.resources || []);
      }
    } catch (error) {
      toast.error("Failed to load e-library resources");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = async () => {
    const _resources = [...resources];
    const draggedItemContent = _resources.splice(dragItem.current, 1)[0];
    _resources.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;

    // Local sequence update
    const updatedOrderList = _resources.map((item, index) => ({
      ...item,
      order: index
    }));

    setResources(updatedOrderList);

    // Persist to backend
    try {
      const payload = updatedOrderList.map(r => ({ id: r._id, order: r.order }));
      await adminService.reorderELibrary(payload);
      toast.success("Order saved successfully");
    } catch (err) {
      toast.error("Error saving new order");
      fetchResources(); // revert if failed
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await elibraryService.deleteResource(id);
      toast.success("Resource deleted successfully");
      setResources(resources.filter(r => r._id !== id));
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const openEditModal = (resource) => {
    setFormData({
      title: resource.title,
      type: resource.type,
      contentUrl: resource.contentUrl,
      description: resource.description || ''
    });
    setEditingId(resource._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'Link',
      contentUrl: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error("File size must be less than 10MB");
    }

    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        setFormData(prev => ({ ...prev, contentUrl: res.data.url }));
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.contentUrl) {
      return toast.error("Title and Resource Link/File are required");
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await elibraryService.updateResource(editingId, formData);
        toast.success("Resource updated successfully");
      } else {
        await elibraryService.createResource(formData);
        toast.success("Resource created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save resource");
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      case 'Audio': return <Music className="w-5 h-5 text-purple-500" />;
      case 'Video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'Doc': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Link': return <LinkIcon className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (res.facultyName && res.facultyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-sans">E-Library Management</h1>
            <p className="text-gray-500 mt-2">Manage all resources shared across the portal. Drag and drop to rearrange public visibility.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        </header>

        {/* Search */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title or faculty name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium font-sans">Loading library...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-sans">No resources found</h2>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto font-sans">
              There are no e-library resources available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map((resource, index) => (
              <div
                key={resource._id}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="bg-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-gray-300 cursor-move hover:text-gray-500 transition-colors p-1">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 font-sans">{resource.title}</h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded">
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-sans">
                      <span className="font-bold text-gray-400 uppercase tracking-tighter mr-1">Faculty:</span>
                      <span className="font-semibold">{resource.facultyName || 'System'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={resource.contentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="View Original"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => openEditModal(resource)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteResource(resource._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-sans">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
                  <p className="text-sm text-gray-500 mt-1 font-sans">Configure e-library resource details.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 px-1 font-sans">Resource Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Intro to Data Structures"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 px-1 font-sans">Resource Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none font-sans"
                    >
                      {['Audio', 'Video', 'PDF', 'Doc', 'Link'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 px-1 font-sans">Description (Optional)</label>
                  <textarea 
                    placeholder="Briefly explain what this resource covers..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none shadow-inner font-sans"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-gray-700 font-sans">Resource URL / File</label>
                    {(['PDF', 'Audio', 'Video', 'Doc'].includes(formData.type)) && (
                      <label className="cursor-pointer group flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest font-sans">
                          Upload {formData.type}
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileUpload} 
                          disabled={uploading} 
                          accept={
                            formData.type === 'PDF' ? '.pdf' : 
                            formData.type === 'Doc' ? '.doc,.docx' : 
                            formData.type === 'Video' ? 'video/*' : 
                            formData.type === 'Audio' ? 'audio/*' : '*'
                          }
                        />
                        {uploading && <Loader2 className="w-3 h-3 text-blue-600 animate-spin font-sans" />}
                      </label>
                    )}
                  </div>
                  
                  <div className="relative">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-sans" />
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={formData.contentUrl}
                      onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none text-sm font-mono text-gray-600"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving || uploading}
                  className="w-full py-5 bg-[#0f172a] text-white rounded-[1.5rem] font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 mt-4 font-sans"
                >
                  {isSaving ? 'Processing...' : editingId ? 'Update Resource' : 'Publish Resource'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ELibraryManagement;
