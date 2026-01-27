/**
 * AdminPageHeader - Header compact 72px pentru paginile Admin-Vite
 * Boogit-like: densitate maximă, acțiuni clare
 */

import React, { ReactNode } from 'react';
import './AdminPageHeader.css';

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle = 'Restaurant App V3 powered by QrOMS',
  actions,
  className = '',
}) => {
  return (
    <header className={`admin-page-header ${className}`}>
      <div className="admin-page-header__content">
        <div className="admin-page-header__text">
          <h1 className="admin-page-header__title">{title}</h1>
          {subtitle && (
            <p className="admin-page-header__subtitle">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="admin-page-header__actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

