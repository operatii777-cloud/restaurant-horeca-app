"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * RECIPE SCALING PAGE - UI pentru scalare rețete
 * Data: 03 Decembrie 2025
 */
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
exports.default = RecipeScalingPage;
var react_1 = require("react");
var axios_1 = require("axios");
require("./RecipeScalingPage.css");
function RecipeScalingPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), recipes = _a[0], setRecipes = _a[1];
    var _b = (0, react_1.useState)(null), selectedRecipeId = _b[0], setSelectedRecipeId = _b[1];
    var _c = (0, react_1.useState)(1), targetPortions = _c[0], setTargetPortions = _c[1];
    var _d = (0, react_1.useState)(null), scaledRecipe = _d[0], setScaledRecipe = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    (0, react_1.useEffect)(function () {
        loadRecipes();
    }, []);
    var loadRecipes = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('/api/recipes')];
                case 1:
                    res = _a.sent();
                    setRecipes(res.data.data || []);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error('Failed to load recipes:', err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleScale = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedRecipeId || targetPortions < 1) {
                        alert('Selectează o rețetă și introdu număr valid de porții!');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, axios_1.default.post("/api/recipes/".concat(selectedRecipeId, "/scale"), {
                            targetPortions: targetPortions
                        })];
                case 2:
                    res = _c.sent();
                    setScaledRecipe(res.data.data);
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _c.sent();
                    alert('Eroare la scalare: ' + (((_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_2.message));
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleReset = function () {
        setSelectedRecipeId(null);
        setTargetPortions(1);
        setScaledRecipe(null);
    };
    return (<div className="recipe-scaling-page">
      <h1 className="page-title">🔢 Scalare Rețete (1 → N porții)</h1>

      <div className="card">
        <h3>Selectează Rețetă</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>"Rețetă"</label>
            <select value={selectedRecipeId || ''} onChange={function (e) { return setSelectedRecipeId(parseInt(e.target.value)); }}>
              <option value="">-- Alege rețetă --</option>
              {recipes.map(function (r) { return (<option key={r.id} value={r.id}>
                  {r.name} {r.base_portions ? "(baz\u0103: ".concat(r.base_portions, " por\u021Bii)") : '(fără porții bază)'}
                </option>); })}
            </select>
          </div>

          <div className="form-group">
            <label>"portii dorite"</label>
            <input type="number" min="1" value={targetPortions} onChange={function (e) { return setTargetPortions(parseInt(e.target.value) || 1); }} placeholder="Ex: 10"/>
          </div>
        </div>

        <div className="button-group">
          <button className="btn-primary" onClick={handleScale} disabled={loading}>
            {loading ? 'Calculez...' : '🔢 Scalează Rețetă'}
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            🔄 Reset
          </button>
        </div>
      </div>

      {scaledRecipe && (<div className="card scaled-result">
          <h3>✅ Rețetă Scalată: {scaledRecipe.name}</h3>
          
          <div className="scaling-summary">
            <div className="summary-item">
              <span className="label">"portii tinta"</span>
              <span className="value">{scaledRecipe.target_portions}</span>
            </div>
            <div className="summary-item">
              <span className="label">"factor scalare"</span>
              <span className="value">×{scaledRecipe.scale_factor.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Cost total:</span>
              <span className="value cost">{scaledRecipe.total_cost.toFixed(2)} RON</span>
            </div>
            <div className="summary-item">
              <span className="label">Cost/porție:</span>
              <span className="value">{(scaledRecipe.total_cost / scaledRecipe.target_portions).toFixed(2)} RON</span>
            </div>
          </div>

          <h4>"ingrediente scalate"</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>"cantitate bruta"</th>
                <th>"cantitate neta"</th>
                <th>Unitate</th>
              </tr>
            </thead>
            <tbody>
              {scaledRecipe.ingredients.map(function (ing, idx) { return (<tr key={idx}>
                  <td>{ing.ingredient_name}</td>
                  <td>{ing.quantity_gross_scaled.toFixed(2)}</td>
                  <td>{ing.quantity_net_scaled.toFixed(2)}</td>
                  <td>{ing.unit}</td>
                </tr>); })}
            </tbody>
          </table>

          <div className="button-group">
            <button className="btn-primary">📄 Generează PDF</button>
            <button className="btn-secondary">📧 Trimite pe Email</button>
          </div>
        </div>)}
    </div>);
}
