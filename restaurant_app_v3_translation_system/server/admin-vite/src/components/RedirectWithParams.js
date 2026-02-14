"use strict";
/**
 * PHASE S5.5 - Redirect Component with Params
 * Helper component for redirecting routes with parameters
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectWithParams = void 0;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var RedirectWithParams = function (_a) {
    var to = _a.to, _b = _a.replace, replace = _b === void 0 ? true : _b;
    var params = (0, react_router_dom_1.useParams)();
    return <react_router_dom_1.Navigate to={to(params)} replace={replace}/>;
};
exports.RedirectWithParams = RedirectWithParams;
