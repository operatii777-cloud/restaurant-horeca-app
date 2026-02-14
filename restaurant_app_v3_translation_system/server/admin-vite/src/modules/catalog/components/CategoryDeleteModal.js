"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryDeleteModal = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var CategoryDeleteModal = function (_a) {
    var open = _a.open, categoryName = _a.categoryName, productCount = _a.productCount, _b = _a.loading, loading = _b === void 0 ? false : _b, onClose = _a.onClose, onConfirm = _a.onConfirm, error = _a.error;
    //   const { t } = useTranslation();
    return (<Modal_1.Modal isOpen={open} onClose={function () {
            if (!loading) {
                onClose();
            }
        }} title="stergere categorie" description="Confirmați eliminarea categoriei selectate." size="sm">
      {error ? <InlineAlert_1.InlineAlert variant="error" message={error}/> : null}

      <div className="category-delete-modal__content">
        <p>
          Categoria <strong>{categoryName !== null && categoryName !== void 0 ? categoryName : 'selectată'}</strong> va fi eliminată din structura catalogului.
        </p>
        {typeof productCount === 'number' ? (<InlineAlert_1.InlineAlert variant={productCount > 0 ? 'warning' : 'info'} message={productCount > 0
                ? "Exist\u0103 ".concat(productCount, " produse asociate acestei categorii. Mut\u0103-le \u00EEnainte de \u0219tergere.")
                : 'Nu există produse asociate – categoria poate fi ștearsă în siguranță.'}/>) : null}

        <div className="category-delete-modal__actions">
          <button type="button" className="catalog-btn catalog-btn--ghost" onClick={onClose} disabled={loading}>"Anulează"</button>
          <button type="button" className="catalog-btn catalog-btn--primary" onClick={onConfirm} disabled={loading}>
            {loading ? 'Se șterge...' : 'Șterge categoria'}
          </button>
        </div>
      </div>
    </Modal_1.Modal>);
};
exports.CategoryDeleteModal = CategoryDeleteModal;
