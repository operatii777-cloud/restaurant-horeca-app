/**
 * 🌐 API Client pentru toate modulele React
 * 
 * Centralizează toate requests către backend-ul Node.js
 * Include: authentication, error handling, retry logic
 */

import axios from 'axios';

// Base URL - în producție se adaptează automat
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Creează instanța Axios configurată
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secunde timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pentru Request - adaugă token dacă există
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🌐 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor pentru Response - handle errors global
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      console.error(`❌ API Error [${status}]:`, data);
      
      if (status === 401) {
        // Unauthorized - redirect to login
        console.warn('🔒 Unauthorized - clearing token');
        localStorage.removeItem('adminToken');
        // Poți adăuga redirect către login aici
      }
    } else if (error.request) {
      // Request made but no response
      console.error('❌ Network Error: No response from server');
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 🧩 API Endpoints - toate routes organizate pe module
 */
export const API = {
  // 🥕 INGREDIENTE
  ingredients: {
    getAll: () => apiClient.get('/api/ingredients'),
    getById: (id) => apiClient.get(`/api/ingredients/${id}`),
    create: (data) => apiClient.post('/api/ingredients', data),
    update: (id, data) => apiClient.put(`/api/ingredients/${id}`, data),
    delete: (id) => apiClient.delete(`/api/ingredients/${id}`),
    hide: (id) => apiClient.patch(`/api/ingredients/${id}/hide`),
    restore: (id) => apiClient.patch(`/api/ingredients/${id}/restore`),
    bulkUpdate: (updates) => apiClient.post('/api/ingredients/bulk-update', { updates }),
    export: () => apiClient.get('/api/ingredients/export', { responseType: 'blob' }),
  },

  // 🌾 ALERGENI
  allergens: {
    getAll: () => apiClient.get('/api/allergens'),
    getById: (id) => apiClient.get(`/api/allergens/${id}`),
    create: (data) => apiClient.post('/api/allergens', data),
    update: (id, data) => apiClient.put(`/api/allergens/${id}`, data),
    delete: (id) => apiClient.delete(`/api/allergens/${id}`),
  },

  // 📦 STOCURI
  stocks: {
    getAll: () => apiClient.get('/api/stocks'),
    getById: (id) => apiClient.get(`/api/stocks/${id}`),
    getByIngredient: (ingredientId) => apiClient.get(`/api/stocks/ingredient/${ingredientId}`),
    getHistory: (ingredientId, days = 30) => apiClient.get(`/api/stocks/history/${ingredientId}?days=${days}`),
    getLowStock: () => apiClient.get('/api/stocks/alerts/low'),
    update: (id, data) => apiClient.put(`/api/stocks/${id}`, data),
    adjust: (ingredientId, quantity, reason) => apiClient.post('/api/stocks/adjust', {
      ingredient_id: ingredientId,
      quantity,
      reason,
    }),
  },

  // 🎫 CATALOG PRODUSE
  products: {
    getAll: () => apiClient.get('/api/catalog/products'),
    getById: (id) => apiClient.get(`/api/catalog/products/${id}`),
    getByCategory: (categoryId) => apiClient.get(`/api/catalog/products?category=${categoryId}`),
    create: (data) => apiClient.post('/api/catalog/products', data),
    update: (id, data) => apiClient.put(`/api/catalog/products/${id}`, data),
    delete: (id) => apiClient.delete(`/api/catalog/products/${id}`),
    bulkUpdatePrices: (updates) => apiClient.post('/api/catalog/products/bulk-prices', { updates }),
    bulkUpdateVAT: (updates) => apiClient.post('/api/catalog/products/bulk-vat', { updates }),
    uploadImage: (id, formData) => apiClient.post(`/api/catalog/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    clone: (id) => apiClient.post(`/api/catalog/products/${id}/clone`),
  },

  // 📖 REȚETE (FTP)
  recipes: {
    getAll: () => apiClient.get('/api/recipes/all'),
    getById: (id) => apiClient.get(`/api/recipes/${id}`),
    getByProduct: (productId) => apiClient.get(`/api/recipes/product/${productId}`),
    create: (data) => apiClient.post('/api/recipes', data),
    update: (id, data) => apiClient.put(`/api/recipes/${id}`, data),
    delete: (id) => apiClient.delete(`/api/recipes/${id}`),
    save: (productId, data) => apiClient.put(`/api/recipes/product/${productId}`, data),
    calculateCost: (productId) => apiClient.get(`/api/recipes/suggested-price/${productId}`),
    validate: (id) => apiClient.get(`/api/recipes/${id}/validate`),
  },

  // 📄 FIȘE TEHNICE
  productSheets: {
    getAll: () => apiClient.get('/api/product-sheets'),
    getById: (id) => apiClient.get(`/api/product-sheets/${id}`),
    getByProduct: (productId) => apiClient.get(`/api/product-sheets/product/${productId}`),
    generate: (productId) => apiClient.post('/api/product-sheets/generate', { product_id: productId }),
    downloadPDF: (id) => apiClient.get(`/api/product-sheets/${id}/pdf`, { responseType: 'blob' }),
    update: (id, data) => apiClient.put(`/api/product-sheets/${id}`, data),
    save: (productId, data) => apiClient.post('/api/product-sheets', { product_id: productId, ...data }),
  },
  
  // Alias pentru compatibilitate (fise-tehnice module uses this)
  technicalSheets: {
    save: (productId, data) => apiClient.post('/api/product-sheets', { product_id: productId, ...data }),
  },

  // 🗂️ CATEGORII
  categories: {
    getAll: () => apiClient.get('/api/catalog/categories'),
    getTree: () => apiClient.get('/api/catalog/categories/tree'),
  },
};

export default apiClient;

