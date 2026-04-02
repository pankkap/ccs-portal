import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const elibraryService = {
  /**
   * Get all e-library resources (Public)
   */
  getAllResources: async () => {
    try {
      const response = await api.get('/elibrary');
      return response.data;
    } catch (error) {
      console.error('Error fetching e-library resources:', error);
      throw error;
    }
  },

  /**
   * Get faculty's own resources
   */
  getMyResources: async () => {
    try {
      const response = await api.get('/elibrary/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching my resources:', error);
      throw error;
    }
  },

  /**
   * Create a new resource
   */
  createResource: async (resourceData) => {
    try {
      const response = await api.post('/elibrary', resourceData);
      return response.data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  /**
   * Update a resource
   */
  updateResource: async (id, resourceData) => {
    try {
      const response = await api.put(`/elibrary/${id}`, resourceData);
      return response.data;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  /**
   * Delete a resource
   */
  deleteResource: async (id) => {
    try {
      const response = await api.delete(`/elibrary/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
};

export default elibraryService;
