"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInterfacePins = void 0;
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var PINS_ENDPOINT = '/api/admin/pins';
var useInterfacePins = function () {
    var _a = (0, useApiQuery_1.useApiQuery)(PINS_ENDPOINT), data = _a.data, loading = _a.loading, error = _a.error, refetch = _a.refetch;
    var pins = (0, react_1.useMemo)(function () {
        if (!data) {
            return [];
        }
        if (Array.isArray(data.pins)) {
            return data.pins;
        }
        return [];
    }, [data]);
    return {
        pins: pins,
        loading: loading,
        error: error,
        refresh: refetch,
    };
};
exports.useInterfacePins = useInterfacePins;
