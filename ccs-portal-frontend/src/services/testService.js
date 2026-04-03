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
  getMyTests: async () => {
    try {
      const response = await api.get('/tests/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tests' };
    }
  },

  getTestById: async (id) => {
    try {
      const response = await api.get(`/tests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch test details' };
    }
  },

  createTest: async (data) => {
    try {
      const response = await api.post('/tests', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create test' };
    }
  },

  updateTest: async (id, data) => {
    try {
      const response = await api.put(`/tests/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update test' };
    }
  },

  deleteTest: async (id) => {
    try {
      const response = await api.delete(`/tests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete test' };
    }
  }
};

export default testService;
