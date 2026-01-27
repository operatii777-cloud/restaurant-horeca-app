/**
 * AdminPageFooter - Footer compact pentru paginile Admin-Vite
 */

import React, { ReactNode } from 'react';
import './AdminPageFooter.css';

export interface AdminPageFooterProps {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export const AdminPageFooter: React.FC<AdminPageFooterProps> = ({
  left,
  right = 'Restaurant App V3 powered by QrOMS',
  className = '',
}) => {
  return (
    <footer className={`admin-page-footer ${className}`}>
      {left && <div className="admin-page-footer__left">{left}</div>}
      {right && <div className="admin-page-footer__right">{right}</div>}
    </footer>
  );
};

