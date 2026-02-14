"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientEditorModal = IngredientEditorModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var Modal_1 = require("@/shared/components/Modal");
var SmartForm_1 = require("@/shared/components/SmartForm");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var httpClient_1 = require("@/shared/api/httpClient");
var ingredientForm_1 = require("@/modules/ingredients/validators/ingredientForm");
require("./IngredientEditorModal.css");
var UNIT_OPTIONS = ['g', 'kg', 'ml', 'l', 'pcs', 'buc', 'portie', 'cutie', 'litru'];
function IngredientEditorModal(_a) {
    var _this = this;
    var open = _a.open, ingredient = _a.ingredient, onClose = _a.onClose, onSaved = _a.onSaved;
    //   const { t } = useTranslation();
    var isEditing = Boolean(ingredient === null || ingredient === void 0 ? void 0 : ingredient.id);
    var categoriesData = (0, useApiQuery_1.useApiQuery)(open ? '/api/ingredient-categories?activeOnly=true' : null).data;
    var suppliersData = (0, useApiQuery_1.useApiQuery)(open ? '/api/suppliers?activeOnly=true' : null).data;
    var categoryOptions = (0, react_1.useMemo)(function () {
        if (!categoriesData || !Array.isArray(categoriesData)) {
            return [];
        }
        return categoriesData.map(function (category) { return ({
            label: category.name_ro,
            value: category.name_ro,
        }); });
    }, [categoriesData]);
    var supplierOptions = (0, react_1.useMemo)(function () {
        if (!suppliersData || !Array.isArray(suppliersData)) {
            return [];
        }
        return suppliersData.map(function (supplier) { return ({
            label: supplier.name,
            value: supplier.id,
        }); });
    }, [suppliersData]);
    var _b = (0, useApiMutation_1.useApiMutation)(), mutate = _b.mutate, loading = _b.loading, error = _b.error, reset = _b.reset;
    var defaultValues = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        if (!ingredient) {
            return {
                name: '',
                official_name: undefined,
                category: '',
                category_custom: undefined,
                unit: '',
                unit_custom: undefined,
                current_stock: undefined,
                min_stock: undefined,
                max_stock: undefined,
                safety_stock: undefined,
                reorder_quantity: undefined,
                purchase_unit: undefined,
                recipe_unit: undefined,
                inventory_unit: undefined,
                purchase_to_inventory_factor: undefined,
                inventory_to_recipe_factor: undefined,
                cost_per_unit: undefined,
                origin_country: undefined,
                default_supplier_id: null,
                default_supplier_id_custom: undefined,
                haccp_notes: undefined,
                is_visible: true,
            };
        }
        return {
            name: (_a = ingredient.name) !== null && _a !== void 0 ? _a : '',
            official_name: (_b = ingredient.official_name) !== null && _b !== void 0 ? _b : undefined,
            category: (_c = ingredient.category) !== null && _c !== void 0 ? _c : '',
            category_custom: undefined,
            unit: (_d = ingredient.unit) !== null && _d !== void 0 ? _d : '',
            unit_custom: undefined,
            current_stock: (_e = ingredient.current_stock) !== null && _e !== void 0 ? _e : undefined,
            min_stock: (_f = ingredient.min_stock) !== null && _f !== void 0 ? _f : undefined,
            max_stock: (_g = ingredient.max_stock) !== null && _g !== void 0 ? _g : undefined,
            safety_stock: (_h = ingredient.safety_stock) !== null && _h !== void 0 ? _h : undefined,
            reorder_quantity: (_j = ingredient.reorder_quantity) !== null && _j !== void 0 ? _j : undefined,
            purchase_unit: (_k = ingredient.purchase_unit) !== null && _k !== void 0 ? _k : undefined,
            recipe_unit: (_l = ingredient.recipe_unit) !== null && _l !== void 0 ? _l : undefined,
            inventory_unit: (_m = ingredient.inventory_unit) !== null && _m !== void 0 ? _m : undefined,
            purchase_to_inventory_factor: (_o = ingredient.purchase_to_inventory_factor) !== null && _o !== void 0 ? _o : undefined,
            inventory_to_recipe_factor: (_p = ingredient.inventory_to_recipe_factor) !== null && _p !== void 0 ? _p : undefined,
            cost_per_unit: (_q = ingredient.cost_per_unit) !== null && _q !== void 0 ? _q : undefined,
            origin_country: (_r = ingredient.origin_country) !== null && _r !== void 0 ? _r : undefined,
            default_supplier_id: (_s = ingredient.default_supplier_id) !== null && _s !== void 0 ? _s : null,
            default_supplier_id_custom: undefined,
            haccp_notes: (_t = ingredient.haccp_notes) !== null && _t !== void 0 ? _t : undefined,
            is_visible: !(ingredient.is_hidden === 1 || ingredient.is_hidden === true),
        };
    }, [ingredient]);
    var _c = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(ingredientForm_1.ingredientFormSchema),
        defaultValues: defaultValues,
    }), control = _c.control, handleSubmit = _c.handleSubmit, resetForm = _c.reset, errors = _c.formState.errors;
    (0, react_1.useEffect)(function () {
        if (!open) {
            reset();
            resetForm(defaultValues);
        }
        else {
            resetForm(defaultValues);
        }
    }, [open, reset, resetForm, defaultValues]);
    var fields = (0, react_1.useMemo)(function () { return [
        {
            name: 'name',
            label: 'Nume ingredient',
            type: 'text',
            placeholder: 'Ex: Anchois file',
            required: true,
        },
        {
            name: 'official_name',
            label: 'Denumire oficială',
            type: 'text',
            placeholder: 'Ex: Pește Anchois file (conservat în ulei)',
        },
        {
            name: 'category',
            label: 'Categorie',
            type: 'select',
            options: categoryOptions,
            required: true,
            allowCustomOption: true,
            customOptionLabel: 'Introdu categorie personalizată',
            customFieldPlaceholder: 'Categorie nouă (ex: Pește)',
        },
        {
            name: 'unit',
            label: 'Unitate de măsură (inventar)',
            type: 'select',
            options: UNIT_OPTIONS.map(function (unit) { return ({ label: unit.toUpperCase(), value: unit }); }),
            required: true,
            allowCustomOption: true,
            customOptionLabel: 'Altă unitate',
            customFieldPlaceholder: 'Introdu unitate (ex: bax)',
            helperText: 'Unitatea folosită în gestiune (inventar)',
        },
        {
            name: 'purchase_unit',
            label: 'Unitate de cumpărare',
            type: 'select',
            options: UNIT_OPTIONS.map(function (unit) { return ({ label: unit.toUpperCase(), value: unit }); }),
            allowCustomOption: true,
            customOptionLabel: 'Altă unitate',
            customFieldPlaceholder: 'Introdu unitate (ex: cutie)',
            helperText: 'Unitatea în care se cumpără de la furnizor (ex: cutie de 10kg)',
        },
        {
            name: 'recipe_unit',
            label: 'Unitate în rețete',
            type: 'select',
            options: UNIT_OPTIONS.map(function (unit) { return ({ label: unit.toUpperCase(), value: unit }); }),
            allowCustomOption: true,
            customOptionLabel: 'Altă unitate',
            customFieldPlaceholder: 'Introdu unitate (ex: lingură)',
            helperText: 'Unitatea folosită în rețete (poate diferi de inventar)',
        },
        {
            name: 'purchase_to_inventory_factor',
            label: 'Factor conversie: Cumpărare → Inventar',
            type: 'number',
            placeholder: '1',
            step: 0.001,
            helperText: 'Ex: 1 cutie = 10 kg → factor = 10',
        },
        {
            name: 'inventory_to_recipe_factor',
            label: 'Factor conversie: Inventar → Rețetă',
            type: 'number',
            placeholder: '1',
            step: 0.001,
            helperText: 'Ex: 1 kg = 1000 g → factor = 1000',
        },
        {
            name: "Stoc Actual",
            label: 'Stoc curent',
            type: 'number',
            placeholder: '0',
            helperText: 'Valoarea actuală din gestiune (se poate lăsa 0 pentru ingrediente noi)',
        },
        {
            name: "Stoc Minim",
            label: 'Stoc minim (Reorder Point)',
            type: 'number',
            placeholder: '5',
            helperText: 'Când stocul scade sub această valoare, sistemul va genera alertă',
        },
        {
            name: 'safety_stock',
            label: 'Stoc siguranță',
            type: 'number',
            placeholder: '2',
            helperText: 'Buffer pentru cerere neașteptată (trebuie să fie între min și max)',
        },
        {
            name: "Stoc Maxim",
            label: 'Stoc maxim (Par Level)',
            type: 'number',
            placeholder: '50',
            helperText: 'Cantitatea maximă recomandată în stoc (trebuie să fie > min_stock)',
        },
        {
            name: 'reorder_quantity',
            label: 'Cantitate comandă',
            type: 'number',
            placeholder: '20',
            helperText: 'Cantitatea recomandată la comandă (EOQ - Economic Order Quantity)',
        },
        {
            name: "Cost/Unitate",
            label: 'Cost / unitate (RON)',
            type: 'number',
            placeholder: '0.00',
            step: 0.01,
        },
        {
            name: 'origin_country',
            label: 'Țară de origine',
            type: 'text',
            placeholder: 'Ex: Spania',
        },
        {
            name: 'default_supplier_id',
            label: 'Furnizor principal',
            type: 'select',
            options: supplierOptions,
            allowCustomOption: true,
            customOptionLabel: 'Adaugă furnizor nou',
            customFieldPlaceholder: 'Nume furnizor nou',
        },
        {
            name: 'haccp_notes',
            label: 'Note HACCP / trasabilitate',
            type: 'textarea',
            placeholder: 'Respectă lanțul rece 0-4°C. Consum în max. 48h după deschiderea lotului.',
            colSpan: 2,
        },
        {
            name: 'is_visible',
            label: 'Disponibil în aplicație',
            type: 'checkbox',
            placeholder: 'Ingredient vizibil în rețete și stocuri',
        },
    ]; }, [categoryOptions, supplierOptions]);
    var onSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var categoryValue, unitValue, defaultSupplierId, customSupplierName, response, supplierId, payload, endpoint, method, result;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    categoryValue = values.category === '__custom__' ? values.category_custom : values.category;
                    unitValue = values.unit === '__custom__' ? values.unit_custom : values.unit;
                    defaultSupplierId = null;
                    if (!(values.default_supplier_id === '__custom__')) return [3 /*break*/, 3];
                    customSupplierName = values.default_supplier_id_custom;
                    if (!customSupplierName) return [3 /*break*/, 2];
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/suppliers', { company_name: customSupplierName })];
                case 1:
                    response = _r.sent();
                    supplierId = (_a = response.data) === null || _a === void 0 ? void 0 : _a.supplier_id;
                    if (supplierId) {
                        defaultSupplierId = supplierId;
                    }
                    _r.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    if (typeof values.default_supplier_id === 'number') {
                        defaultSupplierId = values.default_supplier_id;
                    }
                    else if (values.default_supplier_id === null) {
                        defaultSupplierId = null;
                    }
                    _r.label = 4;
                case 4:
                    payload = {
                        name: values.name,
                        official_name: (_b = values.official_name) !== null && _b !== void 0 ? _b : null,
                        category: categoryValue !== null && categoryValue !== void 0 ? categoryValue : null,
                        unit: unitValue !== null && unitValue !== void 0 ? unitValue : null,
                        current_stock: (_c = values.current_stock) !== null && _c !== void 0 ? _c : 0,
                        min_stock: (_d = values.min_stock) !== null && _d !== void 0 ? _d : 0,
                        max_stock: (_e = values.max_stock) !== null && _e !== void 0 ? _e : null,
                        safety_stock: (_f = values.safety_stock) !== null && _f !== void 0 ? _f : null,
                        reorder_quantity: (_g = values.reorder_quantity) !== null && _g !== void 0 ? _g : null,
                        purchase_unit: (_h = values.purchase_unit) !== null && _h !== void 0 ? _h : null,
                        recipe_unit: (_j = values.recipe_unit) !== null && _j !== void 0 ? _j : null,
                        inventory_unit: (_k = values.inventory_unit) !== null && _k !== void 0 ? _k : null,
                        purchase_to_inventory_factor: (_l = values.purchase_to_inventory_factor) !== null && _l !== void 0 ? _l : null,
                        inventory_to_recipe_factor: (_m = values.inventory_to_recipe_factor) !== null && _m !== void 0 ? _m : null,
                        cost_per_unit: (_o = values.cost_per_unit) !== null && _o !== void 0 ? _o : 0,
                        origin_country: (_p = values.origin_country) !== null && _p !== void 0 ? _p : null,
                        default_supplier_id: defaultSupplierId,
                        haccp_notes: (_q = values.haccp_notes) !== null && _q !== void 0 ? _q : null,
                        is_hidden: values.is_visible ? 0 : 1,
                    };
                    endpoint = isEditing && ingredient ? "/api/ingredients/".concat(ingredient.id) : '/api/ingredients';
                    method = isEditing ? 'put' : 'post';
                    return [4 /*yield*/, mutate({ url: endpoint, method: method, data: payload })];
                case 5:
                    result = _r.sent();
                    if (result !== null) {
                        onSaved();
                        resetForm(defaultValues);
                        onClose();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={onClose} title={isEditing ? "Editeaz\u0103 ingredientul \"".concat(ingredient === null || ingredient === void 0 ? void 0 : ingredient.name, "\"") : 'Adaugă ingredient'} description="Completează informațiile pentru trasabilitate și gestiune stocuri. Câmpurile obligatorii sunt marcate cu *." size="xl">
      {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}
      <SmartForm_1.SmartForm fields={fields} control={control} errors={errors} onSubmit={handleSubmit(onSubmit)} submitLabel={isEditing ? 'Actualizează ingredientul' : 'Adaugă ingredientul'} loading={loading} layoutColumns={2} secondaryAction={<button type="button" className="smart-form__cancel" onClick={function () {
                reset();
                resetForm(defaultValues);
                onClose();
            }}>Anulează</button>}/>
    </Modal_1.Modal>);
}
