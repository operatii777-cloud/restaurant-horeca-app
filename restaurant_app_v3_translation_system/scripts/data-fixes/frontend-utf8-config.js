
// ============================================================================
// CONFIGURARE ENCODING UTF-8 PENTRU FRONTEND
// Salvează ca: src/services/api.js
// ============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
  },
  transformResponse: [(data) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return data;
  }],
});

// Interceptor pentru logging (opțional)
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    return Promise.reject(error);
  }
);

export default api;

// ============================================================================
// FOLOSIRE ÎN COMPONENTE:
// ============================================================================
// import api from './services/api';
// 
// const { data } = await api.get('/comenzi');
// const { data } = await api.post('/produse', { denumire: 'Cafea' });
