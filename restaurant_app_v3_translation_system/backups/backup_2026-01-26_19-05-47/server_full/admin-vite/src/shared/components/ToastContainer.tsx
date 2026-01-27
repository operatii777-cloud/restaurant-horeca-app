// import { useTranslation } from '@/i18n/I18nContext';
/**
 * TOAST CONTAINER - Windows Style
 * Container pentru toast notifications
 * Windows Fluent Design inspired
 */

import React from 'react';
import type { Toast } from '../hooks/useToast';
import './ToastContainer.css';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
//   const { t } = useTranslation();
  if (toasts.length === 0) return null;

  const getToastStyles = (type: Toast['type']) => {
    const baseStyles: React.CSSProperties = {
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

    const typeStyles = {
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

    return { ...baseStyles, ...typeStyles[type] };
  };

  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notificări"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast"
          style={getToastStyles(toast.type)}
          onClick={() => onRemove(toast.id)}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{toast.message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(toast.id);
            }}
            className="toast-close-btn"
            aria-label="Închide"
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;



