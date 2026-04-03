import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // We'll set 'Content-Type' dynamically for bulk uploads
});

const questionService = {
  getBank: async (params = {}) => {
    try {
      const response = await api.get('/questions/bank', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch questions' };
    }
  },

  createQuestion: async (data) => {
    try {
      const response = await api.post('/questions', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create question' };
    }
  },

  updateQuestion: async (id, data) => {
    try {
      const response = await api.put(`/questions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update question' };
    }
  },

  deleteQuestion: async (id) => {
    try {
      const response = await api.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete question' };
    }
  },

  bulkUpload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/questions/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Bulk upload failed' };
    }
  },
  
  getTopics: async (domain) => {
    try {
      const response = await api.get('/questions/topics', { params: { domain } });
      return response.data;
    } catch (error) {
       throw error.response?.data || { message: 'Failed to fetch topics' };
    }
  },

  getSubtopics: async (domain, topic) => {
    try {
      const response = await api.get('/questions/subtopics', { params: { domain, topic } });
      return response.data;
    } catch (error) {
       throw error.response?.data || { message: 'Failed to fetch subtopics' };
    }
  }
};

export default questionService;
