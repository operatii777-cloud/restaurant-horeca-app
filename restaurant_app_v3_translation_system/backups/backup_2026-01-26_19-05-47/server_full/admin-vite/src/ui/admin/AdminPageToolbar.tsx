/**
 * AdminPageToolbar - Toolbar compact 64px pentru filtre și acțiuni
 * Boogit-like: toolbar deasupra gridului, acțiuni clare
 */

import React, { ReactNode } from 'react';
import './AdminPageToolbar.css';

export interface AdminPageToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  primaryActions?: ReactNode;
  secondaryActions?: ReactNode;
  className?: string;
}

export const AdminPageToolbar: React.FC<AdminPageToolbarProps> = ({
  search,
  filters,
  primaryActions,
  secondaryActions,
  className = '',
}) => {
  return (
    <div className={`admin-page-toolbar ${className}`}>
      <div className="admin-page-toolbar__left">
        {search && (
          <div className="admin-page-toolbar__search">
            {search}
          </div>
        )}
        {filters && (
          <div className="admin-page-toolbar__filters">
            {filters}
          </div>
        )}
      </div>
      <div className="admin-page-toolbar__right">
        {secondaryActions && (
          <div className="admin-page-toolbar__secondary">
            {secondaryActions}
          </div>
        )}
        {primaryActions && (
          <div className="admin-page-toolbar__primary">
            {primaryActions}
          </div>
        )}
      </div>
    </div>
  );
};

