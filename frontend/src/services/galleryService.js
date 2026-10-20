import api from './api';

const galleryService = {
  // Public APIs
  async getPublicGallery(params = {}) {
    const response = await api.get('/gallery', { params });
    return response;
  },

  async getPublicGalleryById(id) {
    const response = await api.get(`/gallery/${id}`);
    return response.data;
  },

  // Admin APIs
  async getAdminGallery(params = {}) {
    const response = await api.get('/admin/gallery', { params });
    return response;
  },

  async createGalleryItem(file, caption) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    const response = await api.post('/admin/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateGalleryItem(id, caption) {
    const response = await api.put(`/admin/gallery/${id}`, { caption });
    return response.data;
  },

  async deleteGalleryItem(id) {
    const response = await api.delete(`/admin/gallery/${id}`);
    return response.data;
  },
};

export default galleryService;
