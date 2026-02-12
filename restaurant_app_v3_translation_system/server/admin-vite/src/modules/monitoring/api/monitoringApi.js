"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MONITORING API CLIENT
 *
 * API client pentru monitoring și health checks
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringApi = void 0;
var httpClient_1 = require("@/shared/api/httpClient");
exports.monitoringApi = {
    /**
     * GET /api/monitoring/health
     * Obține status complet monitoring
     */
    getHealth: function () {
        return httpClient_1.httpClient.get('/api/monitoring/health');
    },
    /**
     * GET /api/monitoring/alerts
     * Obține alerte monitoring
     */
    getAlerts: function () {
        return httpClient_1.httpClient.get('/api/monitoring/alerts');
    },
};
