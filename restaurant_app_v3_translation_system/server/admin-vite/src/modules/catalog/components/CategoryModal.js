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
exports.CategoryModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var Modal_1 = require("@/shared/components/Modal");
var SmartForm_1 = require("@/shared/components/SmartForm");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var CategoryModal = function (_a) {
    var open = _a.open, categories = _a.categories, initialCategory = _a.initialCategory, _b = _a.parentId, parentId = _b === void 0 ? null : _b, onClose = _a.onClose, onSubmit = _a.onSubmit;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(null), submitError = _c[0], setSubmitError = _c[1];
    var _d = (0, react_1.useState)(false), submitting = _d[0], setSubmitting = _d[1];
    var defaultValues = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        return ({
            name: (_a = initialCategory === null || initialCategory === void 0 ? void 0 : initialCategory.name) !== null && _a !== void 0 ? _a : '',
            name_en: (_b = initialCategory === null || initialCategory === void 0 ? void 0 : initialCategory.name_en) !== null && _b !== void 0 ? _b : undefined,
            icon: (_c = initialCategory === null || initialCategory === void 0 ? void 0 : initialCategory.icon) !== null && _c !== void 0 ? _c : '📁',
            parent_id: initialCategory && initialCategory.parent_id
                ? String(initialCategory.parent_id)
                : parentId !== null
                    ? String(parentId)
                    : '',
        });
    }, [initialCategory, parentId]);
    var _e = (0, react_hook_form_1.useForm)({
        defaultValues: defaultValues,
    }), control = _e.control, handleSubmit = _e.handleSubmit, reset = _e.reset, errors = _e.formState.errors;
    (0, react_1.useEffect)(function () {
        if (open) {
            reset(defaultValues);
            setSubmitError(null);
        }
    }, [defaultValues, open, reset]);
    var categoryOptions = (0, react_1.useMemo)(function () {
        var flatten = function (nodes, depth) {
            if (depth === void 0) { depth = 0; }
            return nodes.flatMap(function (node) {
                if (initialCategory && node.id === initialCategory.id) {
                    return [];
                }
                var label = "".concat('‒ '.repeat(depth)).concat(node.name);
                var current = [{ label: label, value: String(node.id) }];
                var children = node.children ? flatten(node.children, depth + 1) : [];
                return __spreadArray(__spreadArray([], current, true), children, true);
            });
        };
        return flatten(categories, 0);
    }, [categories, initialCategory]);
    var fields = [
        {
            name: 'name',
            label: 'Nume categorie',
            type: 'text',
            required: true,
            placeholder: 'Ex: Cocktailuri',
        },
        {
            name: 'name_en',
            label: 'Nume (EN)',
            type: 'text',
            placeholder: 'Ex: Cocktails',
        },
        {
            name: 'icon',
            label: 'Icon',
            type: 'text',
            helperText: 'Folosește un emoji sau două caractere',
            placeholder: '🍹',
        },
        {
            name: 'parent_id',
            label: 'Categorie părinte',
            type: 'select',
            options: __spreadArray([
                { label: 'Fără părinte (nivel root)', value: '' }
            ], categoryOptions, true),
        },
    ];
    var submitHandler = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1, message;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    setSubmitting(true);
                    setSubmitError(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSubmit({
                            name: values.name.trim(),
                            name_en: ((_a = values.name_en) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                            icon: ((_b = values.icon) === null || _b === void 0 ? void 0 : _b.trim()) || null,
                            parent_id: values.parent_id ? Number(values.parent_id) : null,
                        })];
                case 2:
                    _e.sent();
                    onClose();
                    reset(defaultValues);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _e.sent();
                    message = ((_d = (_c = error_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        (error_1 instanceof Error ? error_1.message : 'Nu s-a putut salva categoria.');
                    setSubmitError(message);
                    return [3 /*break*/, 5];
                case 4:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={function () {
            if (!submitting) {
                onClose();
            }
        }} title={initialCategory ? "Editeaz\u0103 categoria \u201E".concat(initialCategory.name, "\u201D") : 'Adaugă categorie nouă'} description="Administrează structura meniurilor și a meniurilor digitale." size="md">
      {submitError ? <InlineAlert_1.InlineAlert variant="error" message={submitError}/> : null}
      <SmartForm_1.SmartForm fields={fields} control={control} errors={errors} onSubmit={handleSubmit(submitHandler)} submitLabel={initialCategory ? 'Salvează modificările' : 'Creează categoria'} loading={submitting} layoutColumns={1} secondaryAction={<button type="button" className="smart-form__cancel" onClick={onClose} disabled={submitting}>"Anulează"</button>}/>
    </Modal_1.Modal>);
};
exports.CategoryModal = CategoryModal;
