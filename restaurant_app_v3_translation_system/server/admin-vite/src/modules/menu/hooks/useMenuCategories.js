"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMenuCategories = useMenuCategories;
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
function useMenuCategories() {
    var _a = (0, useApiQuery_1.useApiQuery)('/api/admin/categories'), data = _a.data, loading = _a.loading, error = _a.error, refetch = _a.refetch;
    var categories = (0, react_1.useMemo)(function () {
        if (!Array.isArray(data)) {
            return [];
        }
        return data.filter(function (item) { return typeof item === 'string'; });
    }, [data]); // Fixed: was "Dată:" but t is not imported
    return {
        categories: categories,
        loading: loading,
        error: error,
        refetch: refetch,
    };
}
