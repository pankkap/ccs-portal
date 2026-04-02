import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const uploadService = {
  /**
   * Upload a file to the server
   * @param {File} file - The file object to upload
   * @param {Function} onUploadProgress - Callback for progress (optional)
   * @returns {Promise<Object>} - The server response containing the URL
   */
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      console.error('File upload error:', error);
      throw error.response?.data || { message: 'File upload failed' };
    }
  },
};

export default uploadService;
