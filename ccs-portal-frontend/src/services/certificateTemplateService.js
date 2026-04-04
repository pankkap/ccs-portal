import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const certificateTemplateService = {
  /**
   * Get all active certificate templates (for Faculty)
   */
  getAllTemplates: async () => {
    try {
      const response = await api.get('/certificate-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error.response?.data || { message: 'Failed to fetch templates' };
    }
  },

  /**
   * Get all templates for Admin management
   */
  getAdminTemplates: async () => {
    try {
      const response = await api.get('/certificate-templates/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin templates:', error);
      throw error.response?.data || { message: 'Failed to fetch templates for administration' };
    }
  },

  /**
   * Create a new certificate template
   */
  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/certificate-templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error.response?.data || { message: 'Failed to create template' };
    }
  },

  /**
   * Update an existing certificate template
   */
  updateTemplate: async (id, templateData) => {
    try {
      const response = await api.put(`/certificate-templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error.response?.data || { message: 'Failed to update template' };
    }
  },

  /**
   * Delete a certificate template
   */
  deleteTemplate: async (id) => {
    try {
      const response = await api.delete(`/certificate-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error.response?.data || { message: 'Failed to delete template' };
    }
  }
};

export default certificateTemplateService;
