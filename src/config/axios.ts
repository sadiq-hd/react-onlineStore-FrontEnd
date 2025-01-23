import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface ErrorResponse {
  message?: string;
  data?: {
    message?: string;
  }
}

const api = axios.create({
  baseURL: 'https://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }

    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network Error:', error);
      throw new Error('فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك.');
    }

    const errorMessage = error.response?.data?.message || 'حدث خطأ ما';
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: originalRequest?.url
    });

    return Promise.reject(error);
  }
);

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  return !!(token && currentUser);
};

export default api;