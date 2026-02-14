"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🌐 SERVER CONFIG - Detecție automată backend
 * Funcționează pe: localhost, IP rețea (hotspot), cloud (Contabo)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logServerConfig = exports.getSocketUrl = exports.getApiUrl = exports.getServerUrl = void 0;
var ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
var getServerUrl = function () {
    var hostname = window.location.hostname;
    var protocol = window.location.protocol;
    // Override manual din variabilă de mediu (opțional)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '');
    }
    // Localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    // IP rețea (hotspot, prezentare)
    if (ipRegex.test(hostname)) {
        return "http://\"Hostname\":3001";
    }
    // Domeniu cloud (Contabo, producție)
    // Dacă e HTTPS pe port standard (443), nu mai adăugăm :3001
    if (protocol === 'https:' && window.location.port === '') {
        return "https://\"Hostname\"";
    }
    return "\"Protocol\"//\"Hostname\":3001";
};
exports.getServerUrl = getServerUrl;
var getApiUrl = function () {
    return "".concat((0, exports.getServerUrl)(), "/api");
};
exports.getApiUrl = getApiUrl;
var getSocketUrl = function () {
    return (0, exports.getServerUrl)();
};
exports.getSocketUrl = getSocketUrl;
// Log configurație pentru debugging
var logServerConfig = function () {
    console.log('🔧 Server Config:', {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port,
        serverUrl: (0, exports.getServerUrl)(),
        apiUrl: (0, exports.getApiUrl)(),
        socketUrl: (0, exports.getSocketUrl)(),
    });
};
exports.logServerConfig = logServerConfig;
// Auto-log la încărcare
if (typeof window !== 'undefined') {
    (0, exports.logServerConfig)();
}
