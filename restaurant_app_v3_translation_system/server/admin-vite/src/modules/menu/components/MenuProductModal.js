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
exports.MenuProductModal = MenuProductModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var AllergenSelector_1 = require("./AllergenSelector");
var AdditiveSelector_1 = require("./AdditiveSelector");
require("./MenuProductModal.css");
var DEFAULT_FORM_VALUES = {
    name: '',
    nameEn: '',
    category: '',
    categoryEn: '',
    price: '',
    vatRate: '19',
    unit: 'buc',
    description: '',
    descriptionEn: '',
    weight: '',
    stockManagement: 'Bucătărie',
    preparationSection: 'BUCĂTĂRIE',
    isVegetarian: false,
    isSpicy: false,
    isTakeoutOnly: false,
    isSellable: true,
    isActive: true,
    isFraction: false,
    hasRecipe: false,
    info: '',
    allergens: '',
    allergensEn: '',
    prepTime: '',
    spiceLevel: '0',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sodium: '',
    sugar: '',
    salt: '',
    costPrice: '',
    displayOrder: '',
    ingredients: '',
    imageFile: null,
    currentImageUrl: null,
};
var VAT_OPTIONS = ['5', '9', '19', '21'];
var UNIT_OPTIONS = ['buc', 'g', 'kg', 'ml', 'l', 'porție'];
var STOCK_OPTIONS = ['Bucătărie', 'Bar', 'Pizzerie', 'Patiserie', 'Delivery', 'Terasa'];
var PREPARATION_OPTIONS = ['BUCĂTĂRIE', 'BAR', 'PIZZERIE', 'PATISERIE', 'DELIVERY'];
var EMPTY_CUSTOMIZATION = {
    optionName: '',
    optionNameEn: '',
    optionType: 'option',
    extraPrice: '0',
};
var CUSTOMIZATION_TYPE_SUGGESTIONS = ['option', 'group', 'required', 'extra', 'info'];
var mapProductToForm = function (product) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return ({
        name: (_a = product.name) !== null && _a !== void 0 ? _a : '',
        nameEn: (_b = product.name_en) !== null && _b !== void 0 ? _b : '',
        category: (_c = product.category) !== null && _c !== void 0 ? _c : '',
        categoryEn: (_d = product.category_en) !== null && _d !== void 0 ? _d : '',
        price: product.price !== undefined && product.price !== null ? String(product.price) : '',
        vatRate: product.vat_rate !== undefined && product.vat_rate !== null ? String(product.vat_rate) : '19',
        unit: (_e = product.unit) !== null && _e !== void 0 ? _e : 'buc',
        description: (_f = product.description) !== null && _f !== void 0 ? _f : '',
        descriptionEn: (_g = product.description_en) !== null && _g !== void 0 ? _g : '',
        weight: (_h = product.weight) !== null && _h !== void 0 ? _h : '',
        stockManagement: (_j = product.stock_management) !== null && _j !== void 0 ? _j : 'Bucătărie',
        preparationSection: (_k = product.preparation_section) !== null && _k !== void 0 ? _k : 'BUCĂTĂRIE',
        isVegetarian: product.is_vegetarian === 1 || product.is_vegetarian === true,
        isSpicy: product.is_spicy === 1 || product.is_spicy === true,
        isTakeoutOnly: product.is_takeout_only === 1 || product.is_takeout_only === true,
        isSellable: product.is_sellable === 1 || product.is_sellable === true || product.is_sellable === undefined,
        isActive: product.is_active === 1 || product.is_active === true || product.is_active === undefined,
        isFraction: product.is_fraction === 1 || product.is_fraction === true,
        hasRecipe: product.has_recipe === 1 || product.has_recipe === true,
        info: (_l = product.info) !== null && _l !== void 0 ? _l : '',
        allergens: (_m = product.allergens) !== null && _m !== void 0 ? _m : '',
        allergensEn: (_o = product.allergens_en) !== null && _o !== void 0 ? _o : '',
        prepTime: product.prep_time !== undefined && product.prep_time !== null ? String(product.prep_time) : '',
        spiceLevel: product.spice_level !== undefined && product.spice_level !== null ? String(product.spice_level) : '0',
        calories: product.calories !== undefined && product.calories !== null ? String(product.calories) : '',
        protein: product.protein !== undefined && product.protein !== null ? String(product.protein) : '',
        carbs: product.carbs !== undefined && product.carbs !== null ? String(product.carbs) : '',
        fat: product.fat !== undefined && product.fat !== null ? String(product.fat) : '',
        fiber: product.fiber !== undefined && product.fiber !== null ? String(product.fiber) : '',
        sodium: product.sodium !== undefined && product.sodium !== null ? String(product.sodium) : '',
        sugar: product.sugar !== undefined && product.sugar !== null ? String(product.sugar) : '',
        salt: product.salt !== undefined && product.salt !== null ? String(product.salt) : '',
        costPrice: product.cost_price !== undefined && product.cost_price !== null ? String(product.cost_price) : '',
        displayOrder: product.display_order !== undefined && product.display_order !== null ? String(product.display_order) : '',
        ingredients: typeof product.ingredients === 'string' ? product.ingredients : '',
        imageFile: null,
        currentImageUrl: (_p = product.image_url) !== null && _p !== void 0 ? _p : null,
    });
};
function MenuProductModal(_a) {
    var _this = this;
    var _b;
    var open = _a.open, mode = _a.mode, categories = _a.categories, product = _a.product, onClose = _a.onClose, onSaved = _a.onSaved;
    //   const { t } = useTranslation();
    var _c = (0, useApiMutation_1.useApiMutation)(), mutate = _c.mutate, loading = _c.loading, error = _c.error, reset = _c.reset;
    var _d = (0, react_1.useState)(DEFAULT_FORM_VALUES), formState = _d[0], setFormState = _d[1];
    var _e = (0, react_1.useState)(null), imagePreview = _e[0], setImagePreview = _e[1];
    var _f = (0, react_1.useState)([]), customizations = _f[0], setCustomizations = _f[1];
    var _g = (0, react_1.useState)(false), customizationsLoading = _g[0], setCustomizationsLoading = _g[1];
    var _h = (0, react_1.useState)(null), customizationsError = _h[0], setCustomizationsError = _h[1];
    var categoryOptions = (0, react_1.useMemo)(function () {
        var unique = new Set(categories.filter(Boolean));
        if (formState.category) {
            unique.add(formState.category);
        }
        return Array.from(unique);
    }, [categories, formState.category]);
    (0, react_1.useEffect)(function () {
        var _a;
        if (open) {
            if (product) {
                var mapped = mapProductToForm(product);
                setFormState(mapped);
                setImagePreview((_a = product.image_url) !== null && _a !== void 0 ? _a : null);
                setCustomizations([]);
                setCustomizationsError(null);
                setCustomizationsLoading(true);
            }
            else {
                setFormState(DEFAULT_FORM_VALUES);
                setImagePreview(null);
                setCustomizations([]);
                setCustomizationsError(null);
                setCustomizationsLoading(false);
            }
            reset();
        }
        else {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setCustomizations([]);
            setCustomizationsError(null);
            setCustomizationsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, product]);
    (0, react_1.useEffect)(function () {
        return function () {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);
    (0, react_1.useEffect)(function () {
        if (!open) {
            return;
        }
        if (mode !== 'edit' || !(product === null || product === void 0 ? void 0 : product.id)) {
            setCustomizations([]);
            setCustomizationsError(null);
            setCustomizationsLoading(false);
            return;
        }
        var controller = new AbortController();
        var isCanceled = false;
        var loadCustomizations = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, payload, mapped, fetchError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setCustomizationsLoading(true);
                        setCustomizationsError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch("/api/admin/products/".concat(product.id, "/customizations"), {
                                signal: controller.signal,
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Status ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        payload = _a.sent();
                        if (isCanceled) {
                            return [2 /*return*/];
                        }
                        mapped = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.customizations) && payload.customizations.length > 0
                            ? payload.customizations.map(function (entry) {
                                var _a, _b, _c, _d;
                                return ({
                                    id: entry.id,
                                    optionName: (_a = entry.option_name) !== null && _a !== void 0 ? _a : '',
                                    optionNameEn: (_c = (_b = entry.option_name_en) !== null && _b !== void 0 ? _b : entry.option_name) !== null && _c !== void 0 ? _c : '',
                                    optionType: (_d = entry.option_type) !== null && _d !== void 0 ? _d : 'option',
                                    extraPrice: entry.extra_price !== undefined && entry.extra_price !== null
                                        ? String(entry.extra_price)
                                        : '0',
                                });
                            })
                            : [];
                        setCustomizations(mapped);
                        return [3 /*break*/, 6];
                    case 4:
                        fetchError_1 = _a.sent();
                        if (isCanceled || (fetchError_1 instanceof DOMException && fetchError_1.name === 'AbortError')) {
                            return [2 /*return*/];
                        }
                        console.error('Nu am putut încărca personalizările produsului:', fetchError_1);
                        setCustomizationsError('Nu am putut încărca personalizările produsului. Poți continua editarea și salva opțiunile manual.');
                        setCustomizations([]);
                        return [3 /*break*/, 6];
                    case 5:
                        if (!isCanceled) {
                            setCustomizationsLoading(false);
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        loadCustomizations();
        return function () {
            isCanceled = true;
            controller.abort();
        };
    }, [open, mode, product === null || product === void 0 ? void 0 : product.id]);
    var handleInputChange = function (field) {
        return function (event) {
            var value = event.target.value;
            setFormState(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
            });
        };
    };
    var handleCheckboxChange = function (field) { return function (event) {
        setFormState(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = event.target.checked, _a)));
        });
    }; };
    var handleImageChange = function (event) {
        var _a, _b;
        var file = (_b = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
        setFormState(function (prev) { return (__assign(__assign({}, prev), { imageFile: file })); });
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
        else {
            setImagePreview(formState.currentImageUrl);
        }
    };
    var handleRemoveImage = function () {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setFormState(function (prev) { return (__assign(__assign({}, prev), { imageFile: null, currentImageUrl: '' })); });
    };
    var handleCustomizationChange = function (index, field, value) {
        setCustomizations(function (prev) {
            var _a;
            var next = __spreadArray([], prev, true);
            var safeValue = field === 'extraPrice'
                ? value.replace(',', '.')
                : field === 'optionType'
                    ? value.toLowerCase()
                    : value;
            next[index] = __assign(__assign({}, next[index]), (_a = {}, _a[field] = safeValue, _a));
            return next;
        });
        setCustomizationsError(null);
    };
    var handleAddCustomization = function () {
        setCustomizations(function (prev) { return __spreadArray(__spreadArray([], prev, true), [__assign({}, EMPTY_CUSTOMIZATION)], false); });
        setCustomizationsError(null);
    };
    var handleRemoveCustomization = function (index) {
        setCustomizations(function (prev) {
            if (prev.length === 1) {
                return [__assign({}, EMPTY_CUSTOMIZATION)];
            }
            var next = prev.filter(function (_, idx) { return idx !== index; });
            return next.length > 0 ? next : [__assign({}, EMPTY_CUSTOMIZATION)];
        });
        setCustomizationsError(null);
    };
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var formData, normalizedCustomizations, hasInvalidPrice, endpoint, method, response, baseMessage, customizationSummary;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    event.preventDefault();
                    if (customizationsLoading) {
                        setCustomizationsError('Așteaptă finalizarea încărcării personalizărilor înainte de salvare.');
                        return [2 /*return*/];
                    }
                    formData = new FormData();
                    formData.append('name', formState.name.trim());
                    formData.append('price', formState.price || '0');
                    formData.append('category', formState.category.trim());
                    if (formState.nameEn)
                        formData.append('name_en', formState.nameEn.trim());
                    if (formState.categoryEn)
                        formData.append('category_en', formState.categoryEn.trim());
                    if (formState.description)
                        formData.append("Description", formState.description);
                    if (formState.descriptionEn)
                        formData.append('description_en', formState.descriptionEn);
                    if (formState.weight)
                        formData.append('weight', formState.weight);
                    if (formState.info)
                        formData.append('info', formState.info);
                    if (formState.ingredients)
                        formData.append('ingredients', formState.ingredients);
                    if (formState.allergens)
                        formData.append('allergens', formState.allergens);
                    if (formState.allergensEn)
                        formData.append('allergens_en', formState.allergensEn);
                    formData.append('vat_rate', formState.vatRate || '19');
                    formData.append('unit', formState.unit || 'buc');
                    formData.append('stock_management', formState.stockManagement || 'Bucătărie');
                    formData.append('preparation_section', formState.preparationSection || 'BUCĂTĂRIE');
                    if (formState.prepTime)
                        formData.append('prep_time', formState.prepTime);
                    if (formState.spiceLevel)
                        formData.append('spice_level', formState.spiceLevel);
                    if (formState.calories)
                        formData.append('calories', formState.calories);
                    if (formState.protein)
                        formData.append('protein', formState.protein);
                    if (formState.carbs)
                        formData.append('carbs', formState.carbs);
                    if (formState.fat)
                        formData.append('fat', formState.fat);
                    if (formState.fiber)
                        formData.append('fiber', formState.fiber);
                    if (formState.sodium)
                        formData.append('sodium', formState.sodium);
                    if (formState.sugar)
                        formData.append('sugar', formState.sugar);
                    if (formState.salt)
                        formData.append('salt', formState.salt);
                    if (formState.costPrice)
                        formData.append('cost_price', formState.costPrice);
                    if (formState.displayOrder)
                        formData.append('display_order', formState.displayOrder);
                    formData.append('is_vegetarian', formState.isVegetarian ? '1' : '0');
                    formData.append('is_spicy', formState.isSpicy ? '1' : '0');
                    formData.append('is_takeout_only', formState.isTakeoutOnly ? '1' : '0');
                    formData.append('is_sellable', formState.isSellable ? '1' : '0');
                    formData.append('is_active', formState.isActive ? '1' : '0');
                    formData.append('is_fraction', formState.isFraction ? '1' : '0');
                    formData.append('has_recipe', formState.hasRecipe ? '1' : '0');
                    if (formState.currentImageUrl !== null && !formState.imageFile) {
                        formData.append('currentImageUrl', formState.currentImageUrl);
                    }
                    normalizedCustomizations = customizations
                        .map(function (customization) { return ({
                        id: customization.id,
                        option_name: customization.optionName.trim(),
                        option_name_en: customization.optionNameEn.trim(),
                        option_type: customization.optionType.trim() || 'option',
                        extra_price: customization.extraPrice === '' ? 0 : Number(customization.extraPrice),
                    }); })
                        .filter(function (customization) { return customization.option_name.length > 0; });
                    hasInvalidPrice = normalizedCustomizations.some(function (customization) { return Number.isNaN(customization.extra_price) || customization.extra_price < 0; });
                    if (hasInvalidPrice) {
                        setCustomizationsError('Prețul suplimentar al personalizărilor trebuie să fie un număr pozitiv. Folosește 0 pentru opțiuni fără cost.');
                        return [2 /*return*/];
                    }
                    setCustomizationsError(null);
                    formData.append('customizations', JSON.stringify(normalizedCustomizations));
                    if (formState.imageFile) {
                        formData.append('image', formState.imageFile);
                    }
                    endpoint = mode === 'create' ? '/api/admin/products' : "/api/admin/products/".concat(product === null || product === void 0 ? void 0 : product.id);
                    method = mode === 'create' ? 'post' : 'put';
                    return [4 /*yield*/, mutate({
                            url: endpoint,
                            method: method,
                            data: formData,
                        })];
                case 1:
                    response = _b.sent();
                    if (response !== null) {
                        baseMessage = (_a = response === null || response === void 0 ? void 0 : response.message) !== null && _a !== void 0 ? _a : (mode === 'create' ? 'Produs adăugat cu succes' : 'Produs actualizat cu succes');
                        customizationSummary = Array.isArray(response === null || response === void 0 ? void 0 : response.customizations) && response.customizations.length > 0
                            ? " Personaliz\u0103ri active: ".concat(response.customizations.length, ".")
                            : normalizedCustomizations.length > 0
                                ? " Personaliz\u0103rile au fost sincronizate."
                                : '';
                        onSaved("".concat(baseMessage).concat(customizationSummary).trim());
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var modalTitle = mode === 'create' ? 'Adaugă produs' : "Editeaz\u0103 produs \u2014 ".concat((_b = product === null || product === void 0 ? void 0 : product.name) !== null && _b !== void 0 ? _b : '');
    return (<Modal_1.Modal isOpen={open} title={modalTitle} size="full" onClose={onClose}>
      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}

      <form className="menu-product-form" onSubmit={handleSubmit}>
        <section className="menu-product-section">
          <header>
            <h3>📋 Detalii generale</h3>
            <p>"completeaza informatiile de baza afisate clientilo"</p>
          </header>

          <div className="menu-product-grid menu-product-grid--two">
            <label className="menu-product-field">
              <span>Nume produs *</span>
              <input type="text" value={formState.name} onChange={handleInputChange('name')} required placeholder="Ex: Pizza Quattro Stagioni"/>
            </label>

            <label className="menu-product-field">
              <span>Nume produs (EN)</span>
              <input type="text" value={formState.nameEn} onChange={handleInputChange('nameEn')} placeholder="Ex: Four Seasons Pizza"/>
            </label>

            <label className="menu-product-field">
              <span>Categorie *</span>
              <input list="menu-category-options" value={formState.category} onChange={handleInputChange('category')} required placeholder="ex pizza salate"/>
              <datalist id="menu-category-options">
                {categoryOptions.map(function (category) { return (<option key={category} value={category}/>); })}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>Categorie (EN)</span>
              <input type="text" value={formState.categoryEn} onChange={handleInputChange('categoryEn')} placeholder="Ex: Pizza"/>
            </label>

            <label className="menu-product-field">
              <span>Preț (RON) *</span>
              <input type="number" min="0" step="0.1" value={formState.price} onChange={handleInputChange('price')} required/>
            </label>

            <label className="menu-product-field">
              <span>TVA (%)</span>
              <select value={formState.vatRate} onChange={handleInputChange('vatRate')}>
                {VAT_OPTIONS.map(function (option) { return (<option key={option} value={option}>
                    {option}
                  </option>); })}
              </select>
            </label>

            <label className="menu-product-field">
              <span>"unitate masura"</span>
              <select value={formState.unit} onChange={handleInputChange('unit')}>
                {UNIT_OPTIONS.map(function (unit) { return (<option key={unit} value={unit}>
                    {unit}
                  </option>); })}
              </select>
            </label>

            <label className="menu-product-field">
              <span>Greutate / Volum</span>
              <input type="text" value={formState.weight} onChange={handleInputChange('weight')} placeholder="Ex: 350g, 500ml"/>
            </label>

            <label className="menu-product-field">
              <span>"ordine afisare"</span>
              <input type="number" min="0" value={formState.displayOrder} onChange={handleInputChange('displayOrder')} placeholder="ordinea in meniu"/>
            </label>

            <label className="menu-product-field">
              <span>Cost produs (RON)</span>
              <input type="number" min="0" step="0.01" value={formState.costPrice} onChange={handleInputChange('costPrice')} placeholder="Ex: 12.50"/>
            </label>
          </div>

          <div className="menu-product-switches">
            <label>
              <input type="checkbox" checked={formState.isSellable} onChange={handleCheckboxChange('isSellable')}/>"disponibil la vanzare"</label>
            <label>
              <input type="checkbox" checked={formState.isActive} onChange={handleCheckboxChange('isActive')}/>"activ in meniu"</label>
            <label>
              <input type="checkbox" checked={formState.isFraction} onChange={handleCheckboxChange('isFraction')}/>
              Permite fracții (gramaj)
            </label>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🏭 Inventar & preparare</h3>
            <p>"defineste gestiunea si sectia de pregatire pentru "</p>
          </header>

          <div className="menu-product-grid menu-product-grid--three">
            <label className="menu-product-field">
              <span>Gestiune stoc</span>
              <input list="menu-stock-options" value={formState.stockManagement} onChange={handleInputChange('stockManagement')} placeholder="ex bucatarie bar"/>
              <datalist id="menu-stock-options">
                {STOCK_OPTIONS.map(function (option) { return (<option key={option} value={option}/>); })}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>"sectie preparare"</span>
              <input list="menu-preparation-options" value={formState.preparationSection} onChange={handleInputChange('preparationSection')} placeholder="Ex: BUCĂTĂRIE, BAR..."/>
              <datalist id="menu-preparation-options">
                {PREPARATION_OPTIONS.map(function (option) { return (<option key={option} value={option}/>); })}
              </datalist>
            </label>

            <label className="menu-product-field">
              <span>Timp preparare (min)</span>
              <input type="number" min="0" value={formState.prepTime} onChange={handleInputChange('prepTime')} placeholder="Ex: 15"/>
            </label>
          </div>

          <div className="menu-product-switches">
            <label>
              <input type="checkbox" checked={formState.isVegetarian} onChange={handleCheckboxChange('isVegetarian')}/>
              🌱 Vegetarian
            </label>
            <label>
              <input type="checkbox" checked={formState.isSpicy} onChange={handleCheckboxChange('isSpicy')}/>
              🌶️ Picant
            </label>
            <label>
              <input type="checkbox" checked={formState.isTakeoutOnly} onChange={handleCheckboxChange('isTakeoutOnly')}/>
              📦 Doar la pachet
            </label>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>📝 Descriere & informații</h3>
            <p>"textele afisate in meniurile clientilor si aplicat"</p>
          </header>

          <label className="menu-product-field menu-product-field--full">
            <span>Descriere (RO)</span>
            <textarea value={formState.description} onChange={handleInputChange("Description")} placeholder="descriere pentru clienti ingredientele principale " rows={3}/>
          </label>

          <label className="menu-product-field menu-product-field--full">
            <span>Descriere (EN)</span>
            <textarea value={formState.descriptionEn} onChange={handleInputChange('descriptionEn')} placeholder="English description (opțional)" rows={3}/>
          </label>

          <div className="menu-product-field menu-product-field--full">
            <AllergenSelector_1.AllergenSelector value={formState.allergens} onChange={function (value) {
            setFormState(function (prev) { return (__assign(__assign({}, prev), { allergens: value })); });
        }} label="Alergeni" placeholder="cauta si selecteaza alergeni din catalog"/>
          </div>
          
          {/* Additives selector */}
          <div className="menu-product-field menu-product-field--full mt-3">
            <AdditiveSelector_1.AdditiveSelector value={formState.allergensEn || '[]'} // Reuse allergensEn field for additives JSON
     onChange={function (value) {
            setFormState(function (prev) { return (__assign(__assign({}, prev), { allergensEn: value })); });
        }} label="Aditivi" placeholder="cauta si selecteaza aditivi din catalog"/>
          </div>

          <label className="menu-product-field menu-product-field--full">
            <span>"informatii suplimentare"</span>
            <textarea value={formState.info} onChange={handleInputChange('info')} placeholder="ex preparat la comanda recomandari de servire aver" rows={2}/>
          </label>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🎛️ Personalizări produs</h3>
            <p>Definește opțiunile suplimentare (ex: topping-uri, extra-uri) afișate clienților și aplicațiilor de livrare.</p>
          </header>

          {customizationsLoading ? (<div className="menu-customizations-state">Se încarcă personalizările existente…</div>) : null}

          {customizationsError ? (<InlineAlert_1.InlineAlert variant="warning" title="Personalizări" message={customizationsError}/>) : null}

          <div className="menu-customizations-table">
            <div className="menu-customizations-header">
              <span>#</span>
              <span>Opțiune (RO)</span>
              <span>Opțiune (EN)</span>
              <span>Tip</span>
              <span>Preț extra (RON)</span>
              <span />
            </div>

            {customizations.map(function (customization, index) {
            var _a;
            return (<div className="menu-customizations-row" key={"".concat((_a = customization.id) !== null && _a !== void 0 ? _a : 'new', "-\"Index\"")}>
                <span className="menu-customizations-index">{index + 1}</span>

                <div className="menu-customizations-cell">
                  <input type="text" value={customization.optionName} onChange={function (event) { return handleCustomizationChange(index, 'optionName', event.target.value); }} placeholder="Ex: Extra bacon" aria-label={"Nume personalizare \u00EEn rom\u00E2n\u0103 ".concat(index + 1)}/>
                  {customization.id ? <small>ID #{customization.id}</small> : null}
                </div>

                <div className="menu-customizations-cell">
                  <input type="text" value={customization.optionNameEn} onChange={function (event) { return handleCustomizationChange(index, 'optionNameEn', event.target.value); }} placeholder="Ex: Extra bacon" aria-label={"Nume personalizare \u00EEn englez\u0103 ".concat(index + 1)}/>
                </div>

                <div className="menu-customizations-cell">
                  <input type="text" list="menu-customization-type-options" value={customization.optionType} onChange={function (event) { return handleCustomizationChange(index, 'optionType', event.target.value); }} placeholder="option" aria-label={"Tip personalizare ".concat(index + 1)}/>
                </div>

                <div className="menu-customizations-cell menu-customizations-cell--price">
                  <input type="number" min="0" step="0.1" value={customization.extraPrice} onChange={function (event) { return handleCustomizationChange(index, 'extraPrice', event.target.value); }} placeholder="0" aria-label={"Pre\u021B suplimentar personalizare ".concat(index + 1)}/>
                </div>

                <div className="menu-customizations-actions">
                  <button type="button" className="menu-product-button menu-product-button--ghost" onClick={function () { return handleRemoveCustomization(index); }} title="sterge personalizarea">
                    🗑️
                  </button>
                </div>
              </div>);
        })}
          </div>

          <datalist id="menu-customization-type-options">
            {CUSTOMIZATION_TYPE_SUGGESTIONS.map(function (suggestion) { return (<option key={suggestion} value={suggestion}/>); })}
          </datalist>

          <div className="menu-customizations-footer">
            <button type="button" className="menu-product-button menu-product-button--secondary" onClick={handleAddCustomization}>
              ➕ Adaugă opțiune
            </button>
            <p>
              Opțiunile sunt sincronizate cu aplicațiile client și se regăsesc în rapoarte, bonuri și comenzi online. Lasă prețul la 0 pentru opțiuni
              fără cost suplimentar.
            </p>
          </div>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>🍽️ Nutriție & rețetă</h3>
            <p>"valorile nutritionale si configurarea retetei sunt"</p>
          </header>

          <div className="menu-product-grid menu-product-grid--four">
            <label className="menu-product-field">
              <span>Calorii</span>
              <input type="number" value={formState.calories} onChange={handleInputChange('calories')} placeholder="kcal"/>
            </label>
            <label className="menu-product-field">
              <span>Proteine (g)</span>
              <input type="number" value={formState.protein} onChange={handleInputChange('protein')} placeholder="g"/>
            </label>
            <label className="menu-product-field">
              <span>Carbohidrați (g)</span>
              <input type="number" value={formState.carbs} onChange={handleInputChange('carbs')} placeholder="g"/>
            </label>
            <label className="menu-product-field">
              <span>Grăsimi (g)</span>
              <input type="number" value={formState.fat} onChange={handleInputChange('fat')} placeholder="g"/>
            </label>
            <label className="menu-product-field">
              <span>Fibre (g)</span>
              <input type="number" value={formState.fiber} onChange={handleInputChange('fiber')} placeholder="g"/>
            </label>
            <label className="menu-product-field">
              <span>Sodiu (mg)</span>
              <input type="number" value={formState.sodium} onChange={handleInputChange('sodium')} placeholder="mg"/>
            </label>
            <label className="menu-product-field">
              <span>Zahăr (g)</span>
              <input type="number" value={formState.sugar} onChange={handleInputChange('sugar')} placeholder="g"/>
            </label>
            <label className="menu-product-field">
              <span>Sare (g)</span>
              <input type="number" value={formState.salt} onChange={handleInputChange('salt')} placeholder="g"/>
            </label>
          </div>

          <div className="menu-product-hint">
            <span>🔗 Status rețetă: {formState.hasRecipe ? 'Configurată' : 'Necalculată'}</span>
            <span>Utilizează editorul „👨‍🍳 Editor rețetă” pentru a ajusta ingredientele și alergeni.</span>
          </div>

          <label className="menu-product-field menu-product-field--full">
            <span>Ingrediente (JSON / notițe temporare)</span>
            <textarea value={formState.ingredients} onChange={handleInputChange('ingredients')} placeholder="date brute pentru integrare viitoare recomandam ut" rows={3}/>
          </label>
        </section>

        <section className="menu-product-section">
          <header>
            <h3>📸 Imagine produs</h3>
            <p>Acceptă fișiere .jpg, .png sau .webp. Dimensiune recomandată 800x600px.</p>
          </header>

          <div className="menu-product-image">
            <div className="menu-product-image__preview" onDragOver={function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('drag-over');
        }} onDragLeave={function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
        }} onDrop={function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
            var file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                setFormState(function (prev) { return (__assign(__assign({}, prev), { imageFile: file })); });
                if (imagePreview && imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                }
                setImagePreview(URL.createObjectURL(file));
            }
        }} style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }}>
              {imagePreview ? (<div style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="Previzualizare produs" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}/>
                  <button type="button" onClick={function (e) {
                e.stopPropagation();
                handleRemoveImage();
            }} style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer'
            }}>
                    ×
                  </button>
                </div>) : (<div className="menu-product-image__placeholder">
                  <span role="img" aria-label="camera" style={{ fontSize: '48px' }}>
                    📷
                  </span>
                  <p>Drag & Drop imagine aici sau click pentru a selecta</p>
                  <small style={{ color: '#666' }}>Acceptă .jpg, .png, .webp (max 5MB)</small>
                </div>)}
            </div>

            <div className="menu-product-image__actions">
              <label className="menu-product-button menu-product-button--secondary">
                <input type="file" accept="image/*" onChange={handleImageChange} hidden/>"selecteaza imagine"</label>

              {imagePreview ? (<button type="button" className="menu-product-button menu-product-button--ghost" onClick={handleRemoveImage}>"elimina imaginea"</button>) : null}
            </div>
          </div>
        </section>

        <footer className="menu-product-actions">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="submit" className="menu-product-button menu-product-button--primary" disabled={loading || customizationsLoading}>
            {loading || customizationsLoading ? 'Se salvează…' : 'Salvează produsul'}
          </button>
        </footer>
      </form>
    </Modal_1.Modal>);
}
