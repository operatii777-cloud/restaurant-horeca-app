/**
 * Page Toolbar Component - Premium UI Pattern
 * Search input, filters, and quick actions
 */

import React from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './PageToolbar.css';

export interface PageToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onClearFilters?: () => void;
  className?: string;
}

export const PageToolbar: React.FC<PageToolbarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Caută...',
  filters,
  actions,
  onClearFilters,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`page-toolbar ${className}`}
      style={{
        background: theme.surfaceLight,
        borderBottom: `1px solid ${theme.borderLight}`,
      }}
    >
      <div className="page-toolbar__content">
        {/* Search */}
        {onSearchChange && (
          <div className="page-toolbar__search">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="page-toolbar__search-input"
              style={{
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                color: theme.text,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
            />
          </div>
        )}

        {/* Filters */}
        {filters && <div className="page-toolbar__filters">{filters}</div>}

        {/* Actions */}
        <div className="page-toolbar__actions">
          {actions}
          {onClearFilters && (
            <button
              type="button"
              className="page-toolbar__clear-btn"
              onClick={onClearFilters}
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              Reset filtre
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

