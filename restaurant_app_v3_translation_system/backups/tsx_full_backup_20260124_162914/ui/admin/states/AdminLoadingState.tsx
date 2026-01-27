/**
 * AdminLoadingState - Loading state compact
 */

import React from 'react';
import './AdminStates.css';

export interface AdminLoadingStateProps {
  message?: string;
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message = 'Se încarcă...',
}) => {
  return (
    <div className="admin-state admin-state--loading">
      <div className="admin-state__spinner" />
      <p className="admin-state__message">{message}</p>
    </div>
  );
};

