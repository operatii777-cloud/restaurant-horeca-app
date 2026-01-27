/**
 * Loading State Component - Skeleton loading
 */

import React from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './LoadingState.css';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Se încarcă...',
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`loading-state ${className}`} style={{ color: theme.textMuted }}>
      <div className="loading-state__spinner" style={{ borderColor: theme.border }}>
        <div style={{ borderTopColor: theme.accent }} />
      </div>
      {message && <p className="loading-state__message">{message}</p>}
    </div>
  );
};

