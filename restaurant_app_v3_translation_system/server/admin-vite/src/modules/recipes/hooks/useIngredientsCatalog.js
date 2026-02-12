"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIngredientsCatalog = useIngredientsCatalog;
var react_1 = require("react");
// import { useTranslation } from '@/i18n/I18nContext';
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
function useIngredientsCatalog(showHidden) {
    if (showHidden === void 0) { showHidden = false; }
    //   const { t } = useTranslation();
    // ✅ Folosește ingredient_catalog (catalog activ) în loc de ingredients (legacy)
    var endpoint = (0, react_1.useMemo)(function () { return "/api/ingredient-catalog".concat(showHidden ? '?show_hidden=true' : ''); }, [showHidden]);
    var _a = (0, useApiQuery_1.useApiQuery)(endpoint), data = _a.data, loading = _a.loading, error = _a.error, refetch = _a.refetch;
    var ingredients = (0, react_1.useMemo)(function () {
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.ingredients)) {
            return data.ingredients;
        }
        if (data && Array.isArray(data.data)) {
            return data.data;
        }
        return [];
    }, [data]);
    return {
        ingredients: ingredients,
        loading: loading,
        error: error,
        refetch: refetch,
    };
}
