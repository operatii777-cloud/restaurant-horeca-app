"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * TOAST NOTIFICATIONS HOOK
 * Sistem de notificări Windows-style
 * Clean, minimal, non-intrusive
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = void 0;
var react_1 = require("react");
var useToast = function () {
    var _a = (0, react_1.useState)([]), toasts = _a[0], setToasts = _a[1];
    var removeToast = (0, react_1.useCallback)(function (id) {
        setToasts(function (prev) { return prev.filter(function (toast) { return toast.id !== id; }); });
    }, []);
    var showToast = (0, react_1.useCallback)(function (type, message, duration) {
        if (duration === void 0) { duration = 3000; }
        var id = "toast-".concat(Date.now(), "-").concat(Math.random());
        var toast = { id: id, type: type, message: message, duration: duration };
        setToasts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [toast], false); });
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(function () {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);
    var clearAll = (0, react_1.useCallback)(function () {
        setToasts([]);
    }, []);
    return {
        toasts: toasts,
        showToast: showToast,
        removeToast: removeToast,
        clearAll: clearAll,
    };
};
exports.useToast = useToast;
