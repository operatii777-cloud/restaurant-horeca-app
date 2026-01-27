/**
 * AdminEmptyState - Empty state compact
 */

import React from 'react';
import './AdminStates.css';

export interface AdminEmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="admin-state admin-state--empty">
      <div className="admin-state__icon">📭</div>
      <h3 className="admin-state__title">{title}</h3>
      {message && <p className="admin-state__message">{message}</p>}
      {actionLabel && onAction && (
        <button className="admin-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

