import axios from 'axios';

// Use environment variable for API URL in production (Vercel)
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (username, password) => 
    api.post('/auth/register', { username, password }),
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
};

// Messages API
export const messagesAPI = {
  send: (receiverId, plaintext) => 
    api.post('/messages', { receiverId, plaintext }),
  getConversation: (otherUserId) => 
    api.get(`/messages/conversation/${otherUserId}`),
};

export default api;
