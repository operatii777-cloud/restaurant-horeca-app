"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * useAutoLock Hook
 *
 * Automatically locks the screen after a period of inactivity
 * Similar to Toast/Lightspeed standby mode
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
exports.useAutoLock = useAutoLock;
var react_1 = require("react");
var DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
var DEFAULT_EVENTS = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'click'
];
function useAutoLock(options) {
    if (options === void 0) { options = {}; }
    var _a = options.timeout, timeout = _a === void 0 ? DEFAULT_TIMEOUT : _a, _b = options.enabled, enabled = _b === void 0 ? true : _b, onLock = options.onLock, onActivity = options.onActivity, _c = options.events, events = _c === void 0 ? DEFAULT_EVENTS : _c;
    var _d = (0, react_1.useState)({
        isLocked: false,
        timeUntilLock: Math.floor(timeout / 1000),
        lastActivity: new Date()
    }), state = _d[0], setState = _d[1];
    var timerRef = (0, react_1.useRef)(null);
    var countdownRef = (0, react_1.useRef)(null);
    // Reset activity timer
    var resetTimer = (0, react_1.useCallback)(function () {
        if (!enabled)
            return;
        // Clear existing timers
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }
        // Update last activity
        var now = new Date();
        setState(function (prev) { return (__assign(__assign({}, prev), { lastActivity: now, timeUntilLock: Math.floor(timeout / 1000) })); });
        // Start countdown
        countdownRef.current = setInterval(function () {
            setState(function (prev) { return (__assign(__assign({}, prev), { timeUntilLock: Math.max(0, prev.timeUntilLock - 1) })); });
        }, 1000);
        // Set lock timer
        timerRef.current = setTimeout(function () {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
            setState(function (prev) { return (__assign(__assign({}, prev), { isLocked: true, timeUntilLock: 0 })); });
            onLock === null || onLock === void 0 ? void 0 : onLock();
        }, timeout);
        onActivity === null || onActivity === void 0 ? void 0 : onActivity();
    }, [enabled, timeout, onLock, onActivity]);
    // Handle activity events
    var handleActivity = (0, react_1.useCallback)(function () {
        if (!state.isLocked) {
            resetTimer();
        }
    }, [state.isLocked, resetTimer]);
    // Unlock function
    var unlock = (0, react_1.useCallback)(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { isLocked: false, lastActivity: new Date(), timeUntilLock: Math.floor(timeout / 1000) })); });
        resetTimer();
    }, [resetTimer, timeout]);
    // Manual lock function
    var lock = (0, react_1.useCallback)(function () {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }
        setState(function (prev) { return (__assign(__assign({}, prev), { isLocked: true, timeUntilLock: 0 })); });
        onLock === null || onLock === void 0 ? void 0 : onLock();
    }, [onLock]);
    // Set up event listeners
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        events.forEach(function (event) {
            window.addEventListener(event, handleActivity, { passive: true });
        });
        // Start initial timer
        resetTimer();
        return function () {
            events.forEach(function (event) {
                window.removeEventListener(event, handleActivity);
            });
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [enabled, events, handleActivity, resetTimer]);
    // Format time remaining as MM:SS
    var formatTimeRemaining = function () {
        var minutes = Math.floor(state.timeUntilLock / 60);
        var seconds = state.timeUntilLock % 60;
        return "".concat(minutes.toString().padStart(2, '0'), ":").concat(seconds.toString().padStart(2, '0'));
    };
    return {
        isLocked: state.isLocked,
        timeUntilLock: state.timeUntilLock,
        timeUntilLockFormatted: formatTimeRemaining(),
        lastActivity: state.lastActivity,
        lock: lock,
        unlock: unlock,
        resetTimer: resetTimer
    };
}
exports.default = useAutoLock;
