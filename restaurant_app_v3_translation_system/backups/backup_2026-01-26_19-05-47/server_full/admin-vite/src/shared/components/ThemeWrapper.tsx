// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Theme Wrapper Component
 * Sincronizează CSS variables cu tema activă din ThemeContext
 */

import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { t } = useTranslation();
  const { theme, themeName } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootElement = document.getElementById('root');

    // ✅ Setează data-theme pentru a permite CSS-ul bazat pe theme
    root.setAttribute('data-theme', themeName);
    body.setAttribute('data-theme', themeName);
    if (rootElement) {
      rootElement.setAttribute('data-theme', themeName);
    }

    // Set CSS variables existente folosite de aplicație
    // FORȚAT: întotdeauna light theme
    root.style.setProperty('--color-bg-primary', theme.surface);
    root.style.setProperty('--color-bg-secondary', theme.bgSolid);
    root.style.setProperty('--color-bg-tertiary', theme.surfaceLight);
    root.style.setProperty('--color-bg-hover', theme.surfaceHover);
    root.style.setProperty('--color-bg-active', theme.surfaceHover);
    
    root.style.setProperty('--color-text-primary', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textMuted);
    root.style.setProperty('--color-text-tertiary', theme.textMuted);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-border-light', theme.borderLight);
    root.style.setProperty('--color-border-hover', theme.border);
    root.style.setProperty('--color-border-focus', theme.accent);
    
    root.style.setProperty('--color-primary', theme.accent);
    root.style.setProperty('--color-success', theme.success);
    root.style.setProperty('--color-warning', theme.warning);
    root.style.setProperty('--color-error', theme.danger);
    root.style.setProperty('--color-info', theme.info);

    // Set theme tokens noi (--bg-app, --bg-card, etc.)
    root.style.setProperty('--bg-app', theme.bgSolid);
    root.style.setProperty('--bg-card', theme.surface);
    root.style.setProperty('--bg-header', theme.surface);
    root.style.setProperty('--bg-hover', theme.surfaceHover);
    root.style.setProperty('--bg-active', theme.surfaceHover);
    
    root.style.setProperty('--text-primary', theme.text);
    root.style.setProperty('--text-secondary', theme.textMuted);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--text-disabled', theme.textMuted);
    
    root.style.setProperty('--border-subtle', theme.borderLight);
    root.style.setProperty('--border-base', theme.border);
    root.style.setProperty('--border-strong', theme.border);
    
    root.style.setProperty('--primary', theme.accent);
    root.style.setProperty('--primary-hover', theme.accent);
    root.style.setProperty('--success', theme.success);
    root.style.setProperty('--warning', theme.warning);
    root.style.setProperty('--error', theme.danger);
    root.style.setProperty('--info', theme.info);
  }, [theme, themeName]);

  return <>{children}</>;
};
