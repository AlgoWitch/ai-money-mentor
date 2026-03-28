import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export const api = {
  submitAnswer: async (field, value) => {
    try {
      const response = await axios.post(`${API_BASE}/submit-answer`, { field, value });
      return response.data;
    } catch (error) {
      console.error('API Error (submitAnswer):', error);
      throw error;
    }
  },

  setGoal: async (name, target) => {
    try {
      const response = await axios.post(`${API_BASE}/set-goal`, { name, target });
      return response.data;
    } catch (error) {
      console.error('API Error (setGoal):', error);
      throw error;
    }
  },

  processSms: async (smsContent) => {
    try {
      const response = await axios.post(`${API_BASE}/process-sms?sms_content=${encodeURIComponent(smsContent)}`);
      return response.data;
    } catch (error) {
      console.error('API Error (processSms):', error);
      throw error;
    }
  },

  analyzeProfile: async (docText) => {
    try {
      const response = await axios.post(`${API_BASE}/analyze-profile?doc_text=${encodeURIComponent(docText)}`);
      return response.data;
    } catch (error) {
      console.error('API Error (analyzeProfile):', error);
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE}/health-check`);
      return response.data;
    } catch (error) {
      console.error('API Error (healthCheck):', error);
      throw error;
    }
  },

  fetchChatHistory: async () => {
    try {
      const response = await axios.get(`${API_BASE}/chat-history`);
      return response.data.history;
    } catch (error) {
      console.error('API Error (fetchChatHistory):', error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await axios.get(`${API_BASE}/me`);
      return response.data;
    } catch (error) {
      console.error('API Error (getMe):', error);
      throw error;
    }
  }
};
