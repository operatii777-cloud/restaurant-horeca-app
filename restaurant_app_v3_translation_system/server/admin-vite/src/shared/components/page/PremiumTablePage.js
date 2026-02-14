"use strict";
/**
 * Premium Table Page Component
 * Pattern premium pentru pagini cu tabele (inspirat din imagini)
 * Include: Header modern, Toolbar cu search/filtre, Grid, Footer cu totaluri
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumTablePage = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/shared/context/ThemeContext");
require("./PremiumTablePage.css");
var PremiumTablePage = function (_a) {
    var title = _a.title, subtitle = _a.subtitle, headerActions = _a.headerActions, toolbar = _a.toolbar, children = _a.children, footer = _a.footer, _b = _a.className, className = _b === void 0 ? '' : _b;
    var theme = (0, ThemeContext_1.useTheme)().theme;
    return (<div className={"premium-table-page ".concat(className)} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section - Modern, clean, cu acțiuni */}
      <div className="premium-table-page__header" style={{
            padding: '24px 32px',
            background: theme.surface,
            borderBottom: "1px solid ".concat(theme.borderLight),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
        }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: theme.text,
            margin: 0,
            lineHeight: 1.2,
        }}>
            {title}
          </h1>
          {subtitle && (<p style={{
                fontSize: '14px',
                color: theme.textMuted,
                margin: 0,
                fontWeight: 400,
            }}>
              {subtitle}
            </p>)}
        </div>
        {headerActions && (<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {headerActions}
          </div>)}
      </div>

      {/* Toolbar Section - Search + Filters */}
      {toolbar && (<div className="premium-table-page__toolbar" style={{
                padding: '16px 32px',
                background: theme.surfaceLight,
                borderBottom: "1px solid ".concat(theme.borderLight),
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
            }}>
          {toolbar}
        </div>)}

      {/* Content Section - Grid */}
      <div className="premium-table-page__content" style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            background: theme.bgSolid,
        }}>
        {children}
      </div>

      {/* Footer Section - Totaluri + Branding */}
      {footer && (<div className="premium-table-page__footer" style={{
                padding: '16px 32px',
                background: theme.surface,
                borderTop: "1px solid ".concat(theme.borderLight),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
            }}>
          {footer}
        </div>)}
    </div>);
};
exports.PremiumTablePage = PremiumTablePage;
