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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LotEditorModal = LotEditorModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var Modal_1 = require("@/shared/components/Modal");
var SmartForm_1 = require("@/shared/components/SmartForm");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
var lotForm_1 = require("@/modules/lots/validators/lotForm");
require("./LotEditorModal.css");
function LotEditorModal(_a) {
    var _this = this;
    var open = _a.open, ingredientId = _a.ingredientId, ingredientName = _a.ingredientName, onClose = _a.onClose, onSaved = _a.onSaved;
    //   const { t } = useTranslation();
    var _b = (0, useApiMutation_1.useApiMutation)(), mutate = _b.mutate, loading = _b.loading, error = _b.error, reset = _b.reset;
    var defaultValues = (0, react_1.useMemo)(function () { return ({
        batch_number: '',
        barcode: undefined,
        quantity: 0,
        unit_cost: undefined,
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: null,
        supplier: undefined,
        invoice_number: undefined,
    }); }, []);
    var _c = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(lotForm_1.lotFormSchema),
        defaultValues: defaultValues,
    }), control = _c.control, handleSubmit = _c.handleSubmit, resetForm = _c.reset, errors = _c.formState.errors;
    (0, react_1.useEffect)(function () {
        if (open) {
            resetForm(defaultValues);
            reset();
        }
    }, [open, resetForm, defaultValues, reset]);
    var fields = (0, react_1.useMemo)(function () { return [
        {
            name: 'batch_number',
            label: 'Număr lot',
            type: 'text',
            required: true,
            placeholder: 'Ex: LOT-2025-001',
        },
        {
            name: "Barcode",
            label: 'Cod de bare',
            type: 'text',
            placeholder: 'Opțional',
        },
        {
            name: 'quantity',
            label: 'Cantitate recepționată',
            type: 'number',
            required: true,
            step: 0.01,
        },
        {
            name: 'unit_cost',
            label: 'Cost / unitate (RON)',
            type: 'number',
            step: 0.01,
        },
        {
            name: 'purchase_date',
            label: 'Dată recepție',
            type: 'date',
            required: true,
        },
        {
            name: 'expiry_date',
            label: 'Dată expirare',
            type: 'date',
        },
        {
            name: 'supplier',
            label: 'Furnizor',
            type: 'text',
            placeholder: 'Ex: Metro Cash & Carry',
        },
        {
            name: 'invoice_number',
            label: 'Număr factură',
            type: 'text',
            placeholder: 'Ex: FACT-1023',
        },
    ]; }, []);
    var onSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ingredientId)
                        return [2 /*return*/];
                    payload = __assign(__assign({}, values), { ingredient_id: ingredientId });
                    return [4 /*yield*/, mutate({ url: '/api/admin/inventory/batches', method: 'post', data: payload })];
                case 1:
                    result = _a.sent();
                    if (result !== null) {
                        onSaved();
                        resetForm(defaultValues);
                        onClose();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={function () {
            resetForm(defaultValues);
            reset();
            onClose();
        }} title={ingredientName ? "Adaug\u0103 lot pentru ".concat(ingredientName) : 'Adaugă lot'} description="Înregistrează un lot nou pentru trasabilitate și scăderea din stoc." size="md">
      {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}
      <SmartForm_1.SmartForm fields={fields} control={control} errors={errors} onSubmit={handleSubmit(onSubmit)} submitLabel="Salvează lotul" loading={loading} layoutColumns={1} secondaryAction={<button type="button" className="smart-form__cancel" onClick={function () {
                resetForm(defaultValues);
                reset();
                onClose();
            }}>"Anulează"</button>}/>
    </Modal_1.Modal>);
}
