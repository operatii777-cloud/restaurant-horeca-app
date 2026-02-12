"use strict";
// src/components/T.tsx
// Workaround temporar pentru a opri erorile
Object.defineProperty(exports, "__esModule", { value: true });
exports.T = T;
var react_1 = require("react");
/**
 * Component temporar care returnează direct conținutul
 * fără a face traduceri
 */
function T(_a) {
    var children = _a.children;
    // Returnează direct textul, fără traducere
    return <>{children}</>;
}
exports.default = T;
