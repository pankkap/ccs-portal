import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import {
  FileText,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  User,
  BarChart,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import pageService from '../../services/pageService';

const PageManagement = () => {
  const { profile } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    category: 'general',
    excerpt: ''
  });
  const [editPageData, setEditPageData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    category: 'general',
    excerpt: ''
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await pageService.getAllPages();
      setPages(response.data || response.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages. Please try again.');
      // Fallback to empty array
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || page.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreatePage = async (pageData) => {
    try {
      const response = await pageService.createPage(pageData);
      toast.success('Page created successfully');
      setShowCreateModal(false);
      fetchPages(); // Refresh the list
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error(error.response?.data?.message || 'Failed to create page');
    }
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setEditPageData({
      title: page.title || '',
      slug: page.slug || '',
      content: page.content || '',
      status: page.status || 'draft',
      category: page.category || 'general',
      excerpt: page.excerpt || ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePage = async (pageData) => {
    try {
      if (!selectedPage?._id) {
        toast.error('No page selected for update');
        return;
      }
      await pageService.updatePage(selectedPage._id, pageData);
      toast.success('Page updated successfully');
      setShowEditModal(false);
      fetchPages(); // Refresh the list
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error(error.response?.data?.message || 'Failed to update page');
    }
  };

  const handleDeletePage = async (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await pageService.deletePage(pageId);
        toast.success('Page deleted successfully');
        fetchPages(); // Refresh the list
      } catch (error) {
        console.error('Error deleting page:', error);
        toast.error(error.response?.data?.message || 'Failed to delete page');
      }
    }
  };

  const handlePublishPage = async (pageId) => {
    try {
      await pageService.updatePageStatus(pageId, 'published');
      toast.success('Page published successfully');
      fetchPages(); // Refresh the list
    } catch (error) {
      console.error('Error publishing page:', error);
      toast.error(error.response?.data?.message || 'Failed to publish page');
    }
  };

  const handleArchivePage = async (pageId) => {
    try {
      await pageService.updatePageStatus(pageId, 'archived');
      toast.success('Page archived successfully');
      fetchPages(); // Refresh the list
    } catch (error) {
      console.error('Error archiving page:', error);
      toast.error(error.response?.data?.message || 'Failed to archive page');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'home': return 'bg-blue-100 text-blue-800';
      case 'about': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'faculty': return 'bg-orange-100 text-orange-800';
      case 'placement': return 'bg-red-100 text-red-800';
      case 'library': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  };
  
  
  
   return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Page Management</h1>
              <p className="text-gray-600 mt-2">
                Create, edit, and manage web pages for the portal
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Page
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Pages</p>
                <p className="text-3xl font-bold text-gray-900">{pages.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Published</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pages.filter(p => p.status === 'published').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Drafts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pages.filter(p => p.status === 'draft').length}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pages.reduce((sum, page) => sum + page.views, 0)}
                </p>
              </div>
              <BarChart className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Pages
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, slug, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="home">Home</option>
                <option value="about">About</option>
                <option value="training">Training</option>
                <option value="faculty">Faculty</option>
                <option value="placement">Placement</option>
                <option value="library">Library</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pages Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                        <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                          {page.excerpt}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                        {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(page.category)}`}>
                        {page.category.charAt(0).toUpperCase() + page.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{page.author.name}</div>
                          <div className="text-xs text-gray-500">{page.author.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{page.views.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(page.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {page.status === 'draft' && (
                          <button
                            onClick={() => handlePublishPage(page._id || page.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Publish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {page.status === 'published' && (
                          <button
                            onClick={() => handleArchivePage(page._id || page.id)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Archive"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePage(page._id || page.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pages found matching your criteria</p>
            </div>
          )}
        </div>
        
        {/* Create Page Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Page</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newPageData.title}
                      onChange={(e) => setNewPageData({...newPageData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter page title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                    <input
                      type="text"
                      value={newPageData.slug}
                      onChange={(e) => setNewPageData({...newPageData, slug: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="page-slug (lowercase, hyphens only)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newPageData.category}
                      onChange={(e) => setNewPageData({...newPageData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="general">General</option>
                      <option value="home">Home</option>
                      <option value="about">About</option>
                      <option value="training">Training</option>
                      <option value="faculty">Faculty</option>
                      <option value="placement">Placement</option>
                      <option value="library">Library</option>
                      <option value="contact">Contact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={newPageData.status}
                      onChange={(e) => setNewPageData({...newPageData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt (Optional)</label>
                    <textarea
                      value={newPageData.excerpt}
                      onChange={(e) => setNewPageData({...newPageData, excerpt: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                      placeholder="Brief description of the page"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                    <textarea
                      value={newPageData.content}
                      onChange={(e) => setNewPageData({...newPageData, content: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg h-40"
                      placeholder="Enter page content"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewPageData({
                          title: '',
                          slug: '',
                          content: '',
                          status: 'draft',
                          category: 'general',
                          excerpt: ''
                        });
                      }}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCreatePage(newPageData)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={!newPageData.title || !newPageData.slug || !newPageData.content}
                    >
                      Create Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Page Modal */}
        {showEditModal && selectedPage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Page: {selectedPage.title}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editPageData.title}
                      onChange={(e) => setEditPageData({...editPageData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                    <input
                      type="text"
                      value={editPageData.slug}
                      onChange={(e) => setEditPageData({...editPageData, slug: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={editPageData.category}
                      onChange={(e) => setEditPageData({...editPageData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="general">General</option>
                      <option value="home">Home</option>
                      <option value="about">About</option>
                      <option value="training">Training</option>
                      <option value="faculty">Faculty</option>
                      <option value="placement">Placement</option>
                      <option value="library">Library</option>
                      <option value="contact">Contact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editPageData.status}
                      onChange={(e) => setEditPageData({...editPageData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt (Optional)</label>
                    <textarea
                      value={editPageData.excerpt}
                      onChange={(e) => setEditPageData({...editPageData, excerpt: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                    <textarea
                      value={editPageData.content}
                      onChange={(e) => setEditPageData({...editPageData, content: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg h-40"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdatePage(editPageData)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={!editPageData.title || !editPageData.slug || !editPageData.content}
                    >
                      Update Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
      );
  };
  
  export default PageManagement;