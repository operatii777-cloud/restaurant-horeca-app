"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * USE ALERTS HOOK
 *
 * Hook React pentru primire alerte real-time via Socket.IO
 * ═══════════════════════════════════════════════════════════════════════════
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
exports.useAlerts = useAlerts;
var react_1 = require("react");
var socketClient_1 = require("@/core/sockets/socketClient");
function useAlerts() {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), alerts = _a[0], setAlerts = _a[1];
    var _b = (0, react_1.useState)(false), isConnected = _b[0], setIsConnected = _b[1];
    (0, react_1.useEffect)(function () {
        var socket = (0, socketClient_1.getSocket)();
        // Check initial connection status
        setIsConnected(socket.connected);
        // Listen for connection
        socket.on('connect', function () {
            setIsConnected(true);
        });
        // Listen for disconnection
        socket.on('disconnect', function () {
            setIsConnected(false);
        });
        // Listen for alerts
        var handleAlert = function (alert) {
            setAlerts(function (prev) {
                // Add to beginning, keep max 100 alerts
                var newAlerts = __spreadArray([alert], prev, true);
                return newAlerts.slice(0, 100);
            });
        };
        socket.on('alert', handleAlert);
        // Cleanup
        return function () {
            socket.off('alert', handleAlert);
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);
    var clearAlerts = (0, react_1.useCallback)(function () {
        setAlerts([]);
    }, []);
    var removeAlert = (0, react_1.useCallback)(function (index) {
        setAlerts(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    }, []);
    var getCriticalAlerts = (0, react_1.useCallback)(function () {
        return alerts.filter(function (a) { return a.severity === 'CRITICAL'; });
    }, [alerts]);
    var getWarningAlerts = (0, react_1.useCallback)(function () {
        return alerts.filter(function (a) { return a.severity === 'WARNING'; });
    }, [alerts]);
    var getInfoAlerts = (0, react_1.useCallback)(function () {
        return alerts.filter(function (a) { return a.severity === 'INFO'; });
    }, [alerts]);
    return {
        alerts: alerts,
        isConnected: isConnected,
        clearAlerts: clearAlerts,
        removeAlert: removeAlert,
        getCriticalAlerts: getCriticalAlerts,
        getWarningAlerts: getWarningAlerts,
        getInfoAlerts: getInfoAlerts,
        criticalCount: getCriticalAlerts().length,
        warningCount: getWarningAlerts().length,
        infoCount: getInfoAlerts().length,
        totalCount: alerts.length,
    };
}
