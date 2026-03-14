import axios, { type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3232';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('access_token');
    if (token) {
      return {
        ...config,
        headers: config.headers.set('Authorization', `Bearer ${token}`),
      };
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof error === 'object'
      && error !== null
      && 'response' in error
      && (error as { response?: { status?: number } }).response?.status === 401
    ) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
