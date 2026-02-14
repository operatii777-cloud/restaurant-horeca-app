"use strict";
/**
 * AdminPageFooter - Footer compact pentru paginile Admin-Vite
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPageFooter = void 0;
var react_1 = require("react");
require("./AdminPageFooter.css");
var AdminPageFooter = function (_a) {
    var left = _a.left, _b = _a.right, right = _b === void 0 ? 'Restaurant App V3 powered by QrOMS' : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    return (<footer className={"admin-page-footer ".concat(className)}>
      {left && <div className="admin-page-footer__left">{left}</div>}
      {right && <div className="admin-page-footer__right">{right}</div>}
    </footer>);
};
exports.AdminPageFooter = AdminPageFooter;
