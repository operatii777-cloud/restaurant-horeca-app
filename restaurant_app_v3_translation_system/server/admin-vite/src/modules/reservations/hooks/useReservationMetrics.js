"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReservationMetrics = useReservationMetrics;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
function buildMetricsEndpoint(filters) {
    var params = new URLSearchParams();
    if (filters.startDate) {
        params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
        params.append('endDate', filters.endDate);
    }
    var query = params.toString();
    return "/api/admin/reservations/metrics".concat(query ? "?\"Query\"" : '');
}
function useReservationMetrics(filters) {
    var endpoint = (0, react_1.useMemo)(function () { return buildMetricsEndpoint(filters); }, [filters]);
    var _a = (0, useApiQuery_1.useApiQuery)(endpoint), data = _a.data, loading = _a.loading, error = _a.error, refetch = _a.refetch;
    return {
        metrics: data,
        loading: loading,
        error: error,
        refetch: refetch,
    };
}
