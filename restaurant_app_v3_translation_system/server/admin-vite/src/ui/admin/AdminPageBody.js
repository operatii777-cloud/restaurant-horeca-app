"use strict";
/**
 * AdminPageBody - Container pentru conținutul principal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPageBody = void 0;
var react_1 = require("react");
require("./AdminPageBody.css");
var AdminPageBody = function (_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b;
    return (<div className={"admin-page-body ".concat(className)}>
      {children}
    </div>);
};
exports.AdminPageBody = AdminPageBody;
