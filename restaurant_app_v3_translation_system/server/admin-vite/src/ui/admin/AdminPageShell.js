"use strict";
/**
 * AdminPageShell - Container principal pentru toate paginile Admin-Vite
 * Boogit-like: compact, zero spații goale, padding strict 16px
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPageShell = void 0;
var react_1 = require("react");
require("./AdminPageShell.css");
var AdminPageShell = function (_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b;
    return (<div className={"admin-page-shell ".concat(className)}>
      {children}
    </div>);
};
exports.AdminPageShell = AdminPageShell;
