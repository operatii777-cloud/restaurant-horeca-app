// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Theme Switcher Component
 * Dropdown menu for selecting theme
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { themes, type ThemeName } from '../themes/themes';
import './ThemeSwitcher.css';

export const ThemeSwitcher: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
//   const { t } = useTranslation();
  const { theme, themeName, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const sizeClasses = {
    sm: 'theme-switcher--sm',
    md: 'theme-switcher--md',
    lg: 'theme-switcher--lg',
  };

  const getThemeIcon = (name: ThemeName): string => {
    switch (name) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'blue':
        return '🔵';
      case 'green':
        return '🟢';
      case 'purple':
        return '🟣';
      case 'orange':
        return '🟠';
      default:
        return '🎨';
    }
  };

  return (
    <div className={`theme-switcher ${sizeClasses[size]}`} ref={dropdownRef}>
      <button
        className="theme-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Tema curentă: ${themes[themeName].displayName}`}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.text,
        }}
      >
        <span className="theme-switcher__icon">{getThemeIcon(themeName)}</span>
        <span className="theme-switcher__label">{themes[themeName].displayName}</span>
        <span className="theme-switcher__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          className="theme-switcher__dropdown"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 4px 12px ${theme.shadowColor}`,
          }}
        >
          {Object.values(themes).map((t) => (
            <button
              key={t.name}
              className={`theme-switcher__option ${themeName === t.name ? 'theme-switcher__option--active' : ''}`}
              onClick={() => {
                setTheme(t.name);
                setIsOpen(false);
              }}
              style={{
                background: themeName === t.name ? theme.accent : 'transparent',
                color: themeName === t.name ? '#fff' : theme.text,
              }}
              onMouseEnter={(e) => {
                if (themeName !== t.name) {
                  e.currentTarget.style.background = theme.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (themeName !== t.name) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="theme-switcher__option-icon">{getThemeIcon(t.name)}</span>
              <span className="theme-switcher__option-label">{t.displayName}</span>
              {themeName === t.name && <span className="theme-switcher__option-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


