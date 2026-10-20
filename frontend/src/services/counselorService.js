import api from './api';

const counselorService = {
  // Public APIs
  async getPublicCounselors(params = {}) {
    const response = await api.get('/counselors', { params });
    return response;
  },

  async getPublicCounselorById(id) {
    const response = await api.get(`/counselors/${id}`);
    return response.data;
  },

  // Admin APIs
  async getAdminCounselors(params = {}) {
    const response = await api.get('/admin/counselors', { params });
    return response;
  },

  async getAdminCounselorById(id) {
    const response = await api.get(`/admin/counselors/${id}`);
    return response.data;
  },

  async createCounselor(data) {
    // data: { name, age, description, whatsapp_number, status }
    const response = await api.post('/admin/counselors', data);
    return response.data;
  },

  async updateCounselor(id, data) {
    const response = await api.put(`/admin/counselors/${id}`, data);
    return response.data;
  },

  async deleteCounselor(id) {
    const response = await api.delete(`/admin/counselors/${id}`);
    return response.data;
  },

  async uploadPhoto(id, file) {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post(`/admin/counselors/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deletePhoto(id) {
    const response = await api.delete(`/admin/counselors/${id}/photo`);
    return response.data;
  },
};

export default counselorService;
