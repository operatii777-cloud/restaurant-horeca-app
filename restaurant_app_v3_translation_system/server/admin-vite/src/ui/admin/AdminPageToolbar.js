"use strict";
/**
 * AdminPageToolbar - Toolbar compact 64px pentru filtre și acțiuni
 * Boogit-like: toolbar deasupra gridului, acțiuni clare
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPageToolbar = void 0;
var react_1 = require("react");
require("./AdminPageToolbar.css");
var AdminPageToolbar = function (_a) {
    var search = _a.search, filters = _a.filters, primaryActions = _a.primaryActions, secondaryActions = _a.secondaryActions, _b = _a.className, className = _b === void 0 ? '' : _b;
    return (<div className={"admin-page-toolbar ".concat(className)}>
      <div className="admin-page-toolbar__left">
        {search && (<div className="admin-page-toolbar__search">
            {search}
          </div>)}
        {filters && (<div className="admin-page-toolbar__filters">
            {filters}
          </div>)}
      </div>
      <div className="admin-page-toolbar__right">
        {secondaryActions && (<div className="admin-page-toolbar__secondary">
            {secondaryActions}
          </div>)}
        {primaryActions && (<div className="admin-page-toolbar__primary">
            {primaryActions}
          </div>)}
      </div>
    </div>);
};
exports.AdminPageToolbar = AdminPageToolbar;
