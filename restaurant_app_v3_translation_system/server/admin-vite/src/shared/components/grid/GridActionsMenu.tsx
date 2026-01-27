// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Grid Actions Menu - Premium 3-dot menu for row actions
 * Pattern din imagini: meniu dropdown cu acțiuni (View, Edit, Delete, etc.)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import './GridActionsMenu.css';

export interface GridAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: "Default" | 'danger' | 'warning' | 'success';
  disabled?: boolean;
}

export interface GridActionsMenuProps {
  actions: GridAction[];
  className?: string;
}

export const GridActionsMenu: React.FC<GridActionsMenuProps> = ({ actions, className = '' }) => {
//   const { t } = useTranslation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getActionColor = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return theme.danger;
      case 'warning':
        return theme.warning;
      case 'success':
        return theme.success;
      default:
        return theme.text;
    }
  };

  return (
    <div className={`grid-actions-menu ${className}`} ref={menuRef}>
      <button
        type="button"
        className="grid-actions-menu__trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: theme.text,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
        }}
        title="Acțiuni"
      >
        ⋯
      </button>

      {isOpen && (
        <div
          className="grid-actions-menu__dropdown"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 4px 12px ${theme.shadowColor}`,
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              className={`grid-actions-menu__action ${action.disabled ? 'grid-actions-menu__action--disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!action.disabled) {
                  action.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={action.disabled}
              style={{
                color: action.disabled ? theme.textMuted : getActionColor(action.variant),
                opacity: action.disabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!action.disabled) {
                  e.currentTarget.style.background = theme.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {action.icon && <span className="grid-actions-menu__icon">{action.icon}</span>}
              <span className="grid-actions-menu__label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};



