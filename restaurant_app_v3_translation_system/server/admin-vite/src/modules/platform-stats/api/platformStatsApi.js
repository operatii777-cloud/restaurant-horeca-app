"use strict";
/**
 * PLATFORM STATISTICS API CLIENT
 *
 * API client pentru statistici per platformă
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformStatsApi = void 0;
var httpClient_1 = require("@/shared/api/httpClient");
// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════════════
exports.platformStatsApi = {
    /**
     * GET /api/platform-stats/platforms
     * Obține lista tuturor platformelor cu statistici
     */
    getPlatforms: function (params) {
        return httpClient_1.httpClient.get('/api/platform-stats/platforms', { params: params });
    },
    /**
     * GET /api/platform-stats/:platform/overview
     * Statistici generale pentru o platformă
     */
    getPlatformOverview: function (platform, params) {
        return httpClient_1.httpClient.get("/api/platform-stats/\"Platform\"/overview", { params: params });
    },
    /**
     * GET /api/platform-stats/:platform/trends
     * Trenduri pe perioade de timp
     */
    getPlatformTrends: function (platform, params) {
        return httpClient_1.httpClient.get("/api/platform-stats/\"Platform\"/trends", { params: params });
    },
    /**
     * GET /api/platform-stats/:platform/top-products
     * Top produse pentru o platformă
     */
    getPlatformTopProducts: function (platform, params) {
        return httpClient_1.httpClient.get("/api/platform-stats/\"Platform\"/top-products", { params: params });
    },
    /**
     * GET /api/platform-stats/compare
     * Comparație între platforme
     */
    comparePlatforms: function (params) {
        return httpClient_1.httpClient.get('/api/platform-stats/compare', { params: params });
    },
    /**
     * GET /api/platform-stats/:platform/hourly
     * Statistici pe ore
     */
    getPlatformHourly: function (platform, params) {
        return httpClient_1.httpClient.get("/api/platform-stats/\"Platform\"/hourly", { params: params });
    },
};
