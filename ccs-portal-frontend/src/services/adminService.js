import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const adminService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error.response?.data || { message: 'Failed to fetch admin stats' };
    }
  },

  /**
   * Get all users
   */
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  /**
   * Update user details or role
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error.response?.data || { message: 'Failed to update user' };
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },

  /**
   * Get all faculty members
   */
  getFaculty: async (params = {}) => {
    try {
      const response = await api.get('/admin/faculty', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      throw error.response?.data || { message: 'Failed to fetch faculty' };
    }
  },

  /**
   * Create new faculty member
   */
  createFaculty: async (facultyData) => {
    try {
      const response = await api.post('/admin/faculty', facultyData);
      return response.data;
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw error.response?.data || { message: 'Failed to create faculty member' };
    }
  },

  /**
   * Update faculty member
   */
  updateFaculty: async (id, facultyData) => {
    try {
      const response = await api.put(`/admin/faculty/${id}`, facultyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating faculty ${id}:`, error);
      throw error.response?.data || { message: 'Failed to update faculty member' };
    }
  },

  /**
   * Delete faculty member
   */
  deleteFaculty: async (id) => {
    try {
      const response = await api.delete(`/admin/faculty/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting faculty ${id}:`, error);
      throw error.response?.data || { message: 'Failed to delete faculty' };
    }
  },

  /**
   * Reorder faculty (bulk update)
   */
  reorderFaculty: async (reorderData) => {
    try {
      const response = await api.patch('/admin/faculty/reorder', { items: reorderData });
      return response.data;
    } catch (error) {
      console.error('Error reordering faculty:', error);
      throw error.response?.data || { message: 'Failed to reorder faculty' };
    }
  },

  /**
   * Get all courses
   */
  getCourses: async () => {
    try {
      const response = await api.get('/admin/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin courses:', error);
      throw error.response?.data || { message: 'Failed to fetch courses' };
    }
  },

  /**
   * Reorder courses
   */
  reorderCourses: async (reorderData) => {
    try {
      const response = await api.patch('/admin/courses/reorder', { items: reorderData });
      return response.data;
    } catch (error) {
      console.error('Error reordering courses:', error);
      throw error.response?.data || { message: 'Failed to reorder courses' };
    }
  },

  /**
   * Get all e-library resources
   */
  getELibrary: async () => {
    try {
      const response = await api.get('/admin/elibrary');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin elibrary:', error);
      throw error.response?.data || { message: 'Failed to fetch e-library resources' };
    }
  },

  /**
   * Reorder e-library resources
   */
  reorderELibrary: async (reorderData) => {
    try {
      const response = await api.patch('/admin/elibrary/reorder', { items: reorderData });
      return response.data;
    } catch (error) {
      console.error('Error reordering e-library:', error);
      throw error.response?.data || { message: 'Failed to reorder e-library' };
    }
  }
};

export default adminService;
