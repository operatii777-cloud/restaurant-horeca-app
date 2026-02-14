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
exports.IngredientBulkUpdateModal = IngredientBulkUpdateModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
require("./IngredientBulkUpdateModal.css");
function IngredientBulkUpdateModal(_a) {
    var _this = this;
    var open = _a.open, ingredientIds = _a.ingredientIds, onClose = _a.onClose, onApplied = _a.onApplied;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(''), minStock = _b[0], setMinStock = _b[1];
    var _c = (0, react_1.useState)(''), costPerUnit = _c[0], setCostPerUnit = _c[1];
    var _d = (0, react_1.useState)('none'), visibilityAction = _d[0], setVisibilityAction = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var selectionCount = (0, react_1.useMemo)(function () { return ingredientIds.length; }, [ingredientIds]);
    (0, react_1.useEffect)(function () {
        if (open) {
            setMinStock('');
            setCostPerUni('');
            setVisibilityAction('none');
            setError(null);
        }
    }, [open]);
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var shouldUpdateMinStock, shouldUpdateCost, shouldToggleVisibility, parsedMinStock, parsedCost, updatePayload, promises, _i, ingredientIds_1, id, _a, ingredientIds_2, id, _b, ingredientIds_3, id, apiError_1, apiMessage;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    //   const { t } = useTranslation();
                    event.preventDefault();
                    if (!selectionCount) {
                        setError('Selectează cel puțin un ingredient pentru actualizare.');
                        return [2 /*return*/];
                    }
                    shouldUpdateMinStock = minStock.trim() !== '';
                    shouldUpdateCost = costPerUnit.trim() !== '';
                    shouldToggleVisibility = visibilityAction !== 'none';
                    if (!shouldUpdateMinStock && !shouldUpdateCost && !shouldToggleVisibility) {
                        setError('Completează cel puțin un câmp sau selectează o acțiune de vizibilitate.');
                        return [2 /*return*/];
                    }
                    parsedMinStock = shouldUpdateMinStock ? Number(minStock) : null;
                    parsedCost = shouldUpdateCost ? Number(costPerUnit) : null;
                    if (shouldUpdateMinStock && Number.isNaN(parsedMinStock)) {
                        setError('Valoarea pentru stoc minim este invalidă.');
                        return [2 /*return*/];
                    }
                    if (shouldUpdateCost && Number.isNaN(parsedCost)) {
                        setError('Valoarea pentru cost/unitate este invalidă.');
                        return [2 /*return*/];
                    }
                    setError(null);
                    setLoading(true);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    updatePayload = {};
                    if (shouldUpdateMinStock) {
                        updatePayload.min_stock = parsedMinStock;
                    }
                    if (shouldUpdateCost) {
                        updatePayload.cost_per_unit = parsedCost;
                    }
                    promises = [];
                    if (Object.keys(updatePayload).length > 0) {
                        for (_i = 0, ingredientIds_1 = ingredientIds; _i < ingredientIds_1.length; _i++) {
                            id = ingredientIds_1[_i];
                            promises.push(httpClient_1.httpClient.put("/api/ingredients/\"Id\"", updatePayload));
                        }
                    }
                    if (visibilityAction === 'hide') {
                        for (_a = 0, ingredientIds_2 = ingredientIds; _a < ingredientIds_2.length; _a++) {
                            id = ingredientIds_2[_a];
                            promises.push(httpClient_1.httpClient.patch("/api/ingredients/\"Id\"/hide"));
                        }
                    }
                    else if (visibilityAction === 'restore') {
                        for (_b = 0, ingredientIds_3 = ingredientIds; _b < ingredientIds_3.length; _b++) {
                            id = ingredientIds_3[_b];
                            promises.push(httpClient_1.httpClient.patch("/api/ingredients/\"Id\"/restore"));
                        }
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    _e.sent();
                    onApplied({
                        updatedCount: selectionCount,
                        visibilityAction: visibilityAction === 'none' ? null : visibilityAction,
                        minStock: shouldUpdateMinStock ? parsedMinStock !== null && parsedMinStock !== void 0 ? parsedMinStock : null : null,
                        costPerUnit: shouldUpdateCost ? parsedCost !== null && parsedCost !== void 0 ? parsedCost : null : null,
                    });
                    return [3 /*break*/, 5];
                case 3:
                    apiError_1 = _e.sent();
                    console.error('❌ Eroare la actualizarea în masă a ingredientelor:', apiError_1);
                    apiMessage = ((_d = (_c = apiError_1 === null || apiError_1 === void 0 ? void 0 : apiError_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        (apiError_1 === null || apiError_1 === void 0 ? void 0 : apiError_1.message) ||
                        'Actualizarea în masă a eșuat. Încearcă din nou.';
                    setError(apiMessage);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<Modal_1.Modal isOpen={open} onClose={onClose} title="actualizare in masa a ingredientelor" description={"Vor fi procesate ".concat(selectionCount, " ingrediente selectate.")} size="lg">
      {error ? <InlineAlert_1.InlineAlert variant="error" title="nu s a putut aplica modificarea" message={error}/> : null}

      <form className="ingredient-bulk-form" onSubmit={handleSubmit}>
        <div className="ingredient-bulk-grid">
          <label className="ingredient-bulk-field">
            <span>Stoc minim</span>
            <input type="number" min="0" step="0.1" value={minStock} onChange={function (event) { return setMinStock(event.target.value); }} placeholder="lasa gol pentru a nu modifica"/>
          </label>

          <label className="ingredient-bulk-field">
            <span>Cost / unitate (RON)</span>
            <input type="number" min="0" step="0.01" value={costPerUnit} onChange={function (event) { return setCostPerUnit(event.target.value); }} placeholder="lasa gol pentru a nu modifica"/>
          </label>
        </div>

        <fieldset className="ingredient-bulk-visibility">
          <legend>Vizibilitate ingredient</legend>
          <label>
            <input type="radio" name="visibility" value="none" checked={visibilityAction === 'none'} onChange={function () { return setVisibilityAction('none'); }}/>"nu modifica vizibilitatea"</label>
          <label>
            <input type="radio" name="visibility" value="hide" checked={visibilityAction === 'hide'} onChange={function () { return setVisibilityAction('hide'); }}/>"marcheaza drept neinventariabil"</label>
          <label>
            <input type="radio" name="visibility" value="restore" checked={visibilityAction === 'restore'} onChange={function () { return setVisibilityAction('restore'); }}/>"restaureaza ingredientele ascunse"</label>
        </fieldset>

        <footer className="ingredient-bulk-actions">
          <button type="button" className="ingredient-bulk-button ingredient-bulk-button--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="submit" className="ingredient-bulk-button ingredient-bulk-button--primary" disabled={loading}>
            {loading ? 'Se aplică…' : 'Aplică modificările'}
          </button>
        </footer>
      </form>
    </Modal_1.Modal>);
}
