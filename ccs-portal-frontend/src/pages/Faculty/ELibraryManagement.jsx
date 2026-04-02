import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { 
  Plus, 
  Search, 
  FileText, 
  Link as LinkIcon, 
  Video, 
  Music, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  FileUp,
  X,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import elibraryService from '../../services/elibraryService';
import uploadService from '../../services/uploadService';

const ELibraryManagement = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Link',
    contentUrl: '',
    description: ''
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await elibraryService.getMyResources();
      if (res.success) {
        setResources(res.data.resources);
      }
    } catch (error) {
      toast.error("Failed to load e-library resources");
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (id) => {
    try {
      await elibraryService.deleteResource(id);
      toast.success("Resource deleted");
      fetchResources();
    } catch (error) {
      toast.error("Failed to delete resource");
    } finally {
      setIsDeleting(null);
    }
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
    res.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">E-Library Management</h1>
            <p className="text-gray-500 mt-2">Manage your shared educational resources and links.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        </header>

        {/* Stats & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search resources by title or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your library...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No resources found</h2>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Start by adding your first educational resource to help your students learn better.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource._id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(resource)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsDeleting(resource._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate pr-10">{resource.title}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{resource.description || 'No description provided.'}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-full uppercase tracking-wider">
                    {resource.type}
                  </span>
                  <a 
                    href={resource.contentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    View Resource
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Delete Confirmation Overlay */}
                {isDeleting === resource._id && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <Trash2 className="w-10 h-10 text-red-100 mb-4" />
                    <h4 className="text-lg font-bold text-gray-900">Delete this resource?</h4>
                    <p className="text-sm text-gray-500 mt-2 mb-6 uppercase tracking-widest font-bold">This action cannot be undone</p>
                    <div className="flex items-center gap-3 w-full">
                      <button 
                        onClick={() => setIsDeleting(null)}
                        className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleDelete(resource._id)}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
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
                  <h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure your educational resource details.</p>
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
                    <label className="text-sm font-bold text-gray-700 px-1">Resource Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Intro to Data Structures"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 px-1">Resource Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                    >
                      {['Audio', 'Video', 'PDF', 'Doc', 'Link'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 px-1">Description (Optional)</label>
                  <textarea 
                    placeholder="Briefly explain what this resource covers..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-gray-700">Resource URL / File</label>
                    {(['PDF', 'Audio', 'Video', 'Doc'].includes(formData.type)) && (
                      <label className="cursor-pointer group flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
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
                        {uploading && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
                      </label>
                    )}
                  </div>
                  
                  <div className="relative">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  className="w-full py-5 bg-[#0f172a] text-white rounded-[1.5rem] font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 mt-4"
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
