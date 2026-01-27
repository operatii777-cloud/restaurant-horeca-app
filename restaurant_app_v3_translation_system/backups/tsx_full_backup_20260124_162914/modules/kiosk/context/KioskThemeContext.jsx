import React, { createContext, useContext, useState, useEffect } from 'react';

// 🎨 THEME DEFINITIONS
export const kioskThemes = {
  dark: {
    name: 'dark',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    bgSolid: '#0f172a',
    surface: 'rgba(30, 41, 59, 0.95)',
    surfaceLight: 'rgba(51, 65, 85, 0.9)',
    surfaceHover: 'rgba(71, 85, 105, 0.9)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textDark: '#cbd5e1',
    border: 'rgba(148, 163, 184, 0.2)',
    borderLight: 'rgba(148, 163, 184, 0.1)',
    accent: '#6366f1',
    accentLight: '#818cf8',
    accentGlow: 'rgba(99, 102, 241, 0.3)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.3)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.3)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.3)',
    info: '#0ea5e9',
    infoGlow: 'rgba(14, 165, 233, 0.3)',
    cardBg: 'rgba(30, 41, 59, 0.8)',
    cardBorder: 'rgba(148, 163, 184, 0.15)',
    shadowColor: 'rgba(0,0,0,0.4)',
    inputBg: 'rgba(15, 23, 42, 0.8)',
    inputBorder: 'rgba(148, 163, 184, 0.3)',
    tableBg: 'rgba(30, 41, 59, 0.6)',
    tableHeaderBg: 'rgba(51, 65, 85, 0.8)',
    tableRowHover: 'rgba(71, 85, 105, 0.5)'
  },
  light: {
    name: 'light',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
    bgSolid: '#f8fafc',
    surface: 'rgba(255, 255, 255, 0.95)',
    surfaceLight: 'rgba(248, 250, 252, 0.9)',
    surfaceHover: 'rgba(241, 245, 249, 0.9)',
    text: '#1e293b',
    textMuted: '#64748b',
    textDark: '#334155',
    border: 'rgba(148, 163, 184, 0.3)',
    borderLight: 'rgba(148, 163, 184, 0.2)',
    accent: '#6366f1',
    accentLight: '#818cf8',
    accentGlow: 'rgba(99, 102, 241, 0.2)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.2)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.2)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.2)',
    info: '#0ea5e9',
    infoGlow: 'rgba(14, 165, 233, 0.2)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(148, 163, 184, 0.2)',
    shadowColor: 'rgba(0,0,0,0.1)',
    inputBg: 'rgba(255, 255, 255, 0.9)',
    inputBorder: 'rgba(148, 163, 184, 0.4)',
    tableBg: 'rgba(255, 255, 255, 0.8)',
    tableHeaderBg: 'rgba(248, 250, 252, 0.95)',
    tableRowHover: 'rgba(241, 245, 249, 0.8)'
  }
};

// Context
const KioskThemeContext = createContext();

// Provider
export const KioskThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('kiosk_theme');
    return saved ? saved === 'dark' : true; // Default: dark
  });

  // Salvează tema în localStorage
  useEffect(() => {
    localStorage.setItem('kiosk_theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const theme = isDarkTheme ? kioskThemes.dark : kioskThemes.light;
  const toggleTheme = () => setIsDarkTheme(prev => !prev);

  return (
    <KioskThemeContext.Provider value={{ theme, isDarkTheme, toggleTheme, setIsDarkTheme }}>
      {children}
    </KioskThemeContext.Provider>
  );
};

// Hook pentru a folosi tema
export const useKioskTheme = () => {
  const context = useContext(KioskThemeContext);
  if (!context) {
    // Fallback dacă nu e în provider - returnează dark theme by default
    return {
      theme: kioskThemes.dark,
      isDarkTheme: true,
      toggleTheme: () => {},
      setIsDarkTheme: () => {}
    };
  }
  return context;
};

// Component pentru butonul de toggle
export const ThemeToggleButton = ({ size = 'lg', style = {} }) => {
  const { isDarkTheme, toggleTheme } = useKioskTheme();
  
  return (
    <button
      onClick={toggleTheme}
      title={isDarkTheme ? 'Schimbă la Light Mode' : 'Schimbă la Dark Mode'}
      style={{
        background: isDarkTheme 
          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
          : 'linear-gradient(135deg, #1e293b, #334155)',
        border: 'none',
        color: '#fff',
        fontWeight: 500,
        boxShadow: isDarkTheme 
          ? '0 4px 12px rgba(251, 191, 36, 0.3)' 
          : '0 4px 12px rgba(30, 41, 59, 0.3)',
        minWidth: '50px',
        padding: size === 'lg' ? '0.5rem 1rem' : '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: size === 'lg' ? '1.25rem' : '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {isDarkTheme ? '☀️' : '🌙'}
    </button>
  );
};

// Component pentru legenda compactă
export const CompactLegend = () => {
  const { theme } = useKioskTheme();
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '6px 12px',
      background: theme.surfaceLight,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          background: 'linear-gradient(135deg, #28a745, #20c997)', 
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(40, 167, 69, 0.5)'
        }}></div>
        <span style={{ color: theme.textMuted, fontSize: '0.7rem', fontWeight: 500 }}>Liberă</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          background: 'linear-gradient(135deg, #dc3545, #c82333)', 
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(220, 53, 69, 0.5)'
        }}></div>
        <span style={{ color: theme.textMuted, fontSize: '0.7rem', fontWeight: 500 }}>Ocupată</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          background: 'linear-gradient(135deg, #007bff, #0056b3)', 
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(0, 123, 255, 0.5)'
        }}></div>
        <span style={{ color: theme.textMuted, fontSize: '0.7rem', fontWeight: 500 }}>Rezervată</span>
      </div>
    </div>
  );
};

export default KioskThemeContext;

