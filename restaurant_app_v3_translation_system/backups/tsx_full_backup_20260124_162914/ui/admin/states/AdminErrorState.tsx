// import { useTranslation } from '@/i18n/I18nContext';
/**
 * AdminErrorState - Error state compact
 */

import React from 'react';
import './AdminStates.css';

export interface AdminErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title = 'Eroare',
  message,
  onRetry,
}) => {
  return (
    <div className="admin-state admin-state--error">
      <div className="admin-state__icon">⚠️</div>
      <h3 className="admin-state__title">{title}</h3>
      <p className="admin-state__message">{message}</p>
      {onRetry && (
        <button className="admin-state__action" onClick={onRetry}>"Reîncearcă"</button>
      )}
    </div>
  );
};



