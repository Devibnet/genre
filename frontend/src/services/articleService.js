import api from './api';

const articleService = {
  // Public APIs
  async getPublicArticles(params = {}) {
    // params: { page, per_page, search }
    const response = await api.get('/articles', { params });
    // Returns full pagination format { data: [...], meta: { page, per_page, total, ... } }
    return response;
  },

  async getPublicArticleBySlug(slug) {
    const response = await api.get(`/articles/${slug}`);
    return response.data;
  },

  // Admin APIs
  async getAdminArticles(params = {}) {
    // params: { page, per_page, search, status }
    const response = await api.get('/admin/articles', { params });
    return response;
  },

  async getAdminArticleById(id) {
    const response = await api.get(`/admin/articles/${id}`);
    return response.data;
  },

  async createArticle(data) {
    // data: { title, description, drive_url, status, slug }
    const response = await api.post('/admin/articles', data);
    return response.data;
  },

  async updateArticle(id, data) {
    const response = await api.put(`/admin/articles/${id}`, data);
    return response.data;
  },

  async deleteArticle(id) {
    const response = await api.delete(`/admin/articles/${id}`);
    return response.data;
  },

  async publishArticle(id) {
    const response = await api.post(`/admin/articles/${id}/publish`);
    return response.data;
  },

  async unpublishArticle(id) {
    const response = await api.post(`/admin/articles/${id}/unpublish`);
    return response.data;
  },

  async uploadCover(id, file) {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await api.post(`/admin/articles/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCover(id) {
    const response = await api.delete(`/admin/articles/${id}/cover`);
    return response.data;
  },
};

export default articleService;
