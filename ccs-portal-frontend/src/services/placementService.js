import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const placementService = {
  /**
   * Get all active job openings (Student view)
   */
  getPlacements: async () => {
    try {
      const response = await api.get('/placements');
      return response.data;
    } catch (error) {
      console.error('Error fetching placements:', error);
      throw error.response?.data || { message: 'Failed to fetch placements' };
    }
  },

  /**
   * Get all job openings (Staff/Admin view)
   */
  getAllPlacements: async () => {
    try {
      const response = await api.get('/placements/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all placements:', error);
      throw error.response?.data || { message: 'Failed to fetch job openings' };
    }
  },

  /**
   * Create a new job opening
   */
  createPlacement: async (jobData) => {
    try {
      const response = await api.post('/placements', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating placement:', error);
      throw error.response?.data || { message: 'Failed to post job' };
    }
  },

  /**
   * Get all applications (Staff/Admin view)
   */
  getApplications: async () => {
    try {
      const response = await api.get('/placements/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error.response?.data || { message: 'Failed to fetch applications' };
    }
  },

  /**
   * Apply for a job
   */
  applyForJob: async (applicationData) => {
    try {
      const response = await api.post('/placements/apply', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error.response?.data || { message: 'Failed to submit application' };
    }
  },

  /**
   * Update application status
   */
  updateApplicationStatus: async (id, status) => {
    try {
      const response = await api.put(`/placements/applications/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error.response?.data || { message: 'Failed to update application' };
    }
  },
};

export default placementService;
