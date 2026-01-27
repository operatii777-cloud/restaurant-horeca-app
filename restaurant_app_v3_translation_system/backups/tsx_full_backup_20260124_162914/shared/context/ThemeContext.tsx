// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Theme Context - Global theme management for Admin-Vite
 * FORȚAT: Light theme ca standard (nu mai aplică dark theme)
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { themes, getTheme, getDefaultTheme, type ThemeName, type Theme } from '../themes/themes';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'admin_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { t } = useTranslation();
  // ✅ ACTIVAT: Permite toate temele (light, dark, blue, green, purple, orange)
  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    // Verifică localStorage pentru tema salvată, default light
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in themes) {
      return saved as ThemeName;
    }
    return 'light';
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    // Salvează tema selectată
    localStorage.setItem(STORAGE_KEY, themeName);
    
    // Apply theme to document root for CSS variables
    const root = document.documentElement;
    const body = document.body;
    const rootElement = document.getElementById('root');
    const theme = getTheme(themeName);
    
    // Set CSS variables for theme
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-bgSolid', theme.bgSolid);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-surfaceLight', theme.surfaceLight);
    root.style.setProperty('--theme-surfaceHover', theme.surfaceHover);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-textMuted', theme.textMuted);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-borderLight', theme.borderLight);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-accentLight', theme.accentLight);
    root.style.setProperty('--theme-accentGlow', theme.accentGlow);
    root.style.setProperty('--theme-success', theme.success);
    root.style.setProperty('--theme-successGlow', theme.successGlow);
    root.style.setProperty('--theme-warning', theme.warning);
    root.style.setProperty('--theme-warningGlow', theme.warningGlow);
    root.style.setProperty('--theme-danger', theme.danger);
    root.style.setProperty('--theme-dangerGlow', theme.dangerGlow);
    root.style.setProperty('--theme-info', theme.info);
    root.style.setProperty('--theme-infoGlow', theme.infoGlow);
    
    // Set CSS variables existente folosite de aplicație
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

    // Setăm data-theme pentru a permite CSS-ul bazat pe theme
    root.setAttribute('data-theme', themeName);
    body.setAttribute('data-theme', themeName);
    if (rootElement) {
      rootElement.setAttribute('data-theme', themeName);
    }
  }, [themeName]);

  const setTheme = (name: ThemeName) => {
    // ✅ ACTIVAT: Permite toate temele
    if (name in themes) {
      setThemeNameState(name);
      localStorage.setItem(STORAGE_KEY, name);
      
      // Sincronizare cu dark mode din UICustomizationPage
      if (name === 'dark') {
        localStorage.setItem('darkMode', 'true');
        document.documentElement.classList.add('dark-mode');
      } else {
        localStorage.setItem('darkMode', 'false');
        document.documentElement.classList.remove('dark-mode');
      }
    }
  };

  const toggleTheme = () => {
    // ✅ ACTIVAT: Toggle între light și dark
    const nextTheme = themeName === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const theme = useMemo(() => getTheme(themeName), [themeName]);

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      themeName,
      setTheme,
      toggleTheme,
    }),
    [theme, themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback to light theme if context is not available
    return {
      theme: getTheme('light'),
      themeName: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};

