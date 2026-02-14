"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceHistoryModal = PriceHistoryModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
require("./PriceHistoryModal.css");
function PriceHistoryModal(_a) {
    var open = _a.open, product = _a.product, onClose = _a.onClose;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), entries = _b[0], setEntries = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        if (!open || !(product === null || product === void 0 ? void 0 : product.id)) {
            setEntries([]);
            setError(null);
            setLoading(false);
            return;
        }
        var isActive = true;
        setLoading(true);
        setError(null);
        httpClient_1.httpClient
            .get("/api/catalog/products/".concat(product.id, "/price-history"))
            .then(function (response) {
            var _a;
            if (!isActive) {
                return;
            }
            var payload = response.data;
            if (payload.success) {
                setEntries(Array.isArray(payload.history) ? payload.history : []);
            }
            else {
                setError((_a = payload.error) !== null && _a !== void 0 ? _a : 'Nu am putut încărca istoricul prețurilor.');
                setEntries([]);
            }
        })
            .catch(function (requestError) {
            var _a, _b, _c, _d;
            if (!isActive) {
                return;
            }
            var message = (_d = (_c = (_b = (_a = requestError === null || requestError === void 0 ? void 0 : requestError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : requestError === null || requestError === void 0 ? void 0 : requestError.message) !== null && _d !== void 0 ? _d : 'A apărut o eroare la încărcarea istoricului de preț.';
            setError(message);
            setEntries([]);
        })
            .finally(function () {
            if (isActive) {
                setLoading(false);
            }
        });
        return function () {
            isActive = false;
        };
    }, [open, product === null || product === void 0 ? void 0 : product.id]);
    var title = (0, react_1.useMemo)(function () {
        if (!product) {
            return 'Istoric preț';
        }
        return "Istoric pre\u021B \u00B7 ".concat(product.name);
    }, [product]);
    var hasEntries = entries.length > 0;
    return (<Modal_1.Modal isOpen={open} onClose={onClose} size="lg" title={title} description="Verifici ultimele modificări de preț și cotă TVA aplicate acestui produs.">
      {error ? <InlineAlert_1.InlineAlert variant="error" title="Eroare" message={error}/> : null}

      {loading ? (<div className="price-history-loading">Se încarcă istoricul…</div>) : hasEntries ? (<div className="price-history-table-wrapper">
          <table className="price-history-table">
            <thead>
              <tr>
                <th>"data modificarii"</th>
                <th>"pret vechi"</th>
                <th>"pret nou"</th>
                <th>TVA vechi</th>
                <th>TVA nou</th>
                <th>"Operator"</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(function (entry) {
                var _a, _b;
                var formattedDate = new Intl.DateTimeFormat('ro-RO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }).format(new Date(entry.changed_at));
                var oldPrice = entry.old_price != null ? "".concat(entry.old_price.toFixed(2), " RON") : '—';
                var newPrice = entry.new_price != null ? "".concat(entry.new_price.toFixed(2), " RON") : '—';
                var oldVat = entry.old_vat_rate != null ? "".concat(entry.old_vat_rate, "%") : '—';
                var newVat = entry.new_vat_rate != null ? "".concat(entry.new_vat_rate, "%") : '—';
                var operator = entry.changed_by && entry.changed_by.trim().length > 0 ? entry.changed_by : 'admin';
                return (<tr key={"".concat((_a = entry.id) !== null && _a !== void 0 ? _a : entry.changed_at, "-").concat((_b = entry.new_price) !== null && _b !== void 0 ? _b : 'unknown')}>
                    <td>{formattedDate}</td>
                    <td>{oldPrice}</td>
                    <td>
                      <strong>{newPrice}</strong>
                    </td>
                    <td>{oldVat}</td>
                    <td>{newVat}</td>
                    <td>{operator}</td>
                  </tr>);
            })}
            </tbody>
          </table>
        </div>) : (<div className="price-history-empty">
          <span>Nu există înregistrări pentru acest produs</span>
        </div>)}
    </Modal_1.Modal>);
}
