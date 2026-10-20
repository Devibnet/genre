import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => {
    return response.data; // Return data block directly for ease of use
  },
  (error) => {
    const originalRequest = error.config;
    const response = error.response;

    let errorMessage = 'Terjadi kesalahan sistem.';
    let errorCode = 'UNKNOWN_ERROR';
    let details = null;

    if (response) {
      const data = response.data || {};
      errorMessage = data.message || errorMessage;
      
      if (data.error) {
        errorCode = data.error.code || errorCode;
        details = data.error.details || null;
      } else if (data.details) {
        details = data.details;
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // Dispatch custom logout event if we need to sync AuthContext state
        window.dispatchEvent(new Event('auth_logout'));
        errorMessage = errorMessage || 'Sesi Anda telah berakhir. Silakan login kembali.';
      }
      
      // Handle 403 Forbidden
      if (response.status === 403) {
        errorMessage = errorMessage || 'Anda tidak memiliki hak akses untuk halaman ini.';
      }
    } else {
      // Network Error
      errorMessage = 'Tidak dapat terhubung ke server. Pastikan koneksi internet atau server aktif.';
      errorCode = 'NETWORK_ERROR';
    }

    const customError = new Error(errorMessage);
    customError.status = response ? response.status : 0;
    customError.code = errorCode;
    customError.details = details;

    return Promise.reject(customError);
  }
);

export default api;
