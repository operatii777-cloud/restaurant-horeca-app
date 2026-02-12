"use strict";
/**
 * PREMIUM INPUT COMPONENT
 * Industry-leading input component with perfect accessibility
 * Inspired by: Stripe, Linear, Vercel, Shadcn UI
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumInput = void 0;
var react_1 = require("react");
var PremiumInput = function (_a) {
    var label = _a.label, error = _a.error, helperText = _a.helperText, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, _b = _a.className, className = _b === void 0 ? '' : _b, id = _a.id, props = __rest(_a, ["label", "error", "helperText", "leftIcon", "rightIcon", "className", "id"]);
    var inputId = id || "input-".concat(Math.random().toString(36).substr(2, 9));
    var errorId = error ? "".concat(inputId, "-error") : undefined;
    var helperId = helperText ? "".concat(inputId, "-helper") : undefined;
    var describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
    return (<div className="premium-input-wrapper">
      {label && (<label htmlFor={inputId} className="premium-input-label">
          {label}
          {props.required && <span className="premium-input-required" aria-label="required">*</span>}
        </label>)}
      <div className="premium-input-container">
        {leftIcon && <span className="premium-input-icon-left">{leftIcon}</span>}
        <input id={inputId} className={"input premium-input ".concat(error ? 'premium-input-error' : '', " ").concat(className)} aria-invalid={error ? 'true' : 'false'} aria-describedby={describedBy} {...props}/>
        {rightIcon && <span className="premium-input-icon-right">{rightIcon}</span>}
      </div>
      {error && (<div id={errorId} className="premium-input-error-message" role="alert">
          {error}
        </div>)}
      {helperText && !error && (<div id={helperId} className="premium-input-helper-text">
          {helperText}
        </div>)}
    </div>);
};
exports.PremiumInput = PremiumInput;
