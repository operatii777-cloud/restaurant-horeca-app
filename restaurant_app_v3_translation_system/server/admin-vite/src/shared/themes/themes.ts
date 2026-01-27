// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Theme Definitions - Restaurant App V3
 * Multiple theme variants for Admin-Vite and POS/Kiosk
 * DEFAULT: Light theme (nu mai verifică system preference)
 */

export type ThemeName = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

export interface Theme {
  name: ThemeName;
  displayName: string;
  // Backgrounds
  bg: string;
  bgSolid: string;
  surface: string;
  surfaceLight: string;
  surfaceHover: string;
  // Text
  text: string;
  textMuted: string;
  textDark: string;
  // Borders
  border: string;
  borderLight: string;
  // Accents
  accent: string;
  accentLight: string;
  accentGlow: string;
  // Status colors
  success: string;
  successGlow: string;
  warning: string;
  warningGlow: string;
  danger: string;
  dangerGlow: string;
  info: string;
  infoGlow: string;
  // Cards
  cardBg: string;
  cardBorder: string;
  shadowColor: string;
  // Inputs
  inputBg: string;
  inputBorder: string;
  // Tables/Grids
  tableBg: string;
  tableHeaderBg: string;
  tableRowHover: string;
  // AG Grid specific
  gridHeaderBg?: string;
  gridRowEven?: string;
  gridRowOdd?: string;
  gridRowHover?: string;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    displayName: 'Light',
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
    tableRowHover: 'rgba(241, 245, 249, 0.8)',
    gridHeaderBg: '#f1f5f9',
    gridRowEven: '#ffffff',
    gridRowOdd: '#f8fafc',
    gridRowHover: '#e2e8f0',
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
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
    tableRowHover: 'rgba(71, 85, 105, 0.5)',
    gridHeaderBg: '#1e293b',
    gridRowEven: '#0f172a',
    gridRowOdd: '#1e293b',
    gridRowHover: '#334155',
  },
  blue: {
    name: 'blue',
    displayName: 'Blue',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0c4a6e 100%)',
    bgSolid: '#0c4a6e',
    surface: 'rgba(14, 165, 233, 0.15)',
    surfaceLight: 'rgba(56, 189, 248, 0.2)',
    surfaceHover: 'rgba(96, 165, 250, 0.25)',
    text: '#e0f2fe',
    textMuted: '#bae6fd',
    textDark: '#f0f9ff',
    border: 'rgba(186, 230, 253, 0.3)',
    borderLight: 'rgba(186, 230, 253, 0.2)',
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
    accentGlow: 'rgba(14, 165, 233, 0.3)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.3)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.3)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.3)',
    info: '#0ea5e9',
    infoGlow: 'rgba(14, 165, 233, 0.3)',
    cardBg: 'rgba(14, 165, 233, 0.1)',
    cardBorder: 'rgba(186, 230, 253, 0.2)',
    shadowColor: 'rgba(0,0,0,0.3)',
    inputBg: 'rgba(14, 165, 233, 0.1)',
    inputBorder: 'rgba(186, 230, 253, 0.3)',
    tableBg: 'rgba(14, 165, 233, 0.05)',
    tableHeaderBg: 'rgba(56, 189, 248, 0.2)',
    tableRowHover: 'rgba(96, 165, 250, 0.15)',
    gridHeaderBg: '#075985',
    gridRowEven: '#0c4a6e',
    gridRowOdd: '#075985',
    gridRowHover: '#0284c7',
  },
  green: {
    name: 'green',
    displayName: 'Green',
    bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #064e3b 100%)',
    bgSolid: '#064e3b',
    surface: 'rgba(16, 185, 129, 0.15)',
    surfaceLight: 'rgba(52, 211, 153, 0.2)',
    surfaceHover: 'rgba(110, 231, 183, 0.25)',
    text: '#d1fae5',
    textMuted: '#a7f3d0',
    textDark: '#ecfdf5',
    border: 'rgba(167, 243, 208, 0.3)',
    borderLight: 'rgba(167, 243, 208, 0.2)',
    accent: '#10b981',
    accentLight: '#34d399',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.3)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.3)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.3)',
    info: '#0ea5e9',
    infoGlow: 'rgba(14, 165, 233, 0.3)',
    cardBg: 'rgba(16, 185, 129, 0.1)',
    cardBorder: 'rgba(167, 243, 208, 0.2)',
    shadowColor: 'rgba(0,0,0,0.3)',
    inputBg: 'rgba(16, 185, 129, 0.1)',
    inputBorder: 'rgba(167, 243, 208, 0.3)',
    tableBg: 'rgba(16, 185, 129, 0.05)',
    tableHeaderBg: 'rgba(52, 211, 153, 0.2)',
    tableRowHover: 'rgba(110, 231, 183, 0.15)',
    gridHeaderBg: '#065f46',
    gridRowEven: '#064e3b',
    gridRowOdd: '#065f46',
    gridRowHover: '#047857',
  },
  purple: {
    name: 'purple',
    displayName: 'Purple',
    bg: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #581c87 100%)',
    bgSolid: '#581c87',
    surface: 'rgba(139, 92, 246, 0.15)',
    surfaceLight: 'rgba(167, 139, 250, 0.2)',
    surfaceHover: 'rgba(196, 181, 253, 0.25)',
    text: '#f3e8ff',
    textMuted: '#e9d5ff',
    textDark: '#faf5ff',
    border: 'rgba(233, 213, 255, 0.3)',
    borderLight: 'rgba(233, 213, 255, 0.2)',
    accent: '#a855f7',
    accentLight: '#c084fc',
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.3)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.3)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.3)',
    info: '#0ea5e9',
    infoGlow: 'rgba(14, 165, 233, 0.3)',
    cardBg: 'rgba(139, 92, 246, 0.1)',
    cardBorder: 'rgba(233, 213, 255, 0.2)',
    shadowColor: 'rgba(0,0,0,0.3)',
    inputBg: 'rgba(139, 92, 246, 0.1)',
    inputBorder: 'rgba(233, 213, 255, 0.3)',
    tableBg: 'rgba(139, 92, 246, 0.05)',
    tableHeaderBg: 'rgba(167, 139, 250, 0.2)',
    tableRowHover: 'rgba(196, 181, 253, 0.15)',
    gridHeaderBg: '#6b21a8',
    gridRowEven: '#581c87',
    gridRowOdd: '#6b21a8',
    gridRowHover: '#7c3aed',
  },
  orange: {
    name: 'orange',
    displayName: 'Orange',
    bg: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #7c2d12 100%)',
    bgSolid: '#7c2d12',
    surface: 'rgba(249, 115, 22, 0.15)',
    surfaceLight: 'rgba(251, 146, 60, 0.2)',
    surfaceHover: 'rgba(253, 186, 116, 0.25)',
    text: '#ffedd5',
    textMuted: '#fed7aa',
    textDark: '#fff7ed',
    border: 'rgba(254, 215, 170, 0.3)',
    borderLight: 'rgba(254, 215, 170, 0.2)',
    accent: '#f97316',
    accentLight: '#fb923c',
    accentGlow: 'rgba(249, 115, 22, 0.3)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.3)',
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.3)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.3)',
    info: '#0ea5e9',
    infoGlow: 'rgba(14, 165, 233, 0.3)',
    cardBg: 'rgba(249, 115, 22, 0.1)',
    cardBorder: 'rgba(254, 215, 170, 0.2)',
    shadowColor: 'rgba(0,0,0,0.3)',
    inputBg: 'rgba(249, 115, 22, 0.1)',
    inputBorder: 'rgba(254, 215, 170, 0.3)',
    tableBg: 'rgba(249, 115, 22, 0.05)',
    tableHeaderBg: 'rgba(251, 146, 60, 0.2)',
    tableRowHover: 'rgba(253, 186, 116, 0.15)',
    gridHeaderBg: '#9a3412',
    gridRowEven: '#7c2d12',
    gridRowOdd: '#9a3412',
    gridRowHover: '#c2410c',
  },
};

export const getTheme = (name: ThemeName): Theme => {
  return themes[name] || themes.light;
};

export const getDefaultTheme = (): ThemeName => {
  // Check localStorage first
  const saved = localStorage.getItem('admin_theme');
  if (saved && saved in themes) {
    return saved as ThemeName;
  }
  // Default: light theme
  return 'light';
};

