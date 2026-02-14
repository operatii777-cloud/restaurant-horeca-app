"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRecipeDetails = useRecipeDetails;
var react_1 = require("react");
// import { useTranslation } from '@/i18n/I18nContext';
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
function useRecipeDetails(productId, isOpen) {
    var _a;
    //   const { t } = useTranslation();
    var endpoint = (0, react_1.useMemo)(function () {
        if (!productId || !isOpen) {
            return null;
        }
        return "/api/recipes/product/".concat(productId);
    }, [productId, isOpen]);
    var _b = (0, useApiQuery_1.useApiQuery)(endpoint), data = _b.data, loading = _b.loading, error = _b.error, refetch = _b.refetch;
    var ingredients = (0, react_1.useMemo)(function () {
        if (!data || !Array.isArray(data.recipes)) {
            return [];
        }
        return data.recipes.map(function (recipe) {
            var _a, _b, _c, _d, _e;
            return ({
                id: recipe.id,
                ingredient_id: recipe.ingredient_id,
                ingredient_name: recipe.ingredient_name,
                quantity_needed: recipe.quantity_needed,
                unit: (_b = (_a = recipe.unit) !== null && _a !== void 0 ? _a : recipe.ingredient_unit) !== null && _b !== void 0 ? _b : null,
                waste_percentage: (_c = recipe.waste_percentage) !== null && _c !== void 0 ? _c : 0,
                variable_consumption: (_d = recipe.variable_consumption) !== null && _d !== void 0 ? _d : null,
                item_type: (_e = recipe.item_type) !== null && _e !== void 0 ? _e : 'ingredient',
            });
        });
    }, [data]);
    return {
        productName: (_a = data === null || data === void 0 ? void 0 : data.productName) !== null && _a !== void 0 ? _a : '',
        ingredients: ingredients,
        loading: loading,
        error: error,
        refetch: refetch,
    };
}
