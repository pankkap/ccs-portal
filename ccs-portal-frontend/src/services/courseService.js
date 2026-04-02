import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const courseService = {
  /**
   * Get all published courses (Public)
   */
  getAllCourses: async () => {
    try {
      const response = await api.get('/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error.response?.data || { message: 'Failed to fetch courses' };
    }
  },

  /**
   * Get courses created by the logged-in faculty
   */
  getMyCourses: async () => {
    try {
      const response = await api.get('/courses/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching my courses:', error);
      throw error.response?.data || { message: 'Failed to fetch your courses' };
    }
  },

  /**
   * Get a single course by ID
   */
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error.response?.data || { message: 'Failed to fetch course' };
    }
  },

  /**
   * Create a new course
   */
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error.response?.data || { message: 'Failed to create course' };
    }
  },

  /**
   * Update an existing course
   */
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error.response?.data || { message: 'Failed to update course' };
    }
  },

  /**
   * Delete a course
   */
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error.response?.data || { message: 'Failed to delete course' };
    }
  },
};

export default courseService;
