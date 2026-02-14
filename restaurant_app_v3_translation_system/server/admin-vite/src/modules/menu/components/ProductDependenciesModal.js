"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductDependenciesModal = ProductDependenciesModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
require("./ProductDependenciesModal.css");
function ProductDependenciesModal(_a) {
    var _b, _c, _d, _e;
    var open = _a.open, product = _a.product, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var productId = product === null || product === void 0 ? void 0 : product.id;
    var endpoint = (0, react_1.useMemo)(function () {
        if (!open || !productId) {
            return null;
        }
        return "/api/catalog/products/".concat(productId, "/dependencies");
    }, [open, productId]);
    var _f = (0, useApiQuery_1.useApiQuery)(endpoint), data = _f.data, loading = _f.loading, error = _f.error, refetch = _f.refetch;
    var ingredients = (_c = (_b = data === null || data === void 0 ? void 0 : data.dependencies) === null || _b === void 0 ? void 0 : _b.ingredients) !== null && _c !== void 0 ? _c : [];
    var relatedProducts = (_e = (_d = data === null || data === void 0 ? void 0 : data.dependencies) === null || _d === void 0 ? void 0 : _d.related_products) !== null && _e !== void 0 ? _e : [];
    var title = product ? "Dependen\u021Be produs \u2014 ".concat(product.name) : 'Dependențe produs';
    return (<Modal_1.Modal isOpen={open} title={title} size="lg" onClose={onClose}>
      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}

      <div className="dependencies-layout">
        <section className="dependencies-section">
          <header className="dependencies-header">
            <div>
              <h3>"ingrediente reteta"</h3>
              <p>"lista ingredientelor din reteta asociata produsulu"</p>
            </div>
            <button type="button" className="menu-product-button menu-product-button--ghost" onClick={refetch} disabled={loading}>
              🔄 Reîncarcă
            </button>
          </header>

          {loading ? (<div className="dependencies-empty">Se încarcă dependențele…</div>) : ingredients.length === 0 ? (<div className="dependencies-empty">"nu exista ingrediente definite pentru acest produs"</div>) : (<div className="dependencies-table-wrapper">
              <table className="dependencies-table">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Categorie</th>
                    <th>Cantitate</th>
                    <th>"stoc curent"</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(function (ingredient) {
                var _a, _b;
                return (<tr key={ingredient.id}>
                      <td>
                        <div className="dependencies-cell-main">{ingredient.name}</div>
                        {ingredient.name_en ? <div className="dependencies-cell-sub">{ingredient.name_en}</div> : null}
                      </td>
                      <td>{(_a = ingredient.category) !== null && _a !== void 0 ? _a : '—'}</td>
                      <td>
                        {ingredient.quantity} {ingredient.unit}
                      </td>
                      <td>{(_b = ingredient.current_stock) !== null && _b !== void 0 ? _b : 0}</td>
                    </tr>);
            })}
                </tbody>
              </table>
            </div>)}
        </section>

        <section className="dependencies-section">
          <header className="dependencies-header">
            <div>
              <h3>"produse corelate"</h3>
              <p>"alte produse care folosesc aceleasi ingrediente"</p>
            </div>
          </header>

          {loading ? (<div className="dependencies-empty">Se încarcă produsele corelate…</div>) : relatedProducts.length === 0 ? (<div className="dependencies-empty">"nu au fost gasite produse care folosesc ingredient"</div>) : (<div className="dependencies-related">
              {relatedProducts.map(function (related) {
                var _a;
                return (<div key={related.id} className="dependencies-related-item">
                  <div className="dependencies-related-name">{related.name}</div>
                  <div className="dependencies-related-category">{(_a = related.category) !== null && _a !== void 0 ? _a : 'Categorie necunoscută'}</div>
                </div>);
            })}
            </div>)}
        </section>
      </div>

      <footer className="dependencies-actions">
        <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose}>"Închide"</button>
      </footer>
    </Modal_1.Modal>);
}
