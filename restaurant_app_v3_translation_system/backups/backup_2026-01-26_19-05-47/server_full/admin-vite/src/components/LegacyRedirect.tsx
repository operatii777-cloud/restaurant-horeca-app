// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Component pentru redirect către pagini legacy HTML
 */

import { useEffect } from 'react';

interface LegacyRedirectProps {
  url: string;
}


export const LegacyRedirect: React.FC<LegacyRedirectProps> = ({ url }) => {
  useEffect(() => {
    // Add iframe parameter to hide navigation menu when accessed from admin-vite
    const separator = url.includes('?') ? '&' : '?';
    const urlWithIframe = `${url}${separator}iframe=true`;

    // Dacă URL-ul începe cu /, construiește URL-ul complet pentru backend
    let finalUrl = urlWithIframe;
    if (urlWithIframe.startsWith('/')) {
      // Detectează automat backend URL (port 3001) din window.location
      // Dacă suntem pe localhost:5173, backend-ul este pe localhost:3001
      const currentHost = window.location.hostname;
      const backendPort = '3001';
      finalUrl = `http://${currentHost}:${backendPort}${urlWithIframe}`;
    }

    // Redirect către URL-ul legacy cu parametrul iframe
    window.location.href = finalUrl;
  }, [url]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px',
      fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se redirecționează...</span>
        </div>
        <p className="mt-3">Se redirecționează către pagina veche...</p>
      </div>
    </div>
  );
};



