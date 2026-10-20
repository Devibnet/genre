import api from './api';

const quizService = {
  // Public APIs
  async getPublicQuizzes(params = {}) {
    const response = await api.get('/quizzes', { params });
    return response;
  },

  async getPublicQuizById(id) {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  async getPublicQuizQuestions(id) {
    const response = await api.get(`/quizzes/${id}/questions`);
    return response.data;
  },

  async submitQuiz(id, answers, participantName = 'Peserta Mandiri') {
    // answers: [{ question_id, option_id }]
    const response = await api.post(`/quizzes/${id}/submit`, {
      answers,
      participant_name: participantName || 'Peserta Mandiri',
    });
    return response.data;
  },

  // Admin Quiz Submissions & Results APIs
  async getQuizResults(quizId, params = {}) {
    const response = await api.get(`/admin/quizzes/${quizId}/results`, { params });
    return response;
  },

  async getQuizResultStats(quizId) {
    const response = await api.get(`/admin/quizzes/${quizId}/results/stats`);
    return response.data;
  },

  async deleteQuizSubmission(submissionId) {
    const response = await api.delete(`/admin/quiz-submissions/${submissionId}`);
    return response.data;
  },

  // Admin Quizzes APIs
  async getAdminQuizzes(params = {}) {
    const response = await api.get('/admin/quizzes', { params });
    return response;
  },

  async getAdminQuizById(id) {
    const response = await api.get(`/admin/quizzes/${id}`);
    return response.data;
  },

  async createQuiz(data) {
    // data: { title, description, article_id, thumbnail_url, duration, status }
    const response = await api.post('/admin/quizzes', data);
    return response.data;
  },

  async updateQuiz(id, data) {
    const response = await api.put(`/admin/quizzes/${id}`, data);
    return response.data;
  },

  async deleteQuiz(id) {
    const response = await api.delete(`/admin/quizzes/${id}`);
    return response.data;
  },

  async publishQuiz(id) {
    const response = await api.post(`/admin/quizzes/${id}/publish`);
    return response.data;
  },

  async unpublishQuiz(id) {
    const response = await api.post(`/admin/quizzes/${id}/unpublish`);
    return response.data;
  },

  // Admin Questions APIs
  async createQuestion(quizId, data) {
    // data: { question, explanation, order_number }
    const response = await api.post(`/admin/quizzes/${quizId}/questions`, data);
    return response.data;
  },

  async updateQuestion(questionId, data) {
    const response = await api.put(`/admin/questions/${questionId}`, data);
    return response.data;
  },

  async deleteQuestion(questionId) {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  },

  // Admin Options APIs
  async createOption(questionId, data) {
    // data: { option_text, is_correct, order_number }
    const response = await api.post(`/admin/questions/${questionId}/options`, data);
    return response.data;
  },

  async updateOption(optionId, data) {
    const response = await api.put(`/admin/options/${optionId}`, data);
    return response.data;
  },

  async deleteOption(optionId) {
    const response = await api.delete(`/admin/options/${optionId}`);
    return response.data;
  },
};

export default quizService;
