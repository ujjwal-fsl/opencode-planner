import api from '../api/axios';

export const authService = {
  login: async (credentials) => {
    // Note: /api is already appended by axios instance
    const response = await api.post('/auth/login', credentials);
    // STRICT FIX: Backend returns token in data.data.token
    const token = response.data?.data?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};