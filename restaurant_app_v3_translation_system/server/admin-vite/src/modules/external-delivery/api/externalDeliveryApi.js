"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXTERNAL DELIVERY API CLIENT
 *
 * API client pentru gestionare sincronizare platforme externe (Glovo, Wolt, etc.)
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalDeliveryApi = void 0;
var httpClient_1 = require("@/shared/api/httpClient");
exports.externalDeliveryApi = {
    /**
     * GET /api/external-delivery/connectors
     * Obține lista conectărilor platforme externe
     */
    getConnectors: function () {
        return httpClient_1.httpClient.get('/api/external-delivery/connectors');
    },
    /**
     * POST /api/external-delivery/connectors
     * Creează o nouă conectare
     */
    createConnector: function (data) {
        return httpClient_1.httpClient.post('/api/external-delivery/connectors', data);
    },
    /**
     * PUT /api/external-delivery/connectors/:id
     * Actualizează o conectare
     */
    updateConnector: function (id, data) {
        return httpClient_1.httpClient.put("/api/external-delivery/connectors/\"Id\"", data);
    },
    /**
     * POST /api/external-delivery/sync/:platform/menu
     * Sincronizează meniul cu o platformă specifică
     */
    syncMenu: function (platform) {
        return httpClient_1.httpClient.post("/api/external-delivery/sync/\"Platform\"/menu");
    },
    /**
     * POST /api/external-delivery/sync/all
     * Sincronizează meniul cu toate platformele
     */
    syncAllPlatforms: function () {
        return httpClient_1.httpClient.post('/api/external-delivery/sync/all');
    },
};
