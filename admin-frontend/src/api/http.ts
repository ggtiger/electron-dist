import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse } from '@/types';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const data = response.data;
    if (data.success) {
      return response;
    }
    // Handle API error
    const message = data.error?.message || 'Request failed';
    ElMessage.error(message);
    return Promise.reject(new Error(message));
  },
  (error: AxiosError<ApiResponse>) => {
    let message = 'Network error';

    if (error.response) {
      const { status, data } = error.response;
      message = data?.error?.message || `Error: ${status}`;

      switch (status) {
        case 401:
          message = 'Unauthorized, please login';
          localStorage.removeItem('token');
          break;
        case 403:
          message = 'Access denied';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 500:
          message = 'Server error';
          break;
      }
    }

    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default http;
