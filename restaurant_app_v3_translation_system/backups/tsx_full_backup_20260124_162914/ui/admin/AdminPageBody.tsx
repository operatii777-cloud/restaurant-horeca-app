/**
 * AdminPageBody - Container pentru conținutul principal
 */

import React, { ReactNode } from 'react';
import './AdminPageBody.css';

export interface AdminPageBodyProps {
  children: ReactNode;
  className?: string;
}

export const AdminPageBody: React.FC<AdminPageBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`admin-page-body ${className}`}>
      {children}
    </div>
  );
};

