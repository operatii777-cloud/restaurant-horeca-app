"use strict";
/**
 * Page Header Component - Premium UI Pattern
 * Sticky header with title, breadcrumbs, status badge, and primary actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageHeader = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./PageHeader.css");
var PageHeader = function (_a) {
    var title = _a.title, subtitle = _a.subtitle, breadcrumbs = _a.breadcrumbs, statusBadge = _a.statusBadge, actions = _a.actions, _b = _a.className, className = _b === void 0 ? '' : _b;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"page-header ".concat(className)} style={{
            background: theme.surface,
            borderBottom: "1px solid ".concat(theme.border),
        }}>
      <div className="page-header__content">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (<nav className="page-header__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map(function (crumb, index) { return (<react_1.default.Fragment key={index}>
                {crumb.path ? (<a href={crumb.path} className="page-header__breadcrumb-link" style={{ color: theme.textMuted }}>
                    {crumb.label}
                  </a>) : (<span className="page-header__breadcrumb-text" style={{ color: theme.textMuted }}>
                    {crumb.label}
                  </span>)}
                {index < breadcrumbs.length - 1 && (<span className="page-header__breadcrumb-separator" style={{ color: theme.textMuted }}>
                    /
                  </span>)}
              </react_1.default.Fragment>); })}
          </nav>)}

        {/* Title and Subtitle */}
        <div className="page-header__title-section">
          <div>
            <h1 className="page-header__title" style={{ color: theme.text }}>
              {title}
            </h1>
            {subtitle && (<p className="page-header__subtitle" style={{ color: theme.textMuted }}>
                {subtitle}
              </p>)}
          </div>
          {statusBadge && (<span className={"page-header__badge page-header__badge--".concat(statusBadge.variant)} style={{
                background: statusBadge.variant === 'success'
                    ? theme.success
                    : statusBadge.variant === 'warning'
                        ? theme.warning
                        : statusBadge.variant === 'danger'
                            ? theme.danger
                            : statusBadge.variant === 'info'
                                ? theme.info
                                : theme.surfaceLight,
                color: '#fff',
            }}>
              {statusBadge.label}
            </span>)}
        </div>

        {/* Actions */}
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>);
};
exports.PageHeader = PageHeader;
