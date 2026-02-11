// import { useTranslation } from '@/i18n/I18nContext';
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

  // FAZA MT.4 - Add location header if available
  const currentLocationId = localStorage.getItem('currentLocationId');
  if (currentLocationId) {
    config.headers['X-Location-ID'] = currentLocationId;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nu logăm erorile 404 sau 400 (așteptate în unele cazuri)
    const status = error?.response?.status;
    const isExpectedError = status === 404 || status === 400;

    if (!isExpectedError) {
      // Logăm doar erorile neașteptate
      console.error('API error', error);
    }

    return Promise.reject(error);
  },
);
