/**
 * Premium Table Page Component
 * Pattern premium pentru pagini cu tabele (inspirat din imagini)
 * Include: Header modern, Toolbar cu search/filtre, Grid, Footer cu totaluri
 */

import React, { ReactNode } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './PremiumTablePage.css';

export interface PremiumTablePageProps {
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const PremiumTablePage: React.FC<PremiumTablePageProps> = ({
  title,
  subtitle,
  headerActions,
  toolbar,
  children,
  footer,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`premium-table-page ${className}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section - Modern, clean, cu acțiuni */}
      <div
        className="premium-table-page__header"
        style={{
          padding: '24px 32px',
          background: theme.surface,
          borderBottom: `1px solid ${theme.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: theme.text,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '14px',
                color: theme.textMuted,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {headerActions && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {headerActions}
          </div>
        )}
      </div>

      {/* Toolbar Section - Search + Filters */}
      {toolbar && (
        <div
          className="premium-table-page__toolbar"
          style={{
            padding: '16px 32px',
            background: theme.surfaceLight,
            borderBottom: `1px solid ${theme.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {toolbar}
        </div>
      )}

      {/* Content Section - Grid */}
      <div
        className="premium-table-page__content"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          background: theme.bgSolid,
        }}
      >
        {children}
      </div>

      {/* Footer Section - Totaluri + Branding */}
      {footer && (
        <div
          className="premium-table-page__footer"
          style={{
            padding: '16px 32px',
            background: theme.surface,
            borderTop: `1px solid ${theme.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

