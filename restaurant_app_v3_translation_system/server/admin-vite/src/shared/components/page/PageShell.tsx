/**
 * Page Shell Component - Premium UI Pattern
 * Complete page layout with header, toolbar, content, and footer
 */

import React from 'react';
import { PageHeader, type PageHeaderProps } from './PageHeader';
import { PageToolbar, type PageToolbarProps } from './PageToolbar';
import { PageFooter, type PageFooterProps } from './PageFooter';
import { useTheme } from '@/shared/context/ThemeContext';
import './PageShell.css';

export interface PageShellProps {
  header?: PageHeaderProps;
  toolbar?: PageToolbarProps;
  footer?: PageFooterProps;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  header,
  toolbar,
  footer,
  children,
  className = '',
  contentClassName = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`page-shell ${className}`}
      style={{
        background: theme.bgSolid,
        color: theme.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {header && <PageHeader {...header} />}
      {toolbar && <PageToolbar {...toolbar} />}
      <div
        className={`page-shell__content ${contentClassName}`}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "Auto",
        }}
      >
        {children}
      </div>
      {footer && <PageFooter {...footer} />}
    </div>
  );
};

