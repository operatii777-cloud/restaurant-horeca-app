"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXECUTIVE DASHBOARD API CLIENT
 *
 * API client pentru dashboard executive cu KPI-uri critice
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executiveDashboardApi = void 0;
var httpClient_1 = require("@/shared/api/httpClient");
exports.executiveDashboardApi = {
    /**
     * GET /api/executive-dashboard/metrics
     * Obține KPI-uri principale pentru dashboard executive
     */
    getMetrics: function (params) {
        return httpClient_1.httpClient.get('/api/executive-dashboard/metrics', { params: params });
    },
    /**
     * GET /api/executive-dashboard/stock-value
     * Obține valoarea stocului actual
     */
    getStockValue: function () {
        return httpClient_1.httpClient.get('/api/executive-dashboard/stock-value');
    },
};
