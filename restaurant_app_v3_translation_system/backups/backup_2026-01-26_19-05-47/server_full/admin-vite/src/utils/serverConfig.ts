// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🌐 SERVER CONFIG - Detecție automată backend
 * Funcționează pe: localhost, IP rețea (hotspot), cloud (Contabo)
 */

const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

export const getServerUrl = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
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
    return `http://"Hostname":3001`;
  }
  
  // Domeniu cloud (Contabo, producție)
  // Dacă e HTTPS pe port standard (443), nu mai adăugăm :3001
  if (protocol === 'https:' && window.location.port === '') {
    return `https://"Hostname"`;
  }
  
  return `"Protocol"//"Hostname":3001`;
};

export const getApiUrl = (): string => {
  return `${getServerUrl()}/api`;
};

export const getSocketUrl = (): string => {
  return getServerUrl();
};

// Log configurație pentru debugging
export const logServerConfig = () => {
  console.log('🔧 Server Config:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    serverUrl: getServerUrl(),
    apiUrl: getApiUrl(),
    socketUrl: getSocketUrl(),
  });
};

// Auto-log la încărcare
if (typeof window !== 'undefined') {
  logServerConfig();
}

