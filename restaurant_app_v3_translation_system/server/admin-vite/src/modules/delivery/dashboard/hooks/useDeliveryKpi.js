"use strict";
/**
 * S17.H - Delivery KPI Hooks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeliveryOverview = useDeliveryOverview;
exports.useDeliveryByCourier = useDeliveryByCourier;
exports.useDeliveryTimeseries = useDeliveryTimeseries;
exports.useDeliveryHeatmap = useDeliveryHeatmap;
var react_query_1 = require("@tanstack/react-query");
var deliveryKpi_api_1 = require("../api/deliveryKpi.api");
function useDeliveryOverview(filters) {
    if (filters === void 0) { filters = {}; }
    return (0, react_query_1.useQuery)({
        queryKey: ['delivery-kpi', 'overview', filters],
        queryFn: function () { return (0, deliveryKpi_api_1.fetchDeliveryOverview)(filters); },
        staleTime: 30000 // 30 seconds
    });
}
function useDeliveryByCourier(filters) {
    if (filters === void 0) { filters = {}; }
    return (0, react_query_1.useQuery)({
        queryKey: ['delivery-kpi', 'by-courier', filters],
        queryFn: function () { return (0, deliveryKpi_api_1.fetchDeliveryByCourier)(filters); },
        staleTime: 30000
    });
}
function useDeliveryTimeseries(filters) {
    if (filters === void 0) { filters = {}; }
    return (0, react_query_1.useQuery)({
        queryKey: ['delivery-kpi', 'timeseries', filters],
        queryFn: function () { return (0, deliveryKpi_api_1.fetchDeliveryTimeseries)(filters); },
        staleTime: 30000
    });
}
function useDeliveryHeatmap(filters) {
    if (filters === void 0) { filters = {}; }
    return (0, react_query_1.useQuery)({
        queryKey: ['delivery-kpi', 'heatmap', filters],
        queryFn: function () { return (0, deliveryKpi_api_1.fetchDeliveryHourlyHeatmap)(filters); },
        staleTime: 30000
    });
}
