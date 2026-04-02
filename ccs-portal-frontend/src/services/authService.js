import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor no longer needs to manually attach tokens 
// because withCredentials: true handles the cookie automatically.

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // DO NOT intercept 401s for the login endpoint OR the initial profile check, 
    // as these are handled manually by AuthContext/Login and shouldn't trigger loops.
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    const isProfileEndpoint = error.config?.url?.includes('/auth/profile');
    
    if (error.response?.status === 401 && !isLoginEndpoint && !isProfileEndpoint) {
      // Token expired or invalid for an authenticated route - backend cleared cookie
      console.warn('Unauthorized request to protected endpoint. Redirecting to home.');
      localStorage.removeItem('profile');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Register a new user (admin only)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/admin/register', userData);
      if (response.data.success) {
        localStorage.setItem('profile', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('profile', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('profile');
    window.location.href = '/';
  },

  // Check if user is authenticated (best effort on frontend, verified by profile fetch)
  isAuthenticated: () => {
    return !!localStorage.getItem('profile');
  },

  // Get current user token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get current user profile from localStorage
  getCurrentUser: () => {
    const profile = localStorage.getItem('profile');
    return profile ? JSON.parse(profile) : null;
  },

  // Check if user has specific role
  hasRole: (role) => {
    const profile = authService.getCurrentUser();
    return profile?.role === role;
  },

  // Check if user is admin or staff
  isAdminOrStaff: () => {
    const profile = authService.getCurrentUser();
    return profile?.role === 'admin' || profile?.role === 'staff';
  }
};

export default authService;