import api from './api';

const homeService = {
  async getHomeData() {
    const response = await api.get('/home');
    return response.data;
  },
};

export default homeService;
