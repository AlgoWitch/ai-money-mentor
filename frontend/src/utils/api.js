import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

// Axios Interceptor for injecting JWT
const axiosInstance = axios.create({ baseURL: API_BASE });
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('niveshak_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  login: async (formDataParams) => {
    // OAuth2 password flow requires form data (x-www-form-urlencoded)
    const response = await axiosInstance.post(`/login`, formDataParams, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    localStorage.setItem('niveshak_token', response.data.access_token);
    return response.data;
  },

  signup: async (email, password, name) => {
    const response = await axiosInstance.post(`/signup`, { email, password, name });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('niveshak_token');
  },

  getMe: async () => {
    try {
      const response = await axiosInstance.get(`/me`);
      return response.data;
    } catch (error) {
      console.error('API Error (getMe):', error);
      throw error;
    }
  },

  submitAnswer: async (field, value) => {
    const response = await axiosInstance.post(`/submit-answer`, { field, value });
    return response.data;
  },

  setGoal: async (name, target) => {
    const response = await axiosInstance.post(`/set-goal`, { name, target });
    return response.data;
  },

  processSms: async (smsContent) => {
    const response = await axiosInstance.post(`/process-sms`, { sms_content: smsContent });
    return response.data;
  },

  analyzeProfile: async (docText) => {
    const response = await axiosInstance.post(`/analyze-profile`, { doc_text: docText });
    return response.data;
  },

  extractPdf: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  healthCheck: async () => {
    try {
      const response = await axiosInstance.get(`/health-check`);
      return response.data;
    } catch (error) {
      console.error('API Error (healthCheck):', error);
      throw error;
    }
  },

  fetchChatHistory: async () => {
    try {
      const response = await axiosInstance.get(`/chat-history`);
      return response.data.history || [];
    } catch (error) {
      console.error('API Error (fetchChatHistory):', error);
      throw error;
    }
  },

  marketSentiment: async () => {
    const response = await axiosInstance.get(`/market-sentiment`);
    return response.data;
  },

  chat: async (text) => {
    const response = await axiosInstance.post(`/chat`, { text });
    return response.data;
  }
};
