import api from './api';

const authService = {
  async login(email, password) {
    const payload = { email, password };
    const response = await api.post('/auth/login', payload);
    // Remember response interceptor already returns `response.data`
    // which corresponds to the inner `{ access_token, user, profile, ... }` block
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
