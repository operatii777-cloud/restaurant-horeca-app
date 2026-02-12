"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * SKELETON LOADER - Windows Style
 * Loading states elegante pentru componente
 * Windows Fluent Design inspired
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardSkeleton = exports.TableSkeleton = exports.SkeletonLoader = void 0;
var react_1 = require("react");
var SkeletonLoader = function (_a) {
    var _b = _a.width, width = _b === void 0 ? '100%' : _b, _c = _a.height, height = _c === void 0 ? '20px' : _c, _d = _a.variant, variant = _d === void 0 ? 'rectangular' : _d, _e = _a.className, className = _e === void 0 ? '' : _e, _f = _a.style, style = _f === void 0 ? {} : _f;
    var baseStyle = __assign({ width: typeof width === 'number' ? "".concat(width, "px") : width, height: typeof height === 'number' ? "".concat(height, "px") : height, backgroundColor: '#f3f3f3', borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '4px', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }, style);
    return (<div className={"skeleton-loader ".concat(className)} style={baseStyle} aria-label="Se încarcă..." role="status"/>);
};
exports.SkeletonLoader = SkeletonLoader;
/**
 * Table Skeleton - pentru tabele AG Grid
 */
var TableSkeleton = function (_a) {
    var _b = _a.rows, rows = _b === void 0 ? 5 : _b, _c = _a.columns, columns = _c === void 0 ? 4 : _c;
    return (<div style={{ padding: '16px' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        {Array.from({ length: columns }).map(function (_, i) { return (<exports.SkeletonLoader key={i} width="120px" height="32px"/>); })}
      </div>
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map(function (_, rowIndex) { return (<div key={rowIndex} style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
          {Array.from({ length: columns }).map(function (_, colIndex) { return (<exports.SkeletonLoader key={colIndex} width="120px" height="32px"/>); })}
        </div>); })}
    </div>);
};
exports.TableSkeleton = TableSkeleton;
/**
 * Card Skeleton
 */
var CardSkeleton = function () {
    //   const { t } = useTranslation();
    return (<div style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d1d1',
            borderRadius: '8px',
        }}>
      <exports.SkeletonLoader width="60%" height="24px" variant="text" style={{ marginBottom: '16px' }}/>
      <exports.SkeletonLoader width="100%" height="16px" variant="text" style={{ marginBottom: '8px' }}/>
      <exports.SkeletonLoader width="80%" height="16px" variant="text"/>
    </div>);
};
exports.CardSkeleton = CardSkeleton;
// Add CSS animation
if (typeof document !== 'undefined') {
    var style = document.createElement('style');
    style.textContent = "\n    @keyframes skeleton-pulse {\n      0%, 100% {\n        opacity: 1;\n      }\n      50% {\n        opacity: 0.5;\n      }\n    }\n    \n    .skeleton-loader {\n      animation: skeleton-pulse 1.5s ease-in-out infinite;\n    }\n  ";
    document.head.appendChild(style);
}
