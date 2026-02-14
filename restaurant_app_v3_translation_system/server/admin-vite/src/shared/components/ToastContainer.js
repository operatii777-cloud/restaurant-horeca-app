"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * TOAST CONTAINER - Windows Style
 * Container pentru toast notifications
 * Windows Fluent Design inspired
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
require("./ToastContainer.css");
var ToastContainer = function (_a) {
    var toasts = _a.toasts, onRemove = _a.onRemove;
    //   const { t } = useTranslation();
    if (toasts.length === 0)
        return null;
    var getToastStyles = function (type) {
        var baseStyles = {
            padding: '12px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'Segoe UI, system-ui, sans-serif',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '500px',
            animation: 'toast-slide-in 0.3s ease-out',
        };
        var typeStyles = {
            success: {
                backgroundColor: '#107c10',
                color: '#ffffff',
            },
            error: {
                backgroundColor: '#d13438',
                color: '#ffffff',
            },
            warning: {
                backgroundColor: '#ff8c00',
                color: '#ffffff',
            },
            info: {
                backgroundColor: '#0078d4',
                color: '#ffffff',
            },
        };
        return __assign(__assign({}, baseStyles), typeStyles[type]);
    };
    return (<div className="toast-container" role="region" aria-label="Notificări" aria-live="polite" aria-atomic="false">
      {toasts.map(function (toast) { return (<div key={toast.id} className="toast" style={getToastStyles(toast.type)} onClick={function () { return onRemove(toast.id); }} role="alert" aria-live="polite" aria-atomic="true">
          <span>{toast.message}</span>
          <button onClick={function (e) {
                e.stopPropagation();
                onRemove(toast.id);
            }} className="toast-close-btn" aria-label="Închide">
            ×
          </button>
        </div>); })}
      <style>{"\n        @keyframes toast-slide-in {\n          from {\n            transform: translateX(100%);\n            opacity: 0;\n          }\n          to {\n            transform: translateX(0);\n            opacity: 1;\n          }\n        }\n      "}</style>
    </div>);
};
exports.default = ToastContainer;
