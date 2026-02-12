"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpClient = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var axios_1 = require("axios");
var API_BASE_URL = (_a = import.meta.env.VITE_API_URL) !== null && _a !== void 0 ? _a : 'http://localhost:3001';
exports.httpClient = axios_1.default.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15000,
});
exports.httpClient.interceptors.request.use(function (config) {
    var token = localStorage.getItem('restaurant_app_token');
    if (token) {
        config.headers.Authorization = "Bearer ".concat(token);
    }
    // FAZA MT.4 - Add location header if available
    var currentLocationId = localStorage.getItem('currentLocationId');
    if (currentLocationId) {
        config.headers['X-Location-ID'] = currentLocationId;
    }
    return config;
});
exports.httpClient.interceptors.response.use(function (response) { return response; }, function (error) {
    var _a;
    // Nu logăm erorile 404 sau 400 (așteptate în unele cazuri)
    var status = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
    var isExpectedError = status === 404 || status === 400;
    if (!isExpectedError) {
        // Logăm doar erorile neașteptate
        console.error('API error', error);
    }
    return Promise.reject(error);
});
