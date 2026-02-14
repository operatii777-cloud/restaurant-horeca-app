"use strict";
/**
 * AdminLoadingState - Loading state compact
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLoadingState = void 0;
var react_1 = require("react");
require("./AdminStates.css");
var AdminLoadingState = function (_a) {
    var _b = _a.message, message = _b === void 0 ? 'Se încarcă...' : _b;
    return (<div className="admin-state admin-state--loading">
      <div className="admin-state__spinner"/>
      <p className="admin-state__message">{message}</p>
    </div>);
};
exports.AdminLoadingState = AdminLoadingState;
