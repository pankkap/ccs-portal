import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// The browser will automatically send cookies with withCredentials: true.
// No request interceptor needed for manual token injection.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized access in PageService. Redirecting to login.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const pageService = {
  // Get all pages (admin/staff only)
  getAllPages: async (params = {}) => {
    try {
      const response = await api.get('/pages', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  },

  // Get page by ID
  getPageById: async (id) => {
    try {
      const response = await api.get(`/pages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching page ${id}:`, error);
      throw error;
    }
  },

  // Get page by slug (public)
  getPageBySlug: async (slug) => {
    try {
      const response = await api.get(`/pages/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching page by slug ${slug}:`, error);
      throw error;
    }
  },

  // Create new page
  createPage: async (pageData) => {
    try {
      const response = await api.post('/pages', pageData);
      return response.data;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  },

  // Update page
  updatePage: async (id, pageData) => {
    try {
      const response = await api.put(`/pages/${id}`, pageData);
      return response.data;
    } catch (error) {
      console.error(`Error updating page ${id}:`, error);
      throw error;
    }
  },

  // Delete page
  deletePage: async (id) => {
    try {
      const response = await api.delete(`/pages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting page ${id}:`, error);
      throw error;
    }
  },

  // Update page status
  updatePageStatus: async (id, status) => {
    try {
      const response = await api.patch(`/pages/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating page status ${id}:`, error);
      throw error;
    }
  },

  // Get published pages (public)
  getPublishedPages: async (params = {}) => {
    try {
      const response = await api.get('/pages/published', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching published pages:', error);
      throw error;
    }
  },

  // Get pages by category (public)
  getPagesByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/pages/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching pages by category ${category}:`, error);
      throw error;
    }
  },

  // Increment page views
  incrementPageViews: async (id) => {
    try {
      const response = await api.post(`/pages/${id}/view`);
      return response.data;
    } catch (error) {
      console.error(`Error incrementing views for page ${id}:`, error);
      throw error;
    }
  },

  // Search pages
  searchPages: async (query, params = {}) => {
    try {
      const response = await api.get('/pages/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching pages with query ${query}:`, error);
      throw error;
    }
  },

  // Get page statistics
  getPageStats: async () => {
    try {
      const response = await api.get('/pages/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching page stats:', error);
      throw error;
    }
  }
};

export default pageService;