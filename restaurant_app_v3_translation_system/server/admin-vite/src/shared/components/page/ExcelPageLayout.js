"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ExcelPageLayout STANDARD FINAL (boogiT-like)
 * STANDARDUL UNIC pentru toate paginile Admin-Vite
 * Compact: padding 16, gap 12
 * Contrast: folosește token-uri CSS (nu white/black hardcodat)
 * Sticky header + sticky toolbar
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelPageLayout = void 0;
var react_1 = require("react");
require("./ExcelPageLayout.css");
var ExcelPageLayout = function (_a) {
    var title = _a.title, subtitle = _a.subtitle, headerActions = _a.headerActions, toolbar = _a.toolbar, footer = _a.footer, children = _a.children, className = _a.className;
    return (<section className={"excel-page ".concat(className || "")}>
      {/* HEADER (sticky) */}
      <header className="excel-page__header">
        <div className="excel-page__header-left">
          <h1 className="excel-page__title">{title}</h1>
          {subtitle ? <div className="excel-page__subtitle">{subtitle}</div> : null}
        </div>

        {headerActions ? <div className="excel-page__header-actions">{headerActions}</div> : null}
      </header>

      {/* TOOLBAR (sticky sub-header) */}
      {toolbar ? <div className="excel-page__toolbar">{toolbar}</div> : null}

      {/* BODY */}
      <main className="excel-page__body" role="region" aria-label="continut pagina">
        {children}
      </main>

      {/* FOOTER */}
      {footer ? <footer className="excel-page__footer">{footer}</footer> : null}
    </section>);
};
exports.ExcelPageLayout = ExcelPageLayout;
