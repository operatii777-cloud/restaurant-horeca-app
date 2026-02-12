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
exports.NutritionSearchModal = NutritionSearchModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var httpClient_1 = require("@/shared/api/httpClient");
require("./NutritionSearchModal.css");
function NutritionSearchModal(_a) {
    var _this = this;
    var open = _a.open, onClose = _a.onClose, onSelect = _a.onSelect, _b = _a.searchTerm, searchTerm = _b === void 0 ? '' : _b;
    //   const { t } = useTranslation();
    var _c = (0, react_1.useState)(searchTerm), search = _c[0], setSearch = _c[1];
    var _d = (0, react_1.useState)([]), ingredients = _d[0], setIngredients = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    (0, react_1.useEffect)(function () {
        if (open) {
            setSearch(searchTerm);
            if (searchTerm) {
                performSearch(searchTerm);
            }
        }
    }, [open, searchTerm]);
    var performSearch = function (term) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!term.trim()) {
                        setIngredients([]);
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/ingredient-catalog', {
                            params: {
                                search: term,
                                limit: 50,
                            },
                        })];
                case 2:
                    response = _c.sent();
                    data = response.data;
                    if (data.success && data.ingredients) {
                        setIngredients(data.ingredients);
                    }
                    else {
                        setIngredients([]);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error('Error searching ingredients:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la căutarea ingredientelor.');
                    setIngredients([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSearchChange = function (value) {
        setSearch(value);
        if (value.trim().length >= 2) {
            performSearch(value);
        }
        else {
            setIngredients([]);
        }
    };
    var filteredIngredients = (0, react_1.useMemo)(function () {
        return ingredients.filter(function (ing) {
            var hasNutrition = ing.energy_kcal !== null && ing.energy_kcal !== undefined ||
                ing.protein !== null && ing.protein !== undefined ||
                ing.carbs !== null && ing.carbs !== undefined ||
                ing.fat !== null && ing.fat !== undefined;
            return hasNutrition;
        });
    }, [ingredients]);
    var handleSelect = function (ingredient) {
        onSelect(ingredient);
        onClose();
    };
    return (<Modal_1.Modal isOpen={open} title='🔍 cautare date nutritionale' size="lg" onClose={onClose}>
      <div className="nutrition-search-modal">
        <div className="nutrition-search-input">
          <input type="text" value={search} onChange={function (e) { return handleSearchChange(e.target.value); }} placeholder="Caută ingredient (min. 2 caractere)..." autoFocus/>
          {loading && <span className="spinner-border spinner-border-sm ms-2"/>}
        </div>

        {error && (<div className="alert alert-danger mt-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>)}

        {!loading && !error && search.trim().length < 2 && (<div className="alert alert-info mt-3">
            <i className="fas fa-info-circle me-2"></i>
            Introdu minim 2 caractere pentru a căuta.
          </div>)}

        {!loading && !error && search.trim().length >= 2 && filteredIngredients.length === 0 && (<div className="alert alert-warning mt-3">
            <i className="fas fa-search me-2"></i>
            Nu s-au găsit ingrediente cu date nutriționale pentru "{search}".
          </div>)}

        {filteredIngredients.length > 0 && (<div className="nutrition-results mt-3">
            <h6 className="mb-3">Rezultate ({filteredIngredients.length}):</h6>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Calorii (kcal)</th>
                    <th>Proteine (g)</th>
                    <th>Carbo (g)</th>
                    <th>Grăsimi (g)</th>
                    <th>Acțiune</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map(function (ing) {
                var _a, _b, _c, _d;
                return (<tr key={ing.id} className="nutrition-result-row">
                      <td>
                        <strong>{ing.name}</strong>
                        {ing.name_en && <div className="text-muted small">{ing.name_en}</div>}
                      </td>
                      <td>{(_a = ing.energy_kcal) !== null && _a !== void 0 ? _a : '-'}</td>
                      <td>{(_b = ing.protein) !== null && _b !== void 0 ? _b : '-'}</td>
                      <td>{(_c = ing.carbs) !== null && _c !== void 0 ? _c : '-'}</td>
                      <td>{(_d = ing.fat) !== null && _d !== void 0 ? _d : '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={function () { return handleSelect(ing); }} title="selecteaza acest ingredient">
                          <i className="fas fa-check me-1"></i>
                          Selectează
                        </button>
                      </td>
                    </tr>);
            })}
                </tbody>
              </table>
            </div>
          </div>)}
      </div>
    </Modal_1.Modal>);
}
