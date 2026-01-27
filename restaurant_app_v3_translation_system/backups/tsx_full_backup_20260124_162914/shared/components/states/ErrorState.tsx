// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Error State Component - Error display with retry
 */

import React from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './ErrorState.css';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onCopyDebug?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Eroare',
  message = 'A apărut o eroare la încărcarea datelor.',
  onRetry,
  onCopyDebug,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`error-state ${className}`}>
      <div className="error-state__icon" style={{ color: theme.danger }}>
        ⚠️
      </div>
      <h3 className="error-state__title" style={{ color: theme.text }}>
        {title}
      </h3>
      {message && (
        <p className="error-state__message" style={{ color: theme.textMuted }}>
          {message}
        </p>
      )}
      <div className="error-state__actions">
        {onRetry && (
          <button
            type="button"
            className="error-state__retry"
            onClick={onRetry}
            style={{
              background: theme.accent,
              color: '#fff',
              border: 'none',
            }}
          >"Reîncearcă"</button>
        )}
        {onCopyDebug && (
          <button
            type="button"
            className="error-state__copy"
            onClick={onCopyDebug}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >"copiaza debug"</button>
        )}
      </div>
    </div>
  );
};




