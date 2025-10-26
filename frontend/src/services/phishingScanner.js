import api from './api';

export const phishingScanner = {
  async scanUrl(url) {
    try {
      const response = await api.post('/phishing/scan-url', { url });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'URL scan failed');
    }
  },

  async scanEmail(emailBody, sender) {
    try {
      const response = await api.post('/phishing/scan-email', { 
        email_body: emailBody, 
        sender 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Email scan failed');
    }
  }
};