import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const threatsAPI = {
  getAll: (params) => api.get('/threats', { params }),
  getById: (id) => api.get(`/threats/${id}`),
  create: (data) => api.post('/threats/report', data),
  update: (id, data) => api.patch(`/threats/${id}`, data),
  delete: (id) => api.delete(`/threats/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getTimeline: (days) => api.get('/dashboard/timeline', { params: { days } }),
  getUserStats: () => api.get('/dashboard/user-stats'),
  getMitreMapping: () => api.get('/dashboard/mitre-mapping'),
  getThreatMap: () => api.get('/dashboard/threat-map'),
};

export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/chat', { message }),
  getIntents: () => api.get('/chatbot/intents'),
};

export const phishingAPI = {
  scanUrl: (url) => api.post('/phishing/scan-url', { url }),
  scanEmail: (emailBody, sender) => api.post('/phishing/scan-email', { email_body: emailBody, sender }),
};

export const malwareAPI = {
  scanFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/malware/scan-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  scanUrl: (url) => api.post('/malware/scan-url', { url }),
};

export const blockchainAPI = {
  getStats: () => api.get('/blockchain/stats'),
  verify: (threatId) => api.get(`/blockchain/verify/${threatId}`),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getPendingThreats: () => api.get('/admin/threats/pending'),
  moderateThreat: (id, status) => api.patch(`/admin/threats/${id}/moderate`, { status }),
  getAllUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle`),
  deleteThreat: (id) => api.delete(`/admin/threats/${id}`),
};

export default api;