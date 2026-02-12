"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Main Page
 *
 * Unified POS interface with mode switching (Tables, Fast Sale, Kiosk, Delivery).
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
exports.PosPage = PosPage;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var posStore_1 = require("../store/posStore");
var PosModeSwitcher_1 = require("../components/PosModeSwitcher");
var PosTableSelector_1 = require("../components/PosTableSelector");
var PosCustomerPanel_1 = require("../components/PosCustomerPanel");
var PosOrderSummary_1 = require("../components/PosOrderSummary");
var PosProductGrid_1 = require("../components/PosProductGrid");
var PaymentSheet_1 = require("../components/PaymentSheet");
var usePosOrder_1 = require("../hooks/usePosOrder");
var usePos_1 = require("../hooks/usePos");
var useFiscalStatus_1 = require("../../anaf/hooks/useFiscalStatus");
var useOfflineMode_1 = require("../offline/hooks/useOfflineMode");
var OfflineBanner_1 = require("../components/OfflineBanner");
var indexeddb_1 = require("../offline/db/indexeddb");
require("./PosPage.css");
/**
 * POS Main Page Component
 */
function PosPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, posStore_1.usePosStore)(), currentMode = _a.currentMode, selectedTableId = _a.selectedTableId, currentOrderId = _a.currentOrderId, setTable = _a.setTable, resetDraft = _a.resetDraft;
    var _b = (0, usePosOrder_1.usePosOrder)(), createOrder = _b.createOrder, loading = _b.loading, error = _b.error;
    var _c = (0, usePos_1.usePos)(), orderTotal = _c.orderTotal, remainingToPay = _c.remainingToPay, isOrderFullyPaid = _c.isOrderFullyPaid, hasItems = _c.hasItems, isReadyForFiscalization = _c.isReadyForFiscalization, isFiscalized = _c.isFiscalized, isStockConsumed = _c.isStockConsumed, fiscalReceiptNumber = _c.fiscalReceiptNumber, fiscalReceiptDate = _c.fiscalReceiptDate, fiscalizing = _c.fiscalizing, consumingStock = _c.consumingStock, fiscalize = _c.fiscalize;
    var _d = (0, react_1.useState)(false), showPayment = _d[0], setShowPayment = _d[1];
    var _e = (0, react_1.useState)(null), fiscalError = _e[0], setFiscalError = _e[1];
    var _f = (0, react_1.useState)(false), showFiscalError = _f[0], setShowFiscalError = _f[1];
    var _g = (0, react_1.useState)('generic'), fiscalErrorType = _g[0], setFiscalErrorType = _g[1];
    // FAZA 1.6 - Get fiscal status for current order
    var fiscalStatus = (0, useFiscalStatus_1.useFiscalStatus)(currentOrderId || 0).data;
    // FAZA 3.B - Offline mode detection
    var _h = (0, useOfflineMode_1.useOfflineMode)(), isOffline = _h.isOffline, syncStatus = _h.syncStatus;
    var handlePayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, draftItems, getDraftTotal, order, localId, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(!currentOrderId && hasItems)) return [3 /*break*/, 6];
                    if (!isOffline) return [3 /*break*/, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = posStore_1.usePosStore.getState(), draftItems = _a.draftItems, getDraftTotal = _a.getDraftTotal;
                    order = {
                        type: currentMode === "Delivery" ? "Delivery" : "Dine-In",
                        items: JSON.stringify(draftItems),
                        total: getDraftTotal(),
                        table_number: selectedTableId === null || selectedTableId === void 0 ? void 0 : selectedTableId.toString(),
                        status: "Pending:",
                        timestamp: new Date().toISOString(),
                        is_paid: false,
                    };
                    return [4 /*yield*/, (0, indexeddb_1.saveOrder)(order)];
                case 2:
                    localId = _b.sent();
                    console.log('[POS Offline] Order saved locally:', localId);
                    // Don't show alert - just continue with payment flow
                    setShowPayment(true);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error saving offline order:', error_1);
                    alert('Eroare la salvarea comenzii offline');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
                case 5:
                    // Create order first, then open payment
                    createOrder().then(function (order) {
                        if (order) {
                            setShowPayment(true);
                        }
                    });
                    return [3 /*break*/, 7];
                case 6:
                    if (currentOrderId) {
                        setShowPayment(true);
                    }
                    _b.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handlePaymentCompleted = function () {
        setShowPayment(false);
        // Payment completed - ready for fiscalization
    };
    var handleFiscalize = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2, errorMessage, errorCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentOrderId) {
                        setFiscalError('Nu există o comandă activă');
                        setFiscalErrorType('generic');
                        setShowFiscalError(true);
                        return [2 /*return*/];
                    }
                    if (!isReadyForFiscalization) {
                        setFiscalError('Comanda nu este plătită complet');
                        setFiscalErrorType('generic');
                        setShowFiscalError(true);
                        return [2 /*return*/];
                    }
                    if (isFiscalized) {
                        setFiscalError('Comanda este deja fiscalizată');
                        setFiscalErrorType('generic');
                        setShowFiscalError(true);
                        return [2 /*return*/];
                    }
                    setFiscalError(null);
                    setShowFiscalError(false);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fiscalize(currentOrderId)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('PosPage Fiscalization error:', error_2);
                    errorMessage = error_2.error || error_2.message || 'Eroare la fiscalizare';
                    errorCode = error_2.code || '';
                    if (errorCode.includes('PRINTER') || errorMessage.toLowerCase().includes('printer')) {
                        setFiscalErrorType('printer');
                        setFiscalError('Imprimanta fiscală este offline sau nu răspunde. Verifică conexiunea și încearcă din nou.');
                    }
                    else if (errorCode.includes('ANAF') || errorMessage.toLowerCase().includes('anaf')) {
                        setFiscalErrorType('anaf');
                        setFiscalError('Serviciul ANAF este indisponibil momentan. Încearcă din nou în câteva momente.');
                    }
                    else if (errorCode.includes('NOMENCLATOR') || errorMessage.toLowerCase().includes("Nomenclator") || errorMessage.toLowerCase().includes('plu')) {
                        setFiscalErrorType("Nomenclator");
                        setFiscalError('Lipsesc coduri fiscale pentru unele produse. Verifică nomenclatorul produselor.');
                    }
                    else {
                        setFiscalErrorType('generic');
                        setFiscalError(errorMessage);
                    }
                    setShowFiscalError(true);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCloseOrder = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!currentOrderId)
                return [2 /*return*/];
            if (!isFiscalized) {
                if (!confirm('Comanda nu este fiscalizată. Ești sigur că vrei să închizi comanda?')) {
                    return [2 /*return*/];
                }
            }
            // Free table
            if (selectedTableId) {
                setTable(null);
            }
            // Reset draft
            resetDraft();
            return [2 /*return*/];
        });
    }); };
    return (<div className="pos-page">
      <header className="pos-page-header">
        <h1 className="pos-page-title">POS Terminal</h1>
        <PosModeSwitcher_1.PosModeSwitcher />
      </header>

      {/* FAZA 3.B - Offline Banner */}
      <OfflineBanner_1.OfflineBanner isOffline={isOffline} syncStatus={syncStatus}/>

      <div className="pos-page-content">
        {/* Left Sidebar - Table/Customer Selection */}
        <div className="pos-page-sidebar">
          {currentMode === 'TABLES' && <PosTableSelector_1.PosTableSelector />}
          <PosCustomerPanel_1.PosCustomerPanel />
        </div>

        {/* Main Area - Product Grid */}
        <div className="pos-page-main">
          <PosProductGrid_1.PosProductGrid />
        </div>

        {/* Right Sidebar - Order Summary */}
        <div className="pos-page-summary">
          <PosOrderSummary_1.PosOrderSummary onPayment={handlePayment} onFinalize={handleFiscalize} isPaid={isOrderFullyPaid} isFiscalized={isFiscalized} fiscalReceiptNumber={fiscalReceiptNumber} fiscalReceiptDate={fiscalReceiptDate} isStockConsumed={isStockConsumed} fiscalizing={fiscalizing} consumingStock={consumingStock} isReadyForFiscalization={isReadyForFiscalization} onCloseOrder={handleCloseOrder} fiscalStatus={fiscalStatus === null || fiscalStatus === void 0 ? void 0 : fiscalStatus.data} orderId={currentOrderId}/>
        </div>
      </div>

      {error && (<div className="pos-page-error">
          <strong>Eroare:</strong> {error}
        </div>)}

      {showPayment && (<PaymentSheet_1.PaymentSheet isOpen={showPayment} orderId={currentOrderId} onClose={function () { return setShowPayment(false); }} onPaymentCompleted={handlePaymentCompleted}/>)}

      {/* Fiscal Error Modal */}
      <react_bootstrap_1.Modal show={showFiscalError} onHide={function () { return setShowFiscalError(false); }} centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>
            {fiscalErrorType === 'printer' && '⚠️ Imprimantă Offline'}
            {fiscalErrorType === 'anaf' && '⚠️ ANAF Indisponibil'}
            {fiscalErrorType === "Nomenclator" && '⚠️ Coduri Fiscale Lipsă'}
            {fiscalErrorType === 'generic' && '⚠️ Eroare Fiscalizare'}
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <react_bootstrap_1.Alert variant="danger">
            {fiscalError}
          </react_bootstrap_1.Alert>
          {fiscalErrorType === 'printer' && (<div className="mt-3">
              <p className="text-muted small">Verifică:</p>
              <ul className="text-muted small">
                <li>Conexiunea la imprimantă</li>
                <li>Statusul imprimantei (hârtie, erori)</li>
                <li>Configurarea fiscală în setări</li>
              </ul>
            </div>)}
          {fiscalErrorType === 'anaf' && (<div className="mt-3">
              <p className="text-muted small">Serviciul ANAF poate fi temporar indisponibil. Încearcă din nou.</p>
            </div>)}
          {fiscalErrorType === "Nomenclator" && (<div className="mt-3">
              <p className="text-muted small">
                Unele produse nu au coduri fiscale (PLU) configurate. Adaugă codurile în catalogul de produse.
              </p>
            </div>)}
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowFiscalError(false); }}>Închide</react_bootstrap_1.Button>
          {fiscalErrorType !== 'generic' && (<react_bootstrap_1.Button variant="primary" onClick={function () {
                setShowFiscalError(false);
                handleFiscalize();
            }}>Încearcă din nou</react_bootstrap_1.Button>)}
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
    </div>);
}
