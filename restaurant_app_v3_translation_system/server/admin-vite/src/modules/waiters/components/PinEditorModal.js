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
exports.PinEditorModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
require("./PinEditorModal.css");
var pinEditorSchema = zod_2.z
    .object({
    pin: zod_2.z
        .string()
        .regex(/^\d{4}$/, 'PIN-ul trebuie să conțină exact 4 cifre.'),
    confirmPin: zod_2.z.string(),
})
    .refine(function (values) { return values.pin === values.confirmPin; }, {
    message: 'PIN-urile nu se potrivesc.',
    path: ['confirmPin'],
});
var PinEditorModal = function (_a) {
    var open = _a.open, interfaceId = _a.interfaceId, interfaceLabel = _a.interfaceLabel, onClose = _a.onClose, onSuccess = _a.onSuccess;
    //   const { t } = useTranslation();
    var _b = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(pinEditorSchema),
        defaultValues: {
            pin: '',
            confirmPin: '',
        },
    }), register = _b.register, handleSubmit = _b.handleSubmit, reset = _b.reset, setFocus = _b.setFocus, errors = _b.formState.errors;
    var _c = (0, useApiMutation_1.useApiMutation)(), mutate = _c.mutate, loading = _c.loading, error = _c.error, resetMutation = _c.reset;
    (0, react_1.useEffect)(function () {
        if (open) {
            reset({ pin: '', confirmPin: '' });
            resetMutation();
            setTimeout(function () { return setFocus('pin'); }, 120);
        }
    }, [open, reset, setFocus, resetMutation]);
    var onSubmit = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!interfaceId) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, mutate({
                            url: '/api/admin/update-pin',
                            method: 'post',
                            data: {
                                interface: interfaceId,
                                pin: values.pin,
                            },
                        })];
                case 1:
                    result = _b.sent();
                    if (result !== null) {
                        onSuccess((_a = result === null || result === void 0 ? void 0 : result.pin) !== null && _a !== void 0 ? _a : null);
                        onClose();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={onClose} title={"Actualizeaz\u0103 PIN \u2013 ".concat(interfaceLabel)} description="Introduce un PIN nou de 4 cifre și confirmă actualizarea. Rotația PIN-urilor este obligatorie pentru securitate." size="md">
      {error ? <InlineAlert_1.InlineAlert type="error" message={error}/> : null}
      <form className="pin-editor__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="pin-editor__field">
          <label htmlFor="pin">PIN nou (4 cifre)</label>
          <input id="pin" type="password" maxLength={4} autoComplete="one-time-code" inputMode="numeric" {...register('pin')}/>
          {errors.pin ? <span className="pin-editor__error">{errors.pin.message}</span> : null}
        </div>
        <div className="pin-editor__field">
          <label htmlFor="confirmPin">Confirmare PIN</label>
          <input id="confirmPin" type="password" maxLength={4} autoComplete="one-time-code" inputMode="numeric" {...register('confirmPin')}/>
          {errors.confirmPin ? <span className="pin-editor__error">{errors.confirmPin.message}</span> : null}
        </div>
        <div className="pin-editor__actions">
          <button type="button" onClick={onClose} className="pin-editor__button pin-editor__button--secondary">"Anulează"</button>
          <button type="submit" className="pin-editor__button pin-editor__button--primary" disabled={loading}>
            {loading ? 'Se salvează…' : 'Salvează PIN-ul'}
          </button>
        </div>
      </form>
    </Modal_1.Modal>);
};
exports.PinEditorModal = PinEditorModal;
