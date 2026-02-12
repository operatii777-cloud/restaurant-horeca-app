"use strict";
/**
 * Loading State Component - Skeleton loading
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingState = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./LoadingState.css");
var LoadingState = function (_a) {
    var _b = _a.message, message = _b === void 0 ? 'Se încarcă...' : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"loading-state ".concat(className)} style={{ color: theme.textMuted }}>
      <div className="loading-state__spinner" style={{ borderColor: theme.border }}>
        <div style={{ borderTopColor: theme.accent }}/>
      </div>
      {message && <p className="loading-state__message">{message}</p>}
    </div>);
};
exports.LoadingState = LoadingState;
