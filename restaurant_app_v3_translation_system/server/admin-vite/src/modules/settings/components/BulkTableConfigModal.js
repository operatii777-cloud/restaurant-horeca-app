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
exports.BulkTableConfigModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var useApiMutation_1 = require("@/shared/hooks/useApiMutation");
require("./BulkTableConfigModal.css");
var BulkTableConfigModal = function (_a) {
    var tables = _a.tables, zones = _a.zones, onSave = _a.onSave, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(1), startTable = _b[0], setStartTable = _b[1];
    var _c = (0, react_1.useState)(200), endTable = _c[0], setEndTable = _c[1];
    var _d = (0, react_1.useState)(null), selectedZone = _d[0], setSelectedZone = _d[1];
    var _e = (0, react_1.useState)(4), seats = _e[0], setSeats = _e[1];
    var _f = (0, react_1.useState)('square'), shape = _f[0], setShape = _f[1];
    var _g = (0, react_1.useState)(true), isActive = _g[0], setIsActive = _g[1];
    var _h = (0, react_1.useState)(false), isSaving = _h[0], setIsSaving = _h[1];
    var updateTable = (0, useApiMutation_1.useApiMutation)().mutate;
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var tablesToUpdate, updatePromises, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    tablesToUpdate = tables.filter(function (table) {
                        return parseInt(table.table_number) >= startTable && parseInt(table.table_number) <= endTable;
                    });
                    updatePromises = tablesToUpdate.map(function (table) {
                        var _a;
                        return updateTable({
                            url: "/api/tables/".concat(table.id),
                            method: 'PUT',
                            data: {
                                table_number: table.table_number,
                                area_id: selectedZone,
                                seats: seats,
                                capacity: seats,
                                shape: shape,
                                is_active: isActive,
                                location: selectedZone ? ((_a = zones.find(function (z) { return z.id === selectedZone; })) === null || _a === void 0 ? void 0 : _a.name) || null : null,
                            },
                        });
                    });
                    return [4 /*yield*/, Promise.all(updatePromises)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, onSave()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Eroare la configurare bulk:', error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var tablesCount = tables.filter(function (table) {
        return parseInt(table.table_number) >= startTable && parseInt(table.table_number) <= endTable;
    }).length;
    return (<Modal_1.Modal isOpen={true} onClose={onClose} title="📦 Configurare Bulk Mese">
      <form onSubmit={handleSubmit} className="bulk-table-config-form">
        <div className="bulk-table-config-form__info">
          <p>"configureaza mesele de la"<strong>{startTable}</strong> la <strong>{endTable}</strong>.
            <br />
            <span className="bulk-table-config-form__count">
              {tablesCount} mese vor fi actualizate
            </span>
          </p>
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="startTable" className="bulk-table-config-form__label">"masa de la"</label>
          <input type="number" id="startTable" className="bulk-table-config-form__input" min={1} max={200} value={startTable} onChange={function (e) { return setStartTable(parseInt(e.target.value) || 1); }} required/>
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="endTable" className="bulk-table-config-form__label">"masa pana la"</label>
          <input type="number" id="endTable" className="bulk-table-config-form__input" min={1} max={200} value={endTable} onChange={function (e) { return setEndTable(parseInt(e.target.value) || 200); }} required/>
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="bulkZone" className="bulk-table-config-form__label">"Zonă"</label>
          <select id="bulkZone" className="bulk-table-config-form__input" value={(selectedZone === null || selectedZone === void 0 ? void 0 : selectedZone.toString()) || ''} onChange={function (e) { return setSelectedZone(e.target.value ? parseInt(e.target.value) : null); }}>
            <option value="">"fara zona"</option>
            {zones.map(function (zone) { return (<option key={zone.id} value={zone.id.toString()}>
                {zone.name}
              </option>); })}
          </select>
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="bulkSeats" className="bulk-table-config-form__label">"numar locuri"</label>
          <input type="number" id="bulkSeats" className="bulk-table-config-form__input" min={1} max={20} value={seats} onChange={function (e) { return setSeats(parseInt(e.target.value) || 4); }} required/>
        </div>

        <div className="bulk-table-config-form__field">
          <label htmlFor="bulkShape" className="bulk-table-config-form__label">"Formă"</label>
          <select id="bulkShape" className="bulk-table-config-form__input" value={shape} onChange={function (e) { return setShape(e.target.value); }}>
            <option value="square">"Pătrat"</option>
            <option value="round">Rotund</option>
            <option value="rectangle">Dreptunghi</option>
            <option value="oval">Oval</option>
          </select>
        </div>

        <div className="bulk-table-config-form__field">
          <label className="bulk-table-config-form__label">
            <input type="checkbox" checked={isActive} onChange={function (e) { return setIsActive(e.target.checked); }}/>
            <span className="bulk-table-config-form__checkbox-label">Mese active</span>
          </label>
        </div>

        <div className="bulk-table-config-form__actions">
          <button type="button" className="bulk-table-config-form__btn bulk-table-config-form__btn--secondary" onClick={onClose} disabled={isSaving}>"Anulează"</button>
          <button type="submit" className="bulk-table-config-form__btn bulk-table-config-form__btn--primary" disabled={isSaving}>
            {isSaving ? 'Se salvează...' : "\uD83D\uDCBE Aplic\u0103 pe ".concat(tablesCount, " mese")}
          </button>
        </div>
      </form>
    </Modal_1.Modal>);
};
exports.BulkTableConfigModal = BulkTableConfigModal;
