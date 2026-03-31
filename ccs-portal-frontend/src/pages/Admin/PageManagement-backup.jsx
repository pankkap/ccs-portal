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

  // Mock data for demonstration
  const mockPages = [
    {
      id: '1',
      title: 'Home Page',
      slug: 'home',
      content: 'Welcome to CCS Training Portal...',
      excerpt: 'Main landing page for the portal',
      status: 'published',
      category: 'home',
      author: { name: 'Admin User', email: 'admin@iilm.edu' },
      views: 1250,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-03-28T14:20:00Z'
    },
    {
      id: '2',
      title: 'About Us',
      slug: 'about',
      content: 'Learn about our institution...',
      excerpt: 'Information about CCS and our mission',
      status: 'published',
      category: 'about',
      author: { name: 'Admin User', email: 'admin@iilm.edu' },
      views: 850,
      createdAt: '2024-01-20T11:15:00Z',
      updatedAt: '2024-03-25T09:45:00Z'
    },
    {
      id: '3',
      title: 'Training Programs',
      slug: 'training',
      content: 'Details about our training programs...',
      excerpt: 'Overview of available training courses',
      status: 'published',
      category: 'training',
      author: { name: 'Staff Member', email: 'staff@iilm.edu' },
      views: 620,
      createdAt: '2024-02-10T09:20:00Z',
      updatedAt: '2024-03-30T16:10:00Z'
    },
    {
      id: '4',
      title: 'Placement Guidelines',
      slug: 'placement-guidelines',
      content: 'Guidelines for placement process...',
      excerpt: 'Rules and procedures for campus placements',
      status: 'draft',
      category: 'placement',
      author: { name: 'Placement Officer', email: 'placement@iilm.edu' },
      views: 0,
      createdAt: '2024-03-25T14:30:00Z',
      updatedAt: '2024-03-30T11:20:00Z'
    },
    {
      id: '5',
      title: 'Faculty Directory',
      slug: 'faculty',
      content: 'Meet our experienced faculty...',
      excerpt: 'List of faculty members and their expertise',
      status: 'published',
      category: 'faculty',
      author: { name: 'Admin User', email: 'admin@iilm.edu' },
      views: 420,
      createdAt: '2024-02-28T13:45:00Z',
      updatedAt: '2024-03-29T10:15:00Z'
    },
    {
      id: '6',
      title: 'E-Library Access',
      slug: 'e-library',
      content: 'Access our digital library resources...',
      excerpt: 'Guide to using the e-library system',
      status: 'archived',
      category: 'library',
      author: { name: 'Staff Member', email: 'staff@iilm.edu' },
      views: 320,
      createdAt: '2024-01-30T16:20:00Z',
      updatedAt: '2024-03-20T12:30:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPages(mockPages);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || page.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreatePage = () => {
    toast.success('Create page functionality ready for backend integration');
    setShowCreateModal(false);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setShowEditModal(true);
  };

  const handleUpdatePage = () => {
    toast.success('Page updated successfully');
    setShowEditModal(false);
  };

  const handleDeletePage = (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      setPages(pages.filter(page => page.id !== pageId));
      toast.success('Page deleted successfully');
    }
  };

  const handlePublishPage = (pageId) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, status: 'published' } : page
    ));
    toast.success('Page published successfully');
  };

  const handleArchivePage = (pageId) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, status: 'archived' } : page
    ));
    toast.success('Page archived successfully');
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
  
  export default PageManagement;
    );
  };
  
  export default PageManagement;
    );
  }

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
                            onClick={() => handlePublishPage(page.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Publish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {page.status === 'published' && (
                          <button
                            onClick={() => handleArchivePage(page.id)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Archive"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePage(page.id)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Enter page title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="page-slug" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg h-40" placeholder="Enter page content"></textarea>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                      Cancel
                    </button>
                    <button onClick={handleCreatePage} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input type="text" defaultValue={selectedPage.title} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea defaultValue={selectedPage.content} className="w-full px-4 py-2 border border-gray-300 rounded-lg h-40"></textarea>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                      Cancel
                    </button>
                    <button onClick={handleUpdatePage} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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