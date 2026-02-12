"use strict";
/**
 * Page Footer Component - Premium UI Pattern
 * Summary totals, pagination, and branding
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageFooter = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./PageFooter.css");
var PageFooter = function (_a) {
    var summary = _a.summary, pagination = _a.pagination, _b = _a.branding, branding = _b === void 0 ? true : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"page-footer ".concat(className)} style={{
            background: theme.surfaceLight,
            borderTop: "1px solid ".concat(theme.borderLight),
        }}>
      <div className="page-footer__content">
        {summary && <div className="page-footer__summary">{summary}</div>}
        <div className="page-footer__right">
          {pagination && <div className="page-footer__pagination">{pagination}</div>}
          {branding && (<div className="page-footer__branding" style={{ color: theme.textMuted }}>
              Restaurant App V3 powered by QrOMS
            </div>)}
        </div>
      </div>
    </div>);
};
exports.PageFooter = PageFooter;
