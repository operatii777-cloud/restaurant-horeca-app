"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Error State Component - Error display with retry
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorState = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./ErrorState.css");
var ErrorState = function (_a) {
    var _b = _a.title, title = _b === void 0 ? 'Eroare' : _b, _c = _a.message, message = _c === void 0 ? 'A apărut o eroare la încărcarea datelor.' : _c, onRetry = _a.onRetry, onCopyDebug = _a.onCopyDebug, _d = _a.className, className = _d === void 0 ? '' : _d;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"error-state ".concat(className)}>
      <div className="error-state__icon" style={{ color: theme.danger }}>
        ⚠️
      </div>
      <h3 className="error-state__title" style={{ color: theme.text }}>
        {title}
      </h3>
      {message && (<p className="error-state__message" style={{ color: theme.textMuted }}>
          {message}
        </p>)}
      <div className="error-state__actions">
        {onRetry && (<button type="button" className="error-state__retry" onClick={onRetry} style={{
                background: theme.accent,
                color: '#fff',
                border: 'none',
            }}>"Reîncearcă"</button>)}
        {onCopyDebug && (<button type="button" className="error-state__copy" onClick={onCopyDebug} style={{
                background: theme.surface,
                border: "1px solid ".concat(theme.border),
                color: theme.text,
            }}>"copiaza debug"</button>)}
      </div>
    </div>);
};
exports.ErrorState = ErrorState;
