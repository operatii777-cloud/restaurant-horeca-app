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
exports.TableEditorModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
require("./TableEditorModal.css");
var TableEditorModal = function (_a) {
    var _b;
    var table = _a.table, zones = _a.zones, onSave = _a.onSave, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)({
        table_number: table.table_number,
        capacity: table.capacity || table.seats || 4,
        seats: table.seats || table.capacity || 4,
        location: table.location || null,
        area_id: table.area_id || null,
        shape: table.shape || 'square',
        is_active: table.is_active !== undefined ? table.is_active : true,
    }), formData = _c[0], setFormData = _c[1];
    var _d = (0, react_1.useState)(false), isSaving = _d[0], setIsSaving = _d[1];
    var handleChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, onSave(formData)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={true} onClose={onClose} title={"Configurare Mas\u0103 #".concat(table.table_number)}>
      <form onSubmit={handleSubmit} className="table-editor-form">
        <div className="table-editor-form__field">
          <label htmlFor="area" className="table-editor-form__label">"Zonă"</label>
          <select id="area" className="table-editor-form__input" value={((_b = formData.area_id) === null || _b === void 0 ? void 0 : _b.toString()) || ''} onChange={function (e) { return handleChange('area_id', e.target.value ? parseInt(e.target.value) : null); }}>
            <option value="">"fara zona"</option>
            {zones.map(function (zone) { return (<option key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </option>); })}
          </select>
        </div>

        <div className="table-editor-form__field">
          <label htmlFor="seats" className="table-editor-form__label">"numar locuri"</label>
          <input type="number" id="seats" className="table-editor-form__input" min={1} max={20} value={formData.seats || formData.capacity || 4} onChange={function (e) {
            var seats = parseInt(e.target.value) || 4;
            handleChange('seats', seats);
            handleChange('capacity', seats);
        }}/>
        </div>

        <div className="table-editor-form__field">
          <label htmlFor="shape" className="table-editor-form__label">"Formă"</label>
          <select id="shape" className="table-editor-form__input" value={formData.shape || 'square'} onChange={function (e) { return handleChange('shape', e.target.value); }}>
            <option value="square">"Pătrat"</option>
            <option value="round">Rotund</option>
            <option value="rectangle">Dreptunghi</option>
            <option value="oval">Oval</option>
          </select>
        </div>

        <div className="table-editor-form__field">
          <label className="table-editor-form__label">
            <input type="checkbox" checked={formData.is_active || false} onChange={function (e) { return handleChange('is_active', e.target.checked); }}/>
            <span className="table-editor-form__checkbox-label">"masa activa"</span>
          </label>
        </div>

        <div className="table-editor-form__actions">
          <button type="button" className="table-editor-form__btn table-editor-form__btn--secondary" onClick={onClose} disabled={isSaving}>"Anulează"</button>
          <button type="submit" className="table-editor-form__btn table-editor-form__btn--primary" disabled={isSaving}>
            {isSaving ? 'Se salvează...' : '💾 Salvează'}
          </button>
        </div>
      </form>
    </Modal_1.Modal>);
};
exports.TableEditorModal = TableEditorModal;
