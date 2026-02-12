"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
// server/admin-vite/src/modules/recipes/components/RecipeScalingModal.tsx
// ✅ SĂPTĂMÂNA 1 - ZIUA 3: Modal pentru scaling rețete
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
exports.RecipeScalingModal = RecipeScalingModal;
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
require("./RecipeScalingModal.css");
function RecipeScalingModal(_a) {
    var _this = this;
    var open = _a.open, product = _a.product, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)((product === null || product === void 0 ? void 0 : product.servings) || 1), targetPortions = _b[0], setTargetPortions = _b[1];
    var _c = (0, react_1.useState)(1), multiplier = _c[0], setMultiplier = _c[1];
    var _d = (0, react_1.useState)(null), scaledRecipe = _d[0], setScaledRecipe = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    (0, react_1.useEffect)(function () {
        if (open && product) {
            setTargetPortions(product.servings || 1);
            setMultiplier(1);
            setScaledRecipe(null);
            setError(null);
        }
    }, [open, product]);
    var handleScale = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!product)
                        return [2 /*return*/];
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/recipes/".concat(product.id, "/scale"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ targetPortions: targetPortions })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setScaledRecipe(data);
                        setMultiplier(data.multiplier);
                    }
                    else {
                        setError(data.error || 'Eroare la calcularea rețetei scalate');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    setError(err_1.message);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleMultiplierChange = function (value) {
        setMultiplier(value);
        if (product === null || product === void 0 ? void 0 : product.servings) {
            setTargetPortions(Math.round(product.servings * value));
        }
    };
    var handlePortionsChange = function (value) {
        setTargetPortions(value);
        if (product === null || product === void 0 ? void 0 : product.servings) {
            setMultiplier(value / product.servings);
        }
    };
    if (!product)
        return null;
    return (<Modal_1.Modal isOpen={open} title={"Scale Recipe: ".concat(product.name)} size="xl" onClose={onClose}>
      {error && <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/>}
      
      <div className="recipe-scaling-modal">
        <div className="scaling-controls">
          <div className="control-group">
            <label>
              <span>Original Portions:</span>
              <input type="number" value={product.servings || 1} disabled className="control-input"/>
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <span>Target Portions:</span>
              <input type="number" value={targetPortions} onChange={function (e) { return handlePortionsChange(parseInt(e.target.value) || 1); }} min="1" className="control-input"/>
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <span>Multiplier:</span>
              <input type="number" value={multiplier.toFixed(2)} onChange={function (e) { return handleMultiplierChange(parseFloat(e.target.value) || 1); }} min="0.01" step="0.01" className="control-input"/>
            </label>
          </div>
          
          <button type="button" className="menu-product-button menu-product-button--primary" onClick={handleScale} disabled={loading || targetPortions <= 0}>
            {loading ? 'Se calculează…' : '📊 Calculate Scaled Recipe'}
          </button>
        </div>
        
        {scaledRecipe && (<div className="scaled-results">
            <h3>Scaled Recipe (×{scaledRecipe.multiplier.toFixed(2)})</h3>
            
            <div className="cost-summary">
              <div className="cost-item">
                <span className="cost-label">Original Cost:</span>
                <span className="cost-value">{scaledRecipe.originalCost.toFixed(2)} RON</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Scaled Cost:</span>
                <span className="cost-value cost-value--highlight">{scaledRecipe.totalCost.toFixed(2)} RON</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">"cost per portion"</span>
                <span className="cost-value">{scaledRecipe.costPerPortion.toFixed(2)} RON</span>
              </div>
            </div>
            
            <div className="scaled-recipes-table">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Original</th>
                    <th>Scaled</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {scaledRecipe.recipes.map(function (recipe, idx) { return (<tr key={idx}>
                      <td>
                        {recipe.ingredient_name || recipe.sub_recipe_name || 'Unknown'}
                      </td>
                      <td>
                        <span className={"item-type-badge ".concat(recipe.recipe_id ? 'badge-recipe' : 'badge-ingredient')}>
                          {recipe.recipe_id ? 'Sub-rețetă' : 'Ingredient'}
                        </span>
                      </td>
                      <td>{recipe.quantity_needed_original.toFixed(4)}</td>
                      <td className="scaled-value">{recipe.quantity_needed.toFixed(4)}</td>
                      <td>{recipe.unit}</td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          </div>)}
        
        <footer className="recipe-scaling-footer">
          <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose}>"Închide"</button>
        </footer>
      </div>
    </Modal_1.Modal>);
}
