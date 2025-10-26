import api from './api';

export const notificationService = {
  async getNotifications(limit = 20) {
    try {
      const response = await api.get(`/notifications?limit=${limit}`);
      return response.data.notifications;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch notifications');
    }
  },

  async markAsRead(notificationId) {
    try {
      await api.post(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to mark as read');
    }
  }
};