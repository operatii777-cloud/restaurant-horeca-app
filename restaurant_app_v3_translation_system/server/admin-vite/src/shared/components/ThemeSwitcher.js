"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Theme Switcher Component
 * Dropdown menu for selecting theme
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeSwitcher = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("../context/ThemeContext");
var themes_1 = require("../themes/themes");
require("./ThemeSwitcher.css");
var ThemeSwitcher = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 'md' : _b;
    //   const { t } = useTranslation();
    var _c = (0, ThemeContext_1.useTheme)(), theme = _c.theme, themeName = _c.themeName, setTheme = _c.setTheme;
    var _d = (0, react_1.useState)(false), isOpen = _d[0], setIsOpen = _d[1];
    var dropdownRef = (0, react_1.useRef)(null);
    // Close dropdown when clicking outside
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return function () {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);
    var sizeClasses = {
        sm: 'theme-switcher--sm',
        md: 'theme-switcher--md',
        lg: 'theme-switcher--lg',
    };
    var getThemeIcon = function (name) {
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
    return (<div className={"theme-switcher ".concat(sizeClasses[size])} ref={dropdownRef}>
      <button className="theme-switcher__button" onClick={function () { return setIsOpen(!isOpen); }} title={"Tema curent\u0103: ".concat(themes_1.themes[themeName].displayName)} style={{
            background: theme.surface,
            border: "1px solid ".concat(theme.border),
            color: theme.text,
        }}>
        <span className="theme-switcher__icon">{getThemeIcon(themeName)}</span>
        <span className="theme-switcher__label">{themes_1.themes[themeName].displayName}</span>
        <span className="theme-switcher__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (<div className="theme-switcher__dropdown" style={{
                background: theme.surface,
                border: "1px solid ".concat(theme.border),
                boxShadow: "0 4px 12px ".concat(theme.shadowColor),
            }}>
          {Object.values(themes_1.themes).map(function (t) { return (<button key={t.name} className={"theme-switcher__option ".concat(themeName === t.name ? 'theme-switcher__option--active' : '')} onClick={function () {
                    setTheme(t.name);
                    setIsOpen(false);
                }} style={{
                    background: themeName === t.name ? theme.accent : 'transparent',
                    color: themeName === t.name ? '#fff' : theme.text,
                }} onMouseEnter={function (e) {
                    if (themeName !== t.name) {
                        e.currentTarget.style.background = theme.surfaceHover;
                    }
                }} onMouseLeave={function (e) {
                    if (themeName !== t.name) {
                        e.currentTarget.style.background = 'transparent';
                    }
                }}>
              <span className="theme-switcher__option-icon">{getThemeIcon(t.name)}</span>
              <span className="theme-switcher__option-label">{t.displayName}</span>
              {themeName === t.name && <span className="theme-switcher__option-check">✓</span>}
            </button>); })}
        </div>)}
    </div>);
};
exports.ThemeSwitcher = ThemeSwitcher;
