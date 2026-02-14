"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Component pentru redirect către pagini legacy HTML
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyRedirect = void 0;
var react_1 = require("react");
var LegacyRedirect = function (_a) {
    var url = _a.url;
    (0, react_1.useEffect)(function () {
        // Add iframe parameter to hide navigation menu when accessed from admin-vite
        var separator = url.includes('?') ? '&' : '?';
        var urlWithIframe = "".concat(url).concat(separator, "iframe=true");
        // Dacă URL-ul începe cu /, construiește URL-ul complet pentru backend
        var finalUrl = urlWithIframe;
        if (urlWithIframe.startsWith('/')) {
            // Detectează automat backend URL (port 3001) din window.location
            // Dacă suntem pe localhost:5173, backend-ul este pe localhost:3001
            var currentHost = window.location.hostname;
            var backendPort = '3001';
            finalUrl = "http://".concat(currentHost, ":").concat(backendPort).concat(urlWithIframe);
        }
        // Redirect către URL-ul legacy cu parametrul iframe
        window.location.href = finalUrl;
    }, [url]);
    return (<div style={{
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
    </div>);
};
exports.LegacyRedirect = LegacyRedirect;
