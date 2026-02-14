"use strict";
/**
 * PREMIUM BUTTON COMPONENT
 * Industry-leading button component with perfect accessibility
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
exports.PremiumButton = void 0;
var react_1 = require("react");
var PremiumButton = function (_a) {
    var _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, _c = _a.size, size = _c === void 0 ? 'md' : _c, _d = _a.isLoading, isLoading = _d === void 0 ? false : _d, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, children = _a.children, _e = _a.className, className = _e === void 0 ? '' : _e, disabled = _a.disabled, props = __rest(_a, ["variant", "size", "isLoading", "leftIcon", "rightIcon", "children", "className", "disabled"]);
    var baseClasses = 'btn';
    var variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        success: 'btn-success',
    };
    var sizeClasses = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
    };
    var classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isLoading && 'btn-loading',
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (<button className={classes} disabled={disabled || isLoading} aria-busy={isLoading} aria-disabled={disabled || isLoading} {...props}>
      {isLoading && (<span className="btn-spinner" aria-hidden="true">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </span>)}
      {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      <span className="btn-content">{children}</span>
      {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>);
};
exports.PremiumButton = PremiumButton;
