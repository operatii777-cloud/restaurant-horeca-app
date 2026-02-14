"use strict";
/**
 * Empty State Component - No data available
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./EmptyState.css");
var EmptyState = function (_a) {
    var _b = _a.title, title = _b === void 0 ? 'Nu există date' : _b, _c = _a.message, message = _c === void 0 ? 'Nu s-au găsit înregistrări.' : _c, actionLabel = _a.actionLabel, onAction = _a.onAction, _d = _a.icon, icon = _d === void 0 ? '📭' : _d, _e = _a.className, className = _e === void 0 ? '' : _e;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"empty-state ".concat(className)}>
      <div className="empty-state__icon" style={{ color: theme.textMuted }}>
        {icon}
      </div>
      <h3 className="empty-state__title" style={{ color: theme.text }}>
        {title}
      </h3>
      {message && (<p className="empty-state__message" style={{ color: theme.textMuted }}>
          {message}
        </p>)}
      {actionLabel && onAction && (<button type="button" className="empty-state__action" onClick={onAction} style={{
                background: theme.accent,
                color: '#fff',
                border: 'none',
            }}>
          {actionLabel}
        </button>)}
    </div>);
};
exports.EmptyState = EmptyState;
