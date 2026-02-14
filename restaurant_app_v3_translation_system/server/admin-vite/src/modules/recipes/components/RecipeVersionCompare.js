"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeVersionCompare = RecipeVersionCompare;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var Modal_1 = require("@/shared/components/Modal");
require("./RecipeVersionCompare.css");
function RecipeVersionCompare(_a) {
    var open = _a.open, recipeId = _a.recipeId, version1 = _a.version1, version2 = _a.version2, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)(null), comparison = _b[0], setComparison = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        if (!open || !recipeId)
            return;
        setLoading(true);
        setError(null);
        httpClient_1.httpClient
            .get("/api/admin/recipes/".concat(recipeId, "/versions/compare/").concat(version1, "/").concat(version2))
            .then(function (response) {
            var _a;
            setComparison(((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || null);
        })
            .catch(function (err) {
            setError(err.message || 'Eroare la compararea versiunilor');
        })
            .finally(function () {
            setLoading(false);
        });
    }, [open, recipeId, version1, version2]);
    var formatCost = function (cost) {
        //   const { t } = useTranslation();
        return "".concat(cost.toFixed(2), " RON");
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    if (!open)
        return null;
    return (<Modal_1.Modal isOpen={open} title={"Comparare Versiuni: v".concat(version1, " vs v").concat(version2)} size="xl" onClose={onClose}>
      {error && <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/>}

      {loading ? (<div className="version-compare-loading">"se compara versiunile"</div>) : !comparison ? (<div className="version-compare-empty">"nu s au putut compara versiunile"</div>) : (<div className="version-compare">
          {/* Version Info */}
          <div className="compare-versions-info">
            <div className="version-info-box">
              <h4>Versiunea {comparison.version1.number}</h4>
              <p className="text-muted">{formatDate(comparison.version1.changed_at)}</p>
              <p className="text-muted">de {comparison.version1.changed_by}</p>
              <p className="cost-info">{formatCost(comparison.version1.cost.total)}</p>
              <p className="ingredients-count">{comparison.version1.ingredients_count} ingrediente</p>
            </div>
            <div className="version-info-box">
              <h4>Versiunea {comparison.version2.number}</h4>
              <p className="text-muted">{formatDate(comparison.version2.changed_at)}</p>
              <p className="text-muted">de {comparison.version2.changed_by}</p>
              <p className="cost-info">{formatCost(comparison.version2.cost.total)}</p>
              <p className="ingredients-count">{comparison.version2.ingredients_count} ingrediente</p>
            </div>
          </div>

          {/* Cost Difference */}
          <div className="compare-section">
            <h3>"diferente cost"</h3>
            <div className="cost-comparison">
              <div className="cost-item">
                <span className="cost-label">Cost anterior:</span>
                <span className="cost-value">{formatCost(comparison.differences.cost.before)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Cost nou:</span>
                <span className="cost-value">{formatCost(comparison.differences.cost.after)}</span>
              </div>
              <div className={"cost-difference ".concat(comparison.differences.cost.difference > 0 ? 'increase' : 'decrease')}>
                <span className="cost-label">"Diferență:"</span>
                <span className="cost-value">
                  {comparison.differences.cost.difference > 0 ? '+' : ''}
                  {formatCost(comparison.differences.cost.difference)} (
                  {comparison.differences.cost.percentage > 0 ? '+' : ''}
                  {comparison.differences.cost.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients Differences */}
          <div className="compare-section">
            <h3>"diferente ingrediente"</h3>

            {comparison.differences.ingredients.added.length > 0 && (<div className="ingredients-diff added">
                <h4>➕ Ingrediente Adăugate ({comparison.differences.ingredients.added.length})</h4>
                <ul>
                  {comparison.differences.ingredients.added.map(function (ing) { return (<li key={ing.ingredient_id}>
                      <strong>{ing.ingredient_name}</strong>: {ing.quantity} {ing.unit}
                    </li>); })}
                </ul>
              </div>)}

            {comparison.differences.ingredients.removed.length > 0 && (<div className="ingredients-diff removed">
                <h4>➖ Ingrediente Eliminate ({comparison.differences.ingredients.removed.length})</h4>
                <ul>
                  {comparison.differences.ingredients.removed.map(function (ing) { return (<li key={ing.ingredient_id}>
                      <strong>{ing.ingredient_name}</strong>: {ing.quantity} {ing.unit}
                    </li>); })}
                </ul>
              </div>)}

            {comparison.differences.ingredients.modified.length > 0 && (<div className="ingredients-diff modified">
                <h4>✏️ Ingrediente Modificate ({comparison.differences.ingredients.modified.length})</h4>
                <ul>
                  {comparison.differences.ingredients.modified.map(function (ing) { return (<li key={ing.ingredient_id}>
                      <strong>{ing.ingredient_name}</strong>:
                      <div className="modification-details">
                        <span className="old-value">
                          {ing.old.quantity} {ing.old.unit} (waste: {ing.old.waste_percentage}%)
                        </span>
                        <span className="arrow">→</span>
                        <span className="new-value">
                          {ing.new.quantity} {ing.new.unit} (waste: {ing.new.waste_percentage}%)
                        </span>
                      </div>
                    </li>); })}
                </ul>
              </div>)}

            {comparison.differences.ingredients.added.length === 0 &&
                comparison.differences.ingredients.removed.length === 0 &&
                comparison.differences.ingredients.modified.length === 0 && (<p className="text-muted">"nu exista diferente in ingrediente intre aceste ve"</p>)}
          </div>
        </div>)}
    </Modal_1.Modal>);
}
