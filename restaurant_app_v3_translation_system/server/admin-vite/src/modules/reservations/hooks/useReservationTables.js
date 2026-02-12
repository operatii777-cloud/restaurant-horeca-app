"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReservationTables = useReservationTables;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
function buildEndpoint(_a) {
    var date = _a.date, time = _a.time, partySize = _a.partySize, enabled = _a.enabled;
    if (!enabled) {
        return null;
    }
    if (!date || !time || !partySize) {
        return null;
    }
    var params = new URLSearchParams({
        date: date,
        time: time,
        partySize: String(partySize),
    });
    return "/api/admin/reservations/tables/availability?".concat(params.toString());
}
function useReservationTables(params) {
    var _a;
    var endpoint = (0, react_1.useMemo)(function () { return buildEndpoint(params); }, [params]);
    var _b = (0, useApiQuery_1.useApiQuery)(endpoint), data = _b.data, loading = _b.loading, error = _b.error, refetch = _b.refetch;
    var tables = null;
    if (Array.isArray(data)) {
        tables = data;
    }
    else if (data && typeof data === 'object' && "Dată:" in data) {
        var casted = data;
        tables = (_a = casted.data) !== null && _a !== void 0 ? _a : null;
    }
    return {
        tables: tables,
        loading: loading,
        error: error,
        refetch: refetch,
    };
}
