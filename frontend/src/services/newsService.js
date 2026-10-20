import api from './api';

const newsService = {
  // Public APIs
  async getPublicNews(params = {}) {
    const response = await api.get('/news', { params });
    return response;
  },

  async getPublicNewsBySlug(slug) {
    const response = await api.get(`/news/${slug}`);
    return response.data;
  },

  // Admin APIs
  async getAdminNews(params = {}) {
    const response = await api.get('/admin/news', { params });
    return response;
  },

  async getAdminNewsById(id) {
    const response = await api.get(`/admin/news/${id}`);
    return response.data;
  },

  async createNews(data) {
    const response = await api.post('/admin/news', data);
    return response.data;
  },

  async updateNews(id, data) {
    const response = await api.put(`/admin/news/${id}`, data);
    return response.data;
  },

  async deleteNews(id) {
    const response = await api.delete(`/admin/news/${id}`);
    return response.data;
  },

  async publishNews(id) {
    const response = await api.post(`/admin/news/${id}/publish`);
    return response.data;
  },

  async unpublishNews(id) {
    const response = await api.post(`/admin/news/${id}/unpublish`);
    return response.data;
  },

  async uploadCover(id, file) {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await api.post(`/admin/news/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCover(id) {
    const response = await api.delete(`/admin/news/${id}/cover`);
    return response.data;
  },

  // News Photos Operations
  async addNewsPhoto(newsId, file, caption = '', orderNumber = 1) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    formData.append('order_number', orderNumber);
    const response = await api.post(`/admin/news/${newsId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateNewsPhoto(photoId, data) {
    // data: { caption, order_number }
    const response = await api.put(`/admin/news-photos/${photoId}`, data);
    return response.data;
  },

  async deleteNewsPhoto(photoId) {
    const response = await api.delete(`/admin/news-photos/${photoId}`);
    return response.data;
  },
};

export default newsService;
