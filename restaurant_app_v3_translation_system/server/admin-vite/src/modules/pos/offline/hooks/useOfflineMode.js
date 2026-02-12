"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 3.B - Offline Mode Hook
 *
 * Detects offline status and provides UI state
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOfflineMode = useOfflineMode;
var react_1 = require("react");
var sync_engine_1 = require("../sync/sync.engine");
function useOfflineMode() {
    var _a = (0, react_1.useState)(!navigator.onLine), isOffline = _a[0], setIsOffline = _a[1];
    var _b = (0, react_1.useState)('idle'), syncStatus = _b[0], setSyncStatus = _b[1];
    (0, react_1.useEffect)(function () {
        var handleOnline = function () {
            setIsOffline(false);
            // Auto-sync when coming back online
            (0, sync_engine_1.startAutoSync)(30000);
        };
        var handleOffline = function () {
            setIsOffline(true);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        // Start auto-sync if online
        if ((0, sync_engine_1.isOnline)()) {
            (0, sync_engine_1.startAutoSync)(30000);
        }
        return function () {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return {
        isOffline: isOffline,
        syncStatus: syncStatus,
        setSyncStatus: setSyncStatus,
    };
}
