import api from './api';

const feedbackService = {
  // Public: submit masukan & saran
  async submitFeedback(data) {
    return await api.post('/feedback', data);
  },

  // Admin: ambil semua feedback
  async getAdminFeedback(params = {}) {
    return await api.get('/admin/feedback', { params });
  },

  // Admin: ambil detail feedback
  async getAdminFeedbackById(id) {
    return await api.get(`/admin/feedback/${id}`);
  },

  // Admin: hapus feedback
  async deleteFeedback(id) {
    return await api.delete(`/admin/feedback/${id}`);
  },
};

export default feedbackService;