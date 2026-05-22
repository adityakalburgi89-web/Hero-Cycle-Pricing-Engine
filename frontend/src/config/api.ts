import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Get API base URL from Vite Env or default to localhost,
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Inject auth token or other headers here if needed in future
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('⚠️ API Request Error Interceptor:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Strip HTTP metadata and return data payload directly
    return response.data;
  },
  (error: AxiosError) => {
    const errorResponse = error.response?.data as {
      success: boolean;
      statusCode?: number;
      message?: string;
      errors?: any[];
    } | undefined;

    const customError = {
      message: errorResponse?.message || 'A network error occurred. Please try again.',
      statusCode: error.response?.status || 500,
      errors: errorResponse?.errors || [],
      originalError: error,
    };

    console.error('❌ API Response Error Interceptor:', customError);

    // Global hooks like logouts on 401 or notification triggers can go here,
    return Promise.reject(customError);
  }
);
