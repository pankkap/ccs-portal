import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('profile');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const facultyService = {
  getFaculty: async (params = {}) => {
    try {
      const response = await api.get('/admin/faculty', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      throw error;
    }
  },

  createFaculty: async (facultyData) => {
    try {
      const response = await api.post('/admin/faculty', facultyData);
      return response.data;
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw error;
    }
  },

  updateFaculty: async (id, facultyData) => {
    try {
      const response = await api.put(`/admin/faculty/${id}`, facultyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating faculty ${id}:`, error);
      throw error;
    }
  },

  deleteFaculty: async (id) => {
    try {
      const response = await api.delete(`/admin/faculty/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting faculty ${id}:`, error);
      throw error;
    }
  },

  updateFacultyRole: async (id, role) => {
    try {
      const response = await api.patch(`/admin/faculty/role/${id}`, { role });
      return response.data;
    } catch (error) {
      console.error(`Error updating faculty role ${id}:`, error);
      throw error;
    }
  },

  reorderFaculty: async (items) => {
    try {
      const response = await api.patch('/admin/faculty/reorder', { items });
      return response.data;
    } catch (error) {
      console.error('Error reordering faculty:', error);
      throw error;
    }
  }
};

export default facultyService;
