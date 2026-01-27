/**
 * AdminPageShell - Container principal pentru toate paginile Admin-Vite
 * Boogit-like: compact, zero spații goale, padding strict 16px
 */

import React, { ReactNode } from 'react';
import './AdminPageShell.css';

export interface AdminPageShellProps {
  children: ReactNode;
  className?: string;
}

export const AdminPageShell: React.FC<AdminPageShellProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`admin-page-shell ${className}`}>
      {children}
    </div>
  );
};

