import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const certificateService = {
  /**
   * Get all certificates for logged in student
   */
  getCertificates: async () => {
    try {
      const response = await api.get('/certificates');
      return response.data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error.response?.data || { message: 'Failed to fetch certificates' };
    }
  },

  /**
   * Get certificate by ID
   */
  getCertificateById: async (id) => {
    try {
      const response = await api.get(`/certificates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching certificate ${id}:`, error);
      throw error.response?.data || { message: 'Failed to fetch certificate' };
    }
  }
};

export default certificateService;
