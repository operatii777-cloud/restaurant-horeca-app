// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AdminDrawer - Drawer detalii în dreapta
 * Boogit-like: drawer pentru detalii, acțiuni rapide
 */

import React, { ReactNode, useEffect } from 'react';
import './AdminDrawer.css';

export interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
  className?: string;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  width = 420,
  className = '',
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="admin-drawer__backdrop" onClick={onClose} />
      <div
        className={`admin-drawer ${className}`}
        style={{ width: `${width}px` }}
      >
        <div className="admin-drawer__header">
          <h2 className="admin-drawer__title">{title}</h2>
          <button
            className="admin-drawer__close"
            onClick={onClose}
            aria-label="Închide"
          >
            ×
          </button>
        </div>
        <div className="admin-drawer__body">
          {children}
        </div>
      </div>
    </>
  );
};



