import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiService = {
  generateQuestions: async (data) => {
    try {
      const response = await api.post('/ai/generate-questions', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'AI generation failed' };
    }
  }
};

export default aiService;
