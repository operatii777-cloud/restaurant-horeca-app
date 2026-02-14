"use strict";
/**
 * AdminPageHeader - Header compact 72px pentru paginile Admin-Vite
 * Boogit-like: densitate maximă, acțiuni clare
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPageHeader = void 0;
var react_1 = require("react");
require("./AdminPageHeader.css");
var AdminPageHeader = function (_a) {
    var title = _a.title, _b = _a.subtitle, subtitle = _b === void 0 ? 'Restaurant App V3 powered by QrOMS' : _b, actions = _a.actions, _c = _a.className, className = _c === void 0 ? '' : _c;
    return (<header className={"admin-page-header ".concat(className)}>
      <div className="admin-page-header__content">
        <div className="admin-page-header__text">
          <h1 className="admin-page-header__title">{title}</h1>
          {subtitle && (<p className="admin-page-header__subtitle">{subtitle}</p>)}
        </div>
        {actions && (<div className="admin-page-header__actions">
            {actions}
          </div>)}
      </div>
    </header>);
};
exports.AdminPageHeader = AdminPageHeader;
