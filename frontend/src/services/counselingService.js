import api from './api';

const counselingService = {
  // Public API
  async submitRequest(data) {
    const response = await api.post('/counseling', data);
    return response.data;
  },

  // Admin APIs
  async getCounselingRequests(params = {}) {
    const response = await api.get('/admin/counseling', { params });
    return response;
  },

  async getCounselingRequestById(id) {
    const response = await api.get(`/admin/counseling/${id}`);
    return response.data;
  },

  async updateCounselingStatus(id, status) {
    const response = await api.put(`/admin/counseling/${id}`, { status });
    return response.data;
  },

  async deleteCounselingRequest(id) {
    const response = await api.delete(`/admin/counseling/${id}`);
    return response.data;
  },
};

export default counselingService;
