"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Grid Actions Menu - Premium 3-dot menu for row actions
 * Pattern din imagini: meniu dropdown cu acțiuni (View, Edit, Delete, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridActionsMenu = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./GridActionsMenu.css");
var GridActionsMenu = function (_a) {
    var actions = _a.actions, _b = _a.className, className = _b === void 0 ? '' : _b;
    //   const { t } = useTranslation();
    var theme = (0, ThemeContext_1.useTheme)().theme;
    var _c = (0, react_1.useState)(false), isOpen = _c[0], setIsOpen = _c[1];
    var menuRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
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
    var getActionColor = function (variant) {
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
    return (<div className={"grid-actions-menu ".concat(className)} ref={menuRef}>
      <button type="button" className="grid-actions-menu__trigger" onClick={function (e) {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }} style={{
            background: 'transparent',
            border: 'none',
            color: theme.text,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
        }} title="Acțiuni">
        ⋯
      </button>

      {isOpen && (<div className="grid-actions-menu__dropdown" style={{
                background: theme.surface,
                border: "1px solid ".concat(theme.border),
                boxShadow: "0 4px 12px ".concat(theme.shadowColor),
            }}>
          {actions.map(function (action, index) { return (<button key={index} type="button" className={"grid-actions-menu__action ".concat(action.disabled ? 'grid-actions-menu__action--disabled' : '')} onClick={function (e) {
                    e.stopPropagation();
                    if (!action.disabled) {
                        action.onClick();
                        setIsOpen(false);
                    }
                }} disabled={action.disabled} style={{
                    color: action.disabled ? theme.textMuted : getActionColor(action.variant),
                    opacity: action.disabled ? 0.5 : 1,
                }} onMouseEnter={function (e) {
                    if (!action.disabled) {
                        e.currentTarget.style.background = theme.surfaceHover;
                    }
                }} onMouseLeave={function (e) {
                    e.currentTarget.style.background = 'transparent';
                }}>
              {action.icon && <span className="grid-actions-menu__icon">{action.icon}</span>}
              <span className="grid-actions-menu__label">{action.label}</span>
            </button>); })}
        </div>)}
    </div>);
};
exports.GridActionsMenu = GridActionsMenu;
