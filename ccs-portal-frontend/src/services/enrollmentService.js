import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const enrollmentService = {
  /**
   * Enroll the logged-in student in a course
   */
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post('/enrollments', { courseId });
      return response.data;
    } catch (error) {
      console.error('Enrollment error:', error);
      throw error.response?.data || { message: 'Failed to enroll in course' };
    }
  },

  /**
   * Get all enrollments for the logged-in student
   */
  getMyEnrollments: async () => {
    try {
      const response = await api.get('/enrollments/my');
      return response.data;
    } catch (error) {
      console.error('Fetch enrollments error:', error);
      throw error.response?.data || { message: 'Failed to fetch enrollments' };
    }
  },

  /**
   * Get enrollment details for a specific course
   */
  getEnrollmentByCourseId: async (courseId) => {
    try {
      const response = await api.get(`/enrollments/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch enrollment detail error:', error);
      throw error.response?.data || { message: 'Failed to fetch enrollment detail' };
    }
  },

  /**
   * Update progress for an enrollment
   */
  updateProgress: async (enrollmentId, progressData) => {
    try {
      const response = await api.put(`/enrollments/progress/${enrollmentId}`, progressData);
      return response.data;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error.response?.data || { message: 'Failed to update progress' };
    }
  },

  /**
   * Submit module or course assessment result
   */
  submitAssessmentResult: async (enrollmentId, submissionData) => {
    try {
      const response = await api.post(`/enrollments/${enrollmentId}/submit-assessment`, submissionData);
      return response.data;
    } catch (error) {
      console.error('Submit assessment result error:', error);
      throw error.response?.data || { message: 'Failed to submit assessment' };
    }
  },
};

export default enrollmentService;
