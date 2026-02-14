"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Order Summary Component
 *
 * Displays order summary (items, totals) and action buttons.
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
exports.PosOrderSummary = PosOrderSummary;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var posStore_1 = require("../store/posStore");
var useFiscalStatus_1 = require("../../anaf/hooks/useFiscalStatus");
require("./PosOrderSummary.css");
function PosOrderSummary(_a) {
    var _this = this;
    var onPayment = _a.onPayment, onFinalize = _a.onFinalize, _b = _a.isPaid, isPaid = _b === void 0 ? false : _b, _c = _a.isFiscalized, isFiscalized = _c === void 0 ? false : _c, efacturaStatus = _a.efacturaStatus, fiscalReceiptNumber = _a.fiscalReceiptNumber, fiscalReceiptDate = _a.fiscalReceiptDate, _d = _a.isStockConsumed, isStockConsumed = _d === void 0 ? false : _d, _e = _a.fiscalizing, fiscalizing = _e === void 0 ? false : _e, _f = _a.consumingStock, consumingStock = _f === void 0 ? false : _f, _g = _a.isReadyForFiscalization, isReadyForFiscalization = _g === void 0 ? false : _g, onCloseOrder = _a.onCloseOrder, orderId = _a.orderId;
    //   const { t } = useTranslation();
    var _h = (0, posStore_1.usePosStore)(), draftItems = _h.draftItems, getDraftTotal = _h.getDraftTotal, getDraftItemCount = _h.getDraftItemCount;
    var total = getDraftTotal();
    var itemCount = getDraftItemCount();
    var queryClient = (0, react_query_1.useQueryClient)();
    // FAZA 1.6 - Get fiscal status
    var fiscalStatusData = (0, useFiscalStatus_1.useFiscalStatus)(orderId || 0).data;
    var fiscalStatus = (fiscalStatusData === null || fiscalStatusData === void 0 ? void 0 : fiscalStatusData.data) || null;
    // FAZA 1.6 - Retry fiscal operations
    var retryFiscalOperation = function (orderId, operationType) { return __awaiter(_this, void 0, void 0, function () {
        var API_BASE_URL, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/admin/pos/fiscal/retry/").concat(orderId), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ operationType: operationType }),
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to retry fiscal operation: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    }); };
    var retryPrintMutation = (0, react_query_1.useMutation)({
        mutationFn: function () { return retryFiscalOperation(orderId, 'PRINT'); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['fiscal', 'status', orderId] });
        },
    });
    var retryAnafMutation = (0, react_query_1.useMutation)({
        mutationFn: function () { return retryFiscalOperation(orderId, 'ANAF_SUBMIT'); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ['fiscal', 'status', orderId] });
            queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
        },
    });
    // Get fiscal badge based on status
    var getFiscalBadge = function () {
        if (!fiscalStatus)
            return null;
        var status = fiscalStatus.status;
        var color = fiscalStatus.color;
        var message = fiscalStatus.message;
        if (status === 'FISCALIZED') {
            return (<div className="pos-status-badge pos-status-badge--success">
          ✓ {message}
        </div>);
        }
        else if (status === 'SUBMITTED') {
            return (<div className="pos-status-badge pos-status-badge--warning">
          ⏳ {message}
        </div>);
        }
        else if (status === 'REJECTED' || status === 'PRINT_FAILED') {
            return (<div className="pos-status-badge pos-status-badge--danger">
          ❌ {message}
        </div>);
        }
        else if (status === 'PRINTED') {
            return (<div className="pos-status-badge pos-status-badge--info">
          📄 {message}
        </div>);
        }
        return null;
    };
    // Calculate VAT (simplified - 19% for now)
    var subtotal = total;
    var vat = subtotal * 0.19;
    var totalWithVat = subtotal + vat;
    return (<div className="pos-order-summary">
      <div className="pos-order-summary-header">
        <h3>"sumar comanda"</h3>
        <span className="pos-order-item-count">{itemCount} produse</span>
      </div>

      <div className="pos-order-items">
        {draftItems.length === 0 ? (<p className="pos-order-empty">"nu exista produse in comanda"</p>) : (draftItems.map(function (item) { return (<div key={item.productId} className="pos-order-item">
              <div className="pos-order-item-info">
                <span className="pos-order-item-name">{item.name}</span>
                {item.notes && (<span className="pos-order-item-notes">{item.notes}</span>)}
              </div>
              <div className="pos-order-item-qty">{item.qty}×</div>
              <div className="pos-order-item-price">
                {item.total.toFixed(2)} RON
              </div>
            </div>); }))}
      </div>

      <div className="pos-order-totals">
        <div className="pos-order-total-row">
          <span>Subtotal:</span>
          <span>{subtotal.toFixed(2)} RON</span>
        </div>
        <div className="pos-order-total-row">
          <span>TVA (19%):</span>
          <span>{vat.toFixed(2)} RON</span>
        </div>
        <div className="pos-order-total-row pos-order-total-row--final">
          <span>Total:</span>
          <span>{totalWithVat.toFixed(2)} RON</span>
        </div>
      </div>

      <div className="pos-order-actions">
        {/* Payment Button */}
        {!isPaid && !isFiscalized && (<button className="pos-action-btn pos-action-btn--payment" onClick={onPayment} disabled={draftItems.length === 0 || fiscalizing || consumingStock}>
            💳 Plată
          </button>)}

        {/* Fiscalize Button */}
        {isPaid && !isFiscalized && isReadyForFiscalization && (<button className="pos-action-btn pos-action-btn--finalize" onClick={onFinalize} disabled={fiscalizing || consumingStock}>
            {fiscalizing ? (<>
                <span className="spinner-border spinner-border-sm me-2"/>"se fiscalizeaza"</>) : ('✅ Fiscalizează Comandă')}
          </button>)}

        {/* Stock Consumption Status */}
        {isFiscalized && !isStockConsumed && (<div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--fiscalized">
              ✓ Fiscalizat
            </div>
            {consumingStock ? (<div className="pos-status-badge pos-status-badge--processing">
                <span className="spinner-border spinner-border-sm me-2"/>
                Actualizare stoc...
              </div>) : (<div className="pos-status-badge pos-status-badge--warning">
                ⚠️ Se actualizează stocul...
              </div>)}
          </div>)}

        {/* FAZA 1.6 - Fiscal Status Badges */}
        {fiscalStatus && orderId && (<div className="pos-order-status">
            {getFiscalBadge()}
            
            {/* Retry buttons for failed operations */}
            {fiscalStatus.canRetry && (<div className="pos-fiscal-retry">
                {fiscalStatus.status === 'PRINT_FAILED' && (<button className="pos-action-btn pos-action-btn--retry btn-sm" onClick={function () { return retryPrintMutation.mutate(); }} disabled={retryPrintMutation.isPending}>
                    {retryPrintMutation.isPending ? 'Se reîncearcă...' : '🔄 Retrimite Print'}
                  </button>)}
                {fiscalStatus.status === 'REJECTED' && (<button className="pos-action-btn pos-action-btn--retry btn-sm" onClick={function () { return retryAnafMutation.mutate(); }} disabled={retryAnafMutation.isPending}>
                    {retryAnafMutation.isPending ? 'Se reîncearcă...' : '🔄 Retrimite ANAF'}
                  </button>)}
              </div>)}
          </div>)}

        {/* Fiscalized & Stock Consumed */}
        {isFiscalized && isStockConsumed && (<div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--fiscalized">
              ✓ Fiscalizat
            </div>
            <div className="pos-status-badge pos-status-badge--success">
              ✓ Stoc actualizat
            </div>
            {fiscalReceiptNumber && (<div className="pos-fiscal-info">
                <div className="pos-fiscal-receipt">
                  <strong>Bon Fiscal:</strong> {fiscalReceiptNumber}
                </div>
                {fiscalReceiptDate && (<div className="pos-fiscal-date">
                    <strong>Data:</strong>' '
                    {new Date(fiscalReceiptDate).toLocaleString('ro-RO')}
                  </div>)}
              </div>)}
            {onCloseOrder && (<button className="pos-action-btn pos-action-btn--close" onClick={onCloseOrder}>
                🚪 Închide Comandă & Eliberează Masa
              </button>)}
          </div>)}

        {/* Not Ready for Payment */}
        {!isPaid && !isReadyForFiscalization && draftItems.length > 0 && (<div className="pos-order-status">
            <div className="pos-status-badge pos-status-badge--warning">
              ⚠️ Comanda nu este plătită complet
            </div>
          </div>)}
      </div>
    </div>);
}
