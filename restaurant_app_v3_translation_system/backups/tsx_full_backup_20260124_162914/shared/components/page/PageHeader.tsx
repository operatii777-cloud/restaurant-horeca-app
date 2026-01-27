/**
 * Page Header Component - Premium UI Pattern
 * Sticky header with title, breadcrumbs, status badge, and primary actions
 */

import React from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './PageHeader.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  statusBadge?: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | "Default" };
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  statusBadge,
  actions,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`page-header ${className}`}
      style={{
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className="page-header__content">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="page-header__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.path ? (
                  <a
                    href={crumb.path}
                    className="page-header__breadcrumb-link"
                    style={{ color: theme.textMuted }}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="page-header__breadcrumb-text" style={{ color: theme.textMuted }}>
                    {crumb.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="page-header__breadcrumb-separator" style={{ color: theme.textMuted }}>
                    /
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title and Subtitle */}
        <div className="page-header__title-section">
          <div>
            <h1 className="page-header__title" style={{ color: theme.text }}>
              {title}
            </h1>
            {subtitle && (
              <p className="page-header__subtitle" style={{ color: theme.textMuted }}>
                {subtitle}
              </p>
            )}
          </div>
          {statusBadge && (
            <span
              className={`page-header__badge page-header__badge--${statusBadge.variant}`}
              style={{
                background:
                  statusBadge.variant === 'success'
                    ? theme.success
                    : statusBadge.variant === 'warning'
                    ? theme.warning
                    : statusBadge.variant === 'danger'
                    ? theme.danger
                    : statusBadge.variant === 'info'
                    ? theme.info
                    : theme.surfaceLight,
                color: '#fff',
              }}
            >
              {statusBadge.label}
            </span>
          )}
        </div>

        {/* Actions */}
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
};

