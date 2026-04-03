import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const assessmentService = {
  /**
   * Get all published assessments (Old Registry)
   */
  getAllAssessments: async (params = {}) => {
    try {
      const response = await api.get('/assessments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error.response?.data || { message: 'Failed to fetch assessments' };
    }
  },

  /**
   * Get all mock tests (New Unified Repository)
   */
  getAllTests: async () => {
    try {
      const response = await api.get('/tests');
      return response.data;
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw error.response?.data || { message: 'Failed to fetch practice tests' };
    }
  },

  /**
   * Get assessments created by the logged-in faculty
   */
  getMyAssessments: async () => {
    try {
      const response = await api.get('/assessments/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching my assessments:', error);
      throw error.response?.data || { message: 'Failed to fetch your assessments' };
    }
  },

  /**
   * Get an assessment by ID
   */
  getAssessmentById: async (id) => {
    try {
      const response = await api.get(`/assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error.response?.data || { message: 'Failed to fetch assessment' };
    }
  },

  /**
   * Create a new assessment
   */
  createAssessment: async (assessmentData) => {
    try {
      const response = await api.post('/assessments', assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error.response?.data || { message: 'Failed to create assessment' };
    }
  },

  /**
   * Update an existing assessment
   */
  updateAssessment: async (id, assessmentData) => {
    try {
      const response = await api.put(`/assessments/${id}`, assessmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      throw error.response?.data || { message: 'Failed to update assessment' };
    }
  },

  /**
   * Delete an assessment
   */
  deleteAssessment: async (id) => {
    try {
      const response = await api.delete(`/assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error.response?.data || { message: 'Failed to delete assessment' };
    }
  },

  /**
   * Submit assessment answers
   */
  submitAssessment: async (id, submissionData) => {
    try {
      const response = await api.post(`/assessments/${id}/submit`, submissionData);
      return response.data;
    } catch (error) {
      console.error(`Error submitting assessment ${id}:`, error);
      throw error.response?.data || { message: 'Submission failed' };
    }
  },
};

export default assessmentService;
