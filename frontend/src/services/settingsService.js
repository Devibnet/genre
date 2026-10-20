import api from './api';

const settingsService = {
  // Public API
  async getPublicSettings() {
    const response = await api.get('/settings');
    return response.data;
  },

  // Admin APIs
  async getAdminSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateSettings(data) {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/admin/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteLogo() {
    const response = await api.delete('/admin/settings/logo');
    return response.data;
  },
};

export default settingsService;
