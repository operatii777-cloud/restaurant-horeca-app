"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRecipesSummary = useRecipesSummary;
var react_1 = require("react");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
function useRecipesSummary() {
    var _a = (0, useApiQuery_1.useApiQuery)('/api/recipes/all'), data = _a.data, loading = _a.loading, error = _a.error, refetch = _a.refetch;
    var products = (0, react_1.useMemo)(function () {
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.products)) {
            return data.products;
        }
        return [];
    }, [data]);
    var withRecipe = (0, react_1.useMemo)(function () { return products.filter(function (product) { return product.recipe_count > 0; }).length; }, [products]);
    var withoutRecipe = (0, react_1.useMemo)(function () { return products.length - withRecipe; }, [products, withRecipe]);
    return {
        products: products,
        loading: loading,
        error: error,
        refetch: refetch,
        stats: {
            total: products.length,
            withRecipe: withRecipe,
            withoutRecipe: withoutRecipe,
        },
    };
}
