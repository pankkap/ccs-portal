import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const testService = {
  // Faculty: Fetch all assessments owned by the logged-in faculty
  getMyTests: async () => {
    try {
      const response = await api.get('/tests/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch registry records' };
    }
  },

  // Student: Fetch public Practice Mock Tests only
  getPublicTests: async () => {
    try {
      const response = await api.get('/tests');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to access Practice Lobby' };
    }
  },

  getTestById: async (id) => {
    try {
      const response = await api.get(`/tests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Blueprint not found in registry' };
    }
  },

  createTest: async (data) => {
    try {
      const response = await api.post('/tests', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to archive blueprint' };
    }
  },

  updateTest: async (id, data) => {
    try {
      const response = await api.put(`/tests/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to commit changes' };
    }
  },

  deleteTest: async (id) => {
    try {
      const response = await api.delete(`/tests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to purge record' };
    }
  }
};

export default testService;
