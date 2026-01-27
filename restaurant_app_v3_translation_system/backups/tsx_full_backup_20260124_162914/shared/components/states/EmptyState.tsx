/**
 * Empty State Component - No data available
 */

import React from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './EmptyState.css';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nu există date',
  message = 'Nu s-au găsit înregistrări.',
  actionLabel,
  onAction,
  icon = '📭',
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__icon" style={{ color: theme.textMuted }}>
        {icon}
      </div>
      <h3 className="empty-state__title" style={{ color: theme.text }}>
        {title}
      </h3>
      {message && (
        <p className="empty-state__message" style={{ color: theme.textMuted }}>
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          className="empty-state__action"
          onClick={onAction}
          style={{
            background: theme.accent,
            color: '#fff',
            border: 'none',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

