"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeEditorModal = RecipeEditorModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var useRecipeDetails_1 = require("@/modules/recipes/hooks/useRecipeDetails");
var useIngredientsCatalog_1 = require("@/modules/recipes/hooks/useIngredientsCatalog");
var httpClient_1 = require("@/shared/api/httpClient");
var RecipeVersionHistory_1 = require("./RecipeVersionHistory");
var NutritionSearchModal_1 = require("./NutritionSearchModal");
var unitConverter_1 = require("../utils/unitConverter");
require("./RecipeEditorModal.css");
var EMPTY_ROW = {
    name: '',
    quantity: '',
    unit: '',
    wastePercentage: '0',
    variableConsumption: '',
    itemType: 'ingredient',
};
function RecipeEditorModal(_a) {
    var _this = this;
    var _b;
    var open = _a.open, product = _a.product, onClose = _a.onClose, onSaved = _a.onSaved;
    //   const { t } = useTranslation();
    console.log('RecipeEditorModal Render - open:', open, 'product:', product);
    var productId = (_b = product === null || product === void 0 ? void 0 : product.product_id) !== null && _b !== void 0 ? _b : null;
    var _c = (0, useRecipeDetails_1.useRecipeDetails)(productId, open), productName = _c.productName, ingredients = _c.ingredients, loading = _c.loading, error = _c.error, refetch = _c.refetch;
    console.log('RecipeEditorModal productId:', productId, 'productName:', productName, 'ingredients:', ingredients.length);
    var catalogIngredients = (0, useIngredientsCatalog_1.useIngredientsCatalog)().ingredients;
    var _d = (0, useApiMutation_1.useApiMutation)(), mutate = _d.mutate, saving = _d.loading, saveError = _d.error, reset = _d.reset;
    var _e = (0, react_1.useState)([]), rows = _e[0], setRows = _e[1];
    var _f = (0, react_1.useState)(null), localError = _f[0], setLocalError = _f[1];
    var _g = (0, react_1.useState)(null), suggestedPrice = _g[0], setSuggestedPrice = _g[1];
    var _h = (0, react_1.useState)(false), priceLoading = _h[0], setPriceLoading = _h[1];
    // ✅ Servings state
    var _j = (0, react_1.useState)(1), servings = _j[0], setServings = _j[1];
    var _k = (0, react_1.useState)(false), servingsLoading = _k[0], setServingsLoading = _k[1];
    // ✅ SĂPTĂMÂNA 1 - ZIUA 2: Fetch preparations (sub-rețete)
    var _l = (0, react_1.useState)([]), preparations = _l[0], setPreparations = _l[1];
    var _m = (0, react_1.useState)(false), preparationsLoading = _m[0], setPreparationsLoading = _m[1];
    // ✅ TASK 3: Recipe Versioning
    var _o = (0, react_1.useState)(false), versionHistoryOpen = _o[0], setVersionHistoryOpen = _o[1];
    var _p = (0, react_1.useState)(''), changeDescription = _p[0], setChangeDescription = _p[1];
    var _q = (0, react_1.useState)(''), changeReason = _q[0], setChangeReason = _q[1];
    var _r = (0, react_1.useState)(null), recipeId = _r[0], setRecipeId = _r[1];
    // ✅ Nutrition Search & Auto-calculation
    var _s = (0, react_1.useState)(false), nutritionSearchOpen = _s[0], setNutritionSearchOpen = _s[1];
    var _t = (0, react_1.useState)(null), calculatedNutrition = _t[0], setCalculatedNutrition = _t[1];
    var _u = (0, react_1.useState)(false), nutritionLoading = _u[0], setNutritionLoading = _u[1];
    /**
     * Încarcă servings-ul pentru produs
     */
    var fetchServingsFromProduct = function (productId) { return __awaiter(_this, void 0, void 0, function () {
        var response, productData, productServings, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setServingsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/catalog-produse/products/".concat(productId))];
                case 2:
                    response = _b.sent();
                    productData = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data;
                    productServings = (productData === null || productData === void 0 ? void 0 : productData.servings) || (product === null || product === void 0 ? void 0 : product.servings) || 1;
                    setServings(productServings);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error fetching servings:', error_1);
                    // Fallback la valoarea din product sau 1
                    setServings((product === null || product === void 0 ? void 0 : product.servings) || 1);
                    return [3 /*break*/, 5];
                case 4:
                    setServingsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Salvează servings-ul pentru produs
     */
    var saveServingsToProduct = function (productId, newServings) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.patch("/api/catalog-produse/products/".concat(productId), {
                            servings: newServings
                        })];
                case 1:
                    _a.sent();
                    console.log("Servings saved: ".concat(newServings, " for product ").concat(productId));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error saving servings:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (open) {
            // ✅ TASK 3: Get recipe_id for versioning
            if (productId) {
                httpClient_1.httpClient
                    .get("/api/recipes/product/".concat(productId))
                    .then(function (response) {
                    var _a, _b, _c;
                    var recipes = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || response.data || [];
                    if (Array.isArray(recipes) && recipes.length > 0) {
                        var firstRecipeId = ((_b = recipes[0]) === null || _b === void 0 ? void 0 : _b.id) || ((_c = recipes[0]) === null || _c === void 0 ? void 0 : _c.recipe_id);
                        if (firstRecipeId) {
                            setRecipeId(firstRecipeId);
                        }
                    }
                })
                    .catch(function (err) {
                    console.error('Error fetching recipe for versioning:', err);
                });
            }
            // Fetch preparations (DEBUG ADDED)
            setPreparationsLoading(true);
            fetch('/api/recipes/preparations')
                .then(function (res) { return res.json(); })
                .then(function (data) {
                console.log('RecipeEditorModal: Fetched preparations:', data);
                if (data && data.preparations && Array.isArray(data.preparations)) {
                    setPreparations(data.preparations);
                }
                else if (Array.isArray(data)) {
                    setPreparations(data);
                }
                else {
                    console.warn('RecipeEditorModal: Unexpected preparations data format', data);
                    setPreparations([]);
                }
            })
                .catch(function (err) {
                console.error('RecipeEditorModal: Error fetching preparations:', err);
                setPreparations([]);
            })
                .finally(function () { return setPreparationsLoading(false); });
            // Fetch servings from product
            if (productId) {
                fetchServingsFromProduct(productId);
            }
            else {
                setServings((product === null || product === void 0 ? void 0 : product.servings) || 1);
            }
        }
    }, [open, productId, product]);
    (0, react_1.useEffect)(function () {
        if (open) {
            reset();
            setLocalError(null);
            setSuggestedPrice(null);
            if (ingredients.length > 0) {
                setRows(ingredients.map(function (ingredient) {
                    var _a, _b, _c;
                    // ✅ Detectează dacă e sub-rețetă sau ingredient
                    var raw = ingredient;
                    var isSubRecipe = raw.recipe_id || raw.sub_recipe_name;
                    var itemType = isSubRecipe
                        ? 'recipe'
                        : ((_a = ingredient.item_type) !== null && _a !== void 0 ? _a : 'ingredient');
                    return {
                        name: isSubRecipe ? (raw.sub_recipe_name || raw.ingredient_name || '') : (ingredient.ingredient_name || ''),
                        ingredientId: ingredient.ingredient_id || undefined,
                        recipeId: raw.recipe_id || undefined, // ✅ Sub-rețetă
                        quantity: ingredient.quantity_needed ? String(ingredient.quantity_needed) : '',
                        unit: (_b = ingredient.unit) !== null && _b !== void 0 ? _b : '',
                        wastePercentage: ingredient.waste_percentage ? String(ingredient.waste_percentage) : '0',
                        variableConsumption: (_c = ingredient.variable_consumption) !== null && _c !== void 0 ? _c : '',
                        itemType: itemType,
                    };
                }));
            }
            else {
                setRows([]);
            }
        }
    }, [open, ingredients, reset]);
    var catalogOptions = (0, react_1.useMemo)(function () {
        var byName = new Map();
        catalogIngredients.forEach(function (ingredient) {
            var _a;
            byName.set(ingredient.name.toLowerCase(), {
                id: ingredient.id,
                unit: (_a = ingredient.unit) !== null && _a !== void 0 ? _a : '',
            });
        });
        return byName;
    }, [catalogIngredients]);
    var catalogList = (0, react_1.useMemo)(function () {
        return catalogIngredients.map(function (ingredient) { return ({
            id: ingredient.id,
            name: ingredient.name,
        }); });
    }, [catalogIngredients]);
    var handleRowChange = function (index, field, value) {
        setRows(function (prev) {
            var _a;
            var next = __spreadArray([], prev, true);
            next[index] = __assign(__assign({}, next[index]), (_a = {}, _a[field] = value, _a));
            return next;
        });
    };
    var handleIngredientNameChange = function (index, value) {
        var matched = catalogOptions.get(value.trim().toLowerCase());
        setRows(function (prev) {
            var next = __spreadArray([], prev, true);
            next[index] = __assign(__assign({}, next[index]), { name: value, ingredientId: matched === null || matched === void 0 ? void 0 : matched.id, unit: (matched === null || matched === void 0 ? void 0 : matched.unit) || next[index].unit });
            return next;
        });
    };
    var handleAddRow = function (itemType) {
        if (itemType === void 0) { itemType = 'ingredient'; }
        setRows(function (prev) { return __spreadArray(__spreadArray([], prev, true), [__assign(__assign({}, EMPTY_ROW), { itemType: itemType })], false); });
    };
    var handleRemoveRow = function (index) {
        setRows(function (prev) {
            if (prev.length === 1) {
                return prev;
            }
            var next = __spreadArray([], prev, true);
            next.splice(index, 1);
            return next;
        });
    };
    var handleItemTypeChange = function (index, value) {
        setRows(function (prev) {
            var next = __spreadArray([], prev, true);
            next[index] = __assign(__assign({}, next[index]), { itemType: value, wastePercentage: value === 'packaging' ? '0' : next[index].wastePercentage, 
                // ✅ Clear recipeId/ingredientId când schimbăm tipul
                recipeId: value === 'recipe' ? next[index].recipeId : undefined, ingredientId: value === 'recipe' ? undefined : next[index].ingredientId, name: value === 'recipe' ? '' : next[index].name });
            return next;
        });
    };
    // ✅ Handler pentru selectare preparation (sub-rețetă)
    var handlePreparationChange = function (index, preparationId) {
        var preparation = preparations.find(function (p) { return p.id === preparationId; });
        if (preparation) {
            setRows(function (prev) {
                var next = __spreadArray([], prev, true);
                next[index] = __assign(__assign({}, next[index]), { name: preparation.name, recipeId: preparation.id, ingredientId: undefined });
                return next;
            });
        }
    };
    var handleRefetch = function () {
        refetch();
    };
    var validateRecipe = function () {
        var errors = [];
        if (rows.length === 0) {
            errors.push('Rețeta trebuie să conțină cel puțin un ingredient.');
        }
        rows.forEach(function (row, index) {
            if (!row.name || row.name.trim() === '') {
                errors.push("R\u00E2ndul ".concat(index + 1, ": Numele ingredientului este obligatoriu."));
            }
            if (!row.quantity || parseFloat(row.quantity) <= 0) {
                errors.push("R\u00E2ndul ".concat(index + 1, ": Cantitatea trebuie s\u0103 fie mai mare dec\u00E2t 0."));
            }
            if (!row.unit || row.unit.trim() === '') {
                errors.push("R\u00E2ndul ".concat(index + 1, ": Unitatea de m\u0103sur\u0103 este obligatorie."));
            }
            if (row.itemType === 'ingredient' && !row.ingredientId && !catalogOptions.has(row.name.trim().toLowerCase())) {
                errors.push("R\u00E2ndul ".concat(index + 1, ": Ingredientul \"").concat(row.name, "\" nu exist\u0103 \u00EEn catalog."));
            }
            if (row.itemType === 'recipe' && !row.recipeId) {
                errors.push("R\u00E2ndul ".concat(index + 1, ": Sub-re\u021Beta trebuie s\u0103 fie selectat\u0103."));
            }
            var wastePercent = parseFloat(row.wastePercentage) || 0;
            if (wastePercent < 0 || wastePercent > 100) {
                errors.push("R\u00E2ndul ".concat(index + 1, ": Procentul de waste trebuie s\u0103 fie \u00EEntre 0 \u0219i 100."));
            }
        });
        return { valid: errors.length === 0, errors: errors };
    };
    var handleCalculateNutrition = function () { return __awaiter(_this, void 0, void 0, function () {
        var ingredients_1, response, calculateError_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!productId || rows.length === 0) {
                        return [2 /*return*/];
                    }
                    setNutritionLoading(true);
                    setCalculatedNutrition(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    ingredients_1 = rows
                        .filter(function (row) { return row.itemType === 'ingredient' && row.ingredientId && row.quantity && row.unit; })
                        .map(function (row) {
                        var quantity = parseFloat(row.quantity) || 0;
                        var quantityInGrams = (0, unitConverter_1.canConvertToGrams)(row.unit)
                            ? (0, unitConverter_1.convertToGrams)(quantity, row.unit)
                            : quantity; // If can't convert, use as-is
                        return {
                            ingredient_id: row.ingredientId,
                            quantity: quantityInGrams,
                            unit: 'g', // Always use grams for nutrition calculation
                            waste_percentage: parseFloat(row.wastePercentage) || 0,
                        };
                    });
                    if (ingredients_1.length === 0) {
                        setLocalError('Nu există ingrediente valide pentru calcul nutrițional.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/recipes/calculate-nutrition', {
                            product_id: productId,
                            ingredients: ingredients_1,
                            servings: servings,
                        })];
                case 2:
                    response = _d.sent();
                    if (response.data && response.data.success) {
                        setCalculatedNutrition(response.data.nutrition);
                    }
                    else {
                        setLocalError(((_a = response.data) === null || _a === void 0 ? void 0 : _a.error) || 'Nu s-a putut calcula nutriția.');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    calculateError_1 = _d.sent();
                    console.error('Error calculating nutrition:', calculateError_1);
                    setLocalError(((_c = (_b = calculateError_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Eroare la calcularea nutriției.');
                    return [3 /*break*/, 5];
                case 4:
                    setNutritionLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleNutritionSelect = function (nutrition) {
        // When user selects an ingredient from nutrition search, we can use it to populate a row
        console.log('Selected nutrition:', nutrition);
    };
    var handleCalculateSuggestedPrice = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, calculateError_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!productId) {
                        return [2 /*return*/];
                    }
                    setPriceLoading(true);
                    setSuggestedPrice(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/recipes/suggested-price/".concat(productId))];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    if (data && data.success) {
                        setSuggestedPrice({
                            value: Number(data.suggested_price),
                            totalCost: Number(data.total_cost),
                            margin: Number(data.margin_percentage),
                        });
                    }
                    else {
                        setLocalError((_a = data === null || data === void 0 ? void 0 : data.error) !== null && _a !== void 0 ? _a : 'Nu s-a putut calcula prețul sugestiv.');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    calculateError_2 = _b.sent();
                    setLocalError(calculateError_2.message);
                    return [3 /*break*/, 6];
                case 5:
                    setPriceLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var validation, autoCreated, sanitized, payload, response, recipeResponse, recipes, firstRecipeId, versionError_1, uniqueCreated;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    event.preventDefault();
                    if (!productId) {
                        return [2 /*return*/];
                    }
                    validation = validateRecipe();
                    if (!validation.valid) {
                        setLocalError(validation.errors.join('\n'));
                        return [2 /*return*/];
                    }
                    autoCreated = [];
                    sanitized = rows
                        .map(function (row) {
                        var _a;
                        var quantityNumber = Number(row.quantity);
                        var matched = catalogOptions.get(row.name.trim().toLowerCase());
                        if (!matched && !row.ingredientId && row.name.trim()) {
                            autoCreated.push(row.name.trim());
                        }
                        return {
                            name: row.name.trim(),
                            quantity: quantityNumber,
                            unit: row.unit.trim() || (row.itemType === 'recipe' ? 'buc' : (matched === null || matched === void 0 ? void 0 : matched.unit) || 'g'),
                            waste_percentage: row.wastePercentage ? Number(row.wastePercentage) : 0,
                            variable_consumption: row.variableConsumption ? row.variableConsumption.trim() : undefined,
                            item_type: row.itemType,
                            ingredient_id: row.itemType === 'recipe' ? undefined : ((_a = matched === null || matched === void 0 ? void 0 : matched.id) !== null && _a !== void 0 ? _a : row.ingredientId),
                            recipe_id: row.itemType === 'recipe' ? row.recipeId : undefined, // ✅ Sub-rețetă
                        };
                    })
                        .filter(function (row) { return row.name && row.quantity && row.quantity > 0; });
                    if (sanitized.length === 0) {
                        setLocalError('Adaugă cel puțin un ingredient cu cantitate > 0.');
                        return [2 /*return*/];
                    }
                    payload = {
                        ingredients: sanitized.map(function (ingredient) {
                            var _a, _b, _c;
                            return ({
                                name: ingredient.name,
                                quantity: ingredient.quantity,
                                unit: ingredient.unit,
                                waste_percentage: ingredient.waste_percentage,
                                variable_consumption: (_a = ingredient.variable_consumption) !== null && _a !== void 0 ? _a : null,
                                item_type: ingredient.item_type,
                                ingredient_id: (_b = ingredient.ingredient_id) !== null && _b !== void 0 ? _b : undefined,
                                recipe_id: (_c = ingredient.recipe_id) !== null && _c !== void 0 ? _c : undefined, // ✅ Sub-rețetă
                            });
                        }),
                    };
                    return [4 /*yield*/, mutate({
                            url: "/api/recipes/product/".concat(productId),
                            method: 'put',
                            data: payload,
                        })];
                case 1:
                    response = _f.sent();
                    if (!(response !== null)) return [3 /*break*/, 8];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/recipes/product/".concat(productId))];
                case 3:
                    recipeResponse = _f.sent();
                    recipes = ((_a = recipeResponse.data) === null || _a === void 0 ? void 0 : _a.data) || recipeResponse.data || [];
                    if (!(Array.isArray(recipes) && recipes.length > 0)) return [3 /*break*/, 5];
                    firstRecipeId = ((_b = recipes[0]) === null || _b === void 0 ? void 0 : _b.id) || ((_c = recipes[0]) === null || _c === void 0 ? void 0 : _c.recipe_id);
                    if (!firstRecipeId) return [3 /*break*/, 5];
                    setRecipeId(firstRecipeId);
                    // Create version snapshot
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/admin/recipes/".concat(firstRecipeId, "/versions"), {
                            change_description: changeDescription || 'Salvare rețetă',
                            change_reason: changeReason || 'Actualizare rețetă',
                            changed_by: 'user', // TODO: Get from auth context
                        })];
                case 4:
                    // Create version snapshot
                    _f.sent();
                    _f.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    versionError_1 = _f.sent();
                    console.error('Error creating recipe version:', versionError_1);
                    return [3 /*break*/, 7];
                case 7:
                    uniqueCreated = Array.from(new Set(autoCreated));
                    if (uniqueCreated.length > 0) {
                        onSaved("".concat((_d = response.message) !== null && _d !== void 0 ? _d : 'Rețetă actualizată cu succes.', " Ingredientele noi (").concat(uniqueCreated.join(', '), ") au fost ad\u0103ugate automat \u00EEn catalog."));
                    }
                    else {
                        onSaved((_e = response.message) !== null && _e !== void 0 ? _e : 'Rețetă actualizată cu succes.');
                    }
                    _f.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var modalTitle = product ? "Editor re\u021Bet\u0103 \u2014 ".concat(product.product_name) : 'Editor rețetă';
    return (<div className="recipe-editor-modal-wrapper">
      <Modal_1.Modal isOpen={open} title={modalTitle} size="full" onClose={onClose} draggable={true}>
        {localError ? <InlineAlert_1.InlineAlert variant="warning" title="Atenție" message={localError}/> : null}
        {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}
        {saveError ? <InlineAlert_1.InlineAlert variant="error" title="Eroare salvare" message={saveError}/> : null}
        {suggestedPrice ? (<InlineAlert_1.InlineAlert variant="success" title="pret sugestiv" message={"Recomandare: ".concat(suggestedPrice.value.toFixed(2), " RON \u00B7 Cost total ").concat(suggestedPrice.totalCost.toFixed(2), " RON \u00B7 Marj\u0103 ").concat(suggestedPrice.margin.toFixed(1), "%")}/>) : null}

        <div className="recipe-editor-header">
          <div>
            <div className="recipe-editor-product">{productName || (product === null || product === void 0 ? void 0 : product.product_name)}</div>
            <div className="recipe-editor-meta">
              {(product === null || product === void 0 ? void 0 : product.product_category) ? "Categorie: ".concat(product.product_category) : 'Categorie necunoscută'}
            </div>
            {/* ✅ SĂPTĂMÂNA 1 - ZIUA 4: Yield Configuration */}
            <div className="recipe-yield-config" style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span>Servings (Portions):</span>
                <input type="number" min="1" value={servings} disabled={servingsLoading || !productId} style={{ width: '60px', padding: '0.25rem' }} onChange={function (e) { return __awaiter(_this, void 0, void 0, function () {
            var newServings, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newServings = parseInt(e.target.value) || 1;
                        setServings(newServings);
                        if (!(productId && newServings > 0)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, saveServingsToProduct(productId, newServings)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error saving servings:', error_3);
                        // Revert on error
                        setServings((product === null || product === void 0 ? void 0 : product.servings) || 1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }}/>
                {servingsLoading && <span className="spinner-border spinner-border-sm"/>}
              </label>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                Cost per serving: {suggestedPrice ? (suggestedPrice.totalCost / servings).toFixed(2) : 'N/A'} RON
              </div>
            </div>
          </div>
          <div className="recipe-editor-actions">
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={handleRefetch} disabled={loading}>
              🔄 Reîncarcă
            </button>
            <button type="button" className="menu-product-button menu-product-button--secondary" onClick={handleCalculateSuggestedPrice} disabled={priceLoading}>
              {priceLoading ? 'Se calculează…' : '💰 Preț sugestiv'}
            </button>
            {/* ✅ Nutrition Search Button */}
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={function () { return setNutritionSearchOpen(true); }} title="cauta date nutritionale">
              🔍 Nutriție
            </button>
            {/* ✅ Auto-calculate Nutrition Button */}
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={handleCalculateNutrition} disabled={nutritionLoading || rows.length === 0} title="calculeaza automat valorile nutritionale din ingre">
              {nutritionLoading ? 'Se calculează…' : '⚡ Auto Nutriție'}
            </button>
            {/* ✅ TASK 3: Version History Button */}
            {recipeId && (<button type="button" className="menu-product-button menu-product-button--ghost" onClick={function () { return setVersionHistoryOpen(true); }} title="istoric versiuni reteta">
                📜 Versiuni
              </button>)}
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose}>Închide</button>
          </div>
        </div>

        <form className="recipe-editor-form" onSubmit={handleSubmit}>
          <div className="recipe-editor-table">
            <div className="recipe-editor-table-header">
              <span>#</span>
              <span>Ingredient</span>
              <span>Cantitate</span>
              <span>Unitate</span>
              <span>Waste %</span>
              <span>Tip</span>
              <span>Consum variabil / observații</span>
              <span />
            </div>
            {rows.map(function (row, index) { return (<div key={"Index-".concat(row.name)} className="recipe-editor-row">
                <span className="recipe-editor-index">{index + 1}</span>
                <div className="recipe-editor-cell">
                  {row.itemType === 'recipe' ? (
            // ✅ Select pentru preparations (sub-rețete)
            <select value={row.recipeId || ''} onChange={function (event) { return handlePreparationChange(index, parseInt(event.target.value)); }} required disabled={preparationsLoading} title="Selectează preparație (sub-rețetă)" aria-label="Selectează preparație">
                      <option value="">Selectează preparație ({preparations.length} disp.)</option>
                      {preparations.map(function (prep) { return (<option key={prep.id} value={prep.id}>
                          {prep.name} {prep.name_en ? "(".concat(prep.name_en, ")") : ''}
                        </option>); })}
                    </select>) : (<input type="text" list="recipe-ingredients-list" value={row.name} onChange={function (event) { return handleIngredientNameChange(index, event.target.value); }} placeholder={row.itemType === 'packaging' ? 'Nume ambalaj' : 'Nume ingredient'} required title={row.itemType === 'packaging' ? 'Nume ambalaj' : 'Nume ingredient'} aria-label={row.itemType === 'packaging' ? 'Nume ambalaj' : 'Nume ingredient'}/>)}
                </div>
                <div className="recipe-editor-cell">
                  <input type="number" step="0.01" min="0" value={row.quantity} onChange={function (event) { return handleRowChange(index, 'quantity', event.target.value); }} placeholder="Cantitate" required/>
                </div>
                <div className="recipe-editor-cell">
                  <input type="text" value={row.unit} onChange={function (event) { return handleRowChange(index, 'unit', event.target.value); }} placeholder="Unitate"/>
                </div>
                <div className="recipe-editor-cell">
                  <input type="number" min="0" max="100" step="0.1" value={row.wastePercentage} onChange={function (event) { return handleRowChange(index, 'wastePercentage', event.target.value); }} disabled={row.itemType === 'packaging'} title="Procent pierderi"/>
                </div>
                <div className="recipe-editor-cell">
                  <select value={row.itemType} onChange={function (event) { return handleItemTypeChange(index, event.target.value); }} title="Tip item (Ingredient, Sub-rețetă sau Ambalaj)" aria-label="Tip item">
                    <option value="ingredient">Ingredient</option>
                    <option value="recipe">Sub-rețetă (Preparation)</option>
                    <option value="packaging">Ambalaj</option>
                  </select>
                </div>
                <div className="recipe-editor-cell">
                  <textarea value={row.variableConsumption} onChange={function (event) { return handleRowChange(index, 'variableConsumption', event.target.value); }} placeholder='[ex_10%_extra_pentru_plating]' rows={2}/>
                </div>
                <div className="recipe-editor-cell recipe-editor-actions-cell">
                  <button type="button" className="recipe-editor-remove" onClick={function () { return handleRemoveRow(index); }} title="sterge ingredient">
                    🗑️
                  </button>
                </div>
              </div>); })}
          </div>

          <div className="recipe-editor-additions">
            <button type="button" className="menu-product-button menu-product-button--primary" onClick={function () { return handleAddRow('ingredient'); }}>
              ➕ Ingredient
            </button>
            <button type="button" className="menu-product-button menu-product-button--secondary" onClick={function () { return handleAddRow('recipe'); }}>
              🔄 Sub-rețetă
            </button>
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={function () { return handleAddRow('packaging'); }}>
              📦 Ambalaj
            </button>
          </div>

          <footer className="recipe-editor-footer">
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={saving}>Anulează</button>
            <button type="submit" className="menu-product-button menu-product-button--primary" disabled={saving}>
              {saving ? 'Se salvează…' : 'Salvează rețeta'}
            </button>
          </footer>
        </form>

        <datalist id="recipe-ingredients-list">
          {catalogList.map(function (ingredient) { return (<option key={ingredient.id} value={ingredient.name}/>); })}
        </datalist>

        {/* ✅ Nutrition Search Modal */}
        <NutritionSearchModal_1.NutritionSearchModal open={nutritionSearchOpen} onClose={function () { return setNutritionSearchOpen(false); }} onSelect={handleNutritionSelect}/>

        {/* ✅ Calculated Nutrition Display */}
        {calculatedNutrition && (<div className="alert alert-info mt-3">
            <h6>📊 Valori Nutriționale Calculate (per {servings} porții):</h6>
            <div className="row mt-2">
              <div className="col-md-6">
                <strong>Calorii:</strong> {calculatedNutrition.energy_kcal.toFixed(2)} kcal ({calculatedNutrition.energy_kj.toFixed(2)} kJ)
              </div>
              <div className="col-md-6">
                <strong>Proteine:</strong> {calculatedNutrition.protein.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Carbohidrați:</strong> {calculatedNutrition.carbs.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Zahăr:</strong> {calculatedNutrition.sugars.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Grăsimi:</strong> {calculatedNutrition.fat.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Grăsimi saturate:</strong> {calculatedNutrition.saturated_fat.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Fibre:</strong> {calculatedNutrition.fiber.toFixed(2)} g
              </div>
              <div className="col-md-6">
                <strong>Sare:</strong> {calculatedNutrition.salt.toFixed(2)} g
              </div>
            </div>
          </div>)}

        {/* ✅ TASK 3: Recipe Version History Modal */}
        {recipeId && (<RecipeVersionHistory_1.RecipeVersionHistory open={versionHistoryOpen} recipeId={recipeId} onClose={function () { return setVersionHistoryOpen(false); }}/>)}
      </Modal_1.Modal>
    </div>);
}
