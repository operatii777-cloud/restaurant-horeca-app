/**
 * Page Footer Component - Premium UI Pattern
 * Summary totals, pagination, and branding
 */

import React from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './PageFooter.css';

export interface PageFooterProps {
  summary?: React.ReactNode;
  pagination?: React.ReactNode;
  branding?: boolean;
  className?: string;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  summary,
  pagination,
  branding = true,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`page-footer ${className}`}
      style={{
        background: theme.surfaceLight,
        borderTop: `1px solid ${theme.borderLight}`,
      }}
    >
      <div className="page-footer__content">
        {summary && <div className="page-footer__summary">{summary}</div>}
        <div className="page-footer__right">
          {pagination && <div className="page-footer__pagination">{pagination}</div>}
          {branding && (
            <div className="page-footer__branding" style={{ color: theme.textMuted }}>
              Restaurant App V3 powered by QrOMS
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

