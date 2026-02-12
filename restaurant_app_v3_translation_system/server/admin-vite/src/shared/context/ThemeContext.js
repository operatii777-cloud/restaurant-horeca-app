"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Theme Context - Global theme management for Admin-Vite
 * FORȚAT: Light theme ca standard (nu mai aplică dark theme)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeProvider = void 0;
var react_1 = require("react");
var themes_1 = require("../themes/themes");
var ThemeContext = (0, react_1.createContext)(undefined);
var STORAGE_KEY = 'admin_theme';
var ThemeProvider = function (_a) {
    var children = _a.children;
    //   const { t } = useTranslation();
    // ✅ ACTIVAT: Permite toate temele (light, dark, blue, green, purple, orange)
    var _b = (0, react_1.useState)(function () {
        // Verifică localStorage pentru tema salvată, default light
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved in themes_1.themes) {
            return saved;
        }
        return 'light';
    }), themeName = _b[0], setThemeNameState = _b[1];
    // Save theme to localStorage when it changes
    (0, react_1.useEffect)(function () {
        // Salvează tema selectată
        localStorage.setItem(STORAGE_KEY, themeName);
        // Apply theme to document root for CSS variables
        var root = document.documentElement;
        var body = document.body;
        var rootElement = document.getElementById('root');
        var theme = (0, themes_1.getTheme)(themeName);
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
    var setTheme = function (name) {
        // ✅ ACTIVAT: Permite toate temele
        if (name in themes_1.themes) {
            setThemeNameState(name);
            localStorage.setItem(STORAGE_KEY, name);
            // Sincronizare cu dark mode din UICustomizationPage
            if (name === 'dark') {
                localStorage.setItem('darkMode', 'true');
                document.documentElement.classList.add('dark-mode');
            }
            else {
                localStorage.setItem('darkMode', 'false');
                document.documentElement.classList.remove('dark-mode');
            }
        }
    };
    var toggleTheme = function () {
        // ✅ ACTIVAT: Toggle între light și dark
        var nextTheme = themeName === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    };
    var theme = (0, react_1.useMemo)(function () { return (0, themes_1.getTheme)(themeName); }, [themeName]);
    var value = (0, react_1.useMemo)(function () { return ({
        theme: theme,
        themeName: themeName,
        setTheme: setTheme,
        toggleTheme: toggleTheme,
    }); }, [theme, themeName]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
exports.ThemeProvider = ThemeProvider;
var useTheme = function () {
    var context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        // Fallback to light theme if context is not available
        return {
            theme: (0, themes_1.getTheme)('light'),
            themeName: 'light',
            setTheme: function () { },
            toggleTheme: function () { },
        };
    }
    return context;
};
exports.useTheme = useTheme;
