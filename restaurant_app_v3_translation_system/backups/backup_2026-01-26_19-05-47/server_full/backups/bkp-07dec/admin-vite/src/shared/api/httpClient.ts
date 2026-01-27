import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('restaurant_app_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: integrare centralizată toast/notificări
    console.error('API error', error);
    return Promise.reject(error);
  },
);
