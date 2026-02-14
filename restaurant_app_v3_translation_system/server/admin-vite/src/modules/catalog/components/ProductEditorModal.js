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
exports.ProductEditorModal = ProductEditorModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var Modal_1 = require("@/shared/components/Modal");
var SmartForm_1 = require("@/shared/components/SmartForm");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var productForm_1 = require("@/modules/catalog/validators/productForm");
require("./ProductEditorModal.css");
var STOCK_OPTIONS = [
    { label: 'FIFO / scade din stoc', value: 'fifo' },
    { label: 'Fără gestiune stoc', value: 'none' },
];
var PREPARATION_SECTIONS = ['Bucătărie', 'Pizzerie', 'Bar', 'Desert', 'Livrare'];
function ProductEditorModal(_a) {
    var _this = this;
    var open = _a.open, product = _a.product, onClose = _a.onClose, onSaved = _a.onSaved;
    //   const { t } = useTranslation();
    var isEditing = Boolean(product === null || product === void 0 ? void 0 : product.id);
    var categoriesData = (0, useApiQuery_1.useApiQuery)(open ? '/api/catalog/categories/tree' : null).data;
    var categoryOptions = (0, react_1.useMemo)(function () {
        if (!Array.isArray(categoriesData))
            return [];
        var flatten = function (nodes, prefix) {
            if (prefix === void 0) { prefix = ''; }
            return nodes.flatMap(function (node) {
                var label = prefix ? "\"Prefix\" \u203A ".concat(node.name) : node.name;
                var current = [{ label: label, value: node.name }];
                var children = node.children ? flatten(node.children, label) : [];
                return __spreadArray(__spreadArray([], current, true), children, true);
            });
        };
        return flatten(categoriesData);
    }, [categoriesData]);
    var _b = (0, useApiMutation_1.useApiMutation)(), mutate = _b.mutate, loading = _b.loading, error = _b.error, reset = _b.reset;
    var defaultValues = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (!product) {
            return {
                name: '',
                name_en: undefined,
                category: '',
                price: 0,
                vat_rate: 9,
                unit: '',
                preparation_section: '',
                preparation_section_custom: undefined,
                stock_management: 'fifo',
                display_order: null,
                for_sale: true,
                has_recipe: false,
                description: undefined,
                description_en: undefined,
            };
        }
        var stockManagement = product.stock_management === 'none' ? 'none' : 'fifo';
        return {
            name: (_a = product.name) !== null && _a !== void 0 ? _a : '',
            name_en: (_b = product.name_en) !== null && _b !== void 0 ? _b : undefined,
            category: (_c = product.category) !== null && _c !== void 0 ? _c : '',
            price: (_d = product.price) !== null && _d !== void 0 ? _d : 0,
            vat_rate: (_e = product.vat_rate) !== null && _e !== void 0 ? _e : 9,
            unit: (_f = product.unit) !== null && _f !== void 0 ? _f : '',
            preparation_section: (_g = product.preparation_section) !== null && _g !== void 0 ? _g : '',
            preparation_section_custom: undefined,
            stock_management: stockManagement,
            display_order: (_h = product.display_order) !== null && _h !== void 0 ? _h : null,
            for_sale: product.for_sale === 1 || product.for_sale === true,
            has_recipe: product.has_recipe === 1 || product.has_recipe === true,
            description: (_j = product.description) !== null && _j !== void 0 ? _j : undefined,
            description_en: (_k = product.description_en) !== null && _k !== void 0 ? _k : undefined,
        };
    }, [product]);
    var _c = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(productForm_1.productFormSchema),
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
        { name: 'name', label: 'Nume produs', type: 'text', required: true, placeholder: 'Ex: Gin Tonic' },
        { name: 'name_en', label: 'Nume (EN)', type: 'text', placeholder: 'Ex: Gin & Tonic' },
        {
            name: 'category',
            label: 'Categorie',
            type: 'select',
            options: categoryOptions,
            required: true,
        },
        {
            name: 'price',
            label: 'Preț vânzare (RON)',
            type: 'number',
            step: 0.1,
            required: true,
        },
        {
            name: 'vat_rate',
            label: 'TVA %',
            type: 'number',
            step: 1,
            required: true,
            helperText: 'Ex: 9 pentru alimentație, 19 pentru băuturi alcoolice',
        },
        {
            name: 'unit',
            label: 'Unitate de măsură',
            type: 'text',
            placeholder: 'Ex: buc, ml, portie',
            required: true,
        },
        {
            name: 'preparation_section',
            label: 'Secțiune de preparare',
            type: 'select',
            options: PREPARATION_SECTIONS.map(function (section) { return ({ label: section, value: section }); }),
            allowCustomOption: true,
            customOptionLabel: 'Secțiune nouă',
            customFieldPlaceholder: 'Ex: Coffee Bar',
        },
        {
            name: 'stock_management',
            label: 'Gestionare stoc',
            type: 'select',
            options: STOCK_OPTIONS,
            required: true,
        },
        {
            name: 'display_order',
            label: 'Ordine în meniu',
            type: 'number',
            helperText: 'Număr mai mic = apare mai sus în meniu',
        },
        {
            name: 'for_sale',
            label: 'Disponibil la vânzare',
            type: 'checkbox',
            placeholder: 'Produsul apare în meniuri și comenzi',
        },
        {
            name: 'has_recipe',
            label: 'Are rețetă asociată',
            type: 'checkbox',
            placeholder: 'Produsul folosește componente din stoc',
        },
        {
            name: "Description",
            label: 'Descriere (RO)',
            type: 'textarea',
            colSpan: 2,
            placeholder: 'Notează ingrediente, alergeni și informații din meniu.',
        },
        {
            name: 'description_en',
            label: 'Descriere (EN)',
            type: 'textarea',
            colSpan: 2,
        },
    ]; }, [categoryOptions]);
    var onSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var preparationSection, payload, endpoint, method, result;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    preparationSection = values.preparation_section === '__custom__' ? values.preparation_section_custom : values.preparation_section;
                    payload = {
                        name: values.name,
                        name_en: (_a = values.name_en) !== null && _a !== void 0 ? _a : null,
                        category: values.category,
                        price: values.price,
                        vat_rate: values.vat_rate,
                        unit: values.unit,
                        description: (_b = values.description) !== null && _b !== void 0 ? _b : null,
                        description_en: (_c = values.description_en) !== null && _c !== void 0 ? _c : null,
                        preparation_section: preparationSection !== null && preparationSection !== void 0 ? preparationSection : null,
                        stock_management: values.stock_management || 'fifo',
                        display_order: (_d = values.display_order) !== null && _d !== void 0 ? _d : null,
                        is_sellable: values.for_sale ? 1 : 0,
                        has_recipe: values.has_recipe ? 1 : 0,
                        is_active: values.for_sale ? 1 : 0,
                    };
                    endpoint = isEditing && product ? "/api/catalog/products/".concat(product.id) : '/api/catalog/products';
                    method = isEditing ? 'put' : 'post';
                    return [4 /*yield*/, mutate({ url: endpoint, method: method, data: payload })];
                case 1:
                    result = _e.sent();
                    if (result !== null) {
                        onSaved();
                        resetForm(defaultValues);
                        onClose();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={onClose} size="xl" title={isEditing ? "Editeaz\u0103 produsul \u201E".concat(product === null || product === void 0 ? void 0 : product.name, "\u201D") : 'Adaugă produs în catalog'} description="Configurează produsul pentru meniuri digitale, PDF și POS.">
      {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}

      <SmartForm_1.SmartForm fields={fields} control={control} errors={errors} onSubmit={handleSubmit(onSubmit)} submitLabel={isEditing ? 'Actualizează produsul' : 'Adaugă produsul'} loading={loading} layoutColumns={2} secondaryAction={<button type="button" className="smart-form__cancel" onClick={function () {
                reset();
                resetForm(defaultValues);
                onClose();
            }}>"Anulează"</button>}/>
    </Modal_1.Modal>);
}
