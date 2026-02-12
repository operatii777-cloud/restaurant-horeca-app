"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - Payment Sheet Component (Main Payment Orchestrator)
 *
 * Main component that ties everything together for payment processing
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
exports.PaymentSheet = PaymentSheet;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var posStore_1 = require("../store/posStore");
var posApi_1 = require("../api/posApi");
var PaymentMethodSelector_1 = require("./PaymentMethodSelector");
var PaymentAmountInput_1 = require("./PaymentAmountInput");
var PaymentsList_1 = require("./PaymentsList");
var SplitBill_1 = require("./SplitBill");
require("./PaymentSheet.css");
function PaymentSheet(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, orderId = _a.orderId, onPaymentCompleted = _a.onPaymentCompleted;
    //   const { t } = useTranslation();
    var _b = (0, posStore_1.usePosStore)(), payments = _b.payments, addPayment = _b.addPayment, removePayment = _b.removePayment, getTotal = _b.getTotal, getTotalPaid = _b.getTotalPaid, getRemaining = _b.getRemaining, currentOrderId = _b.currentOrderId, draftItems = _b.draftItems, splitBill = _b.splitBill, selectedGroupId = _b.selectedGroupId, setSplitBill = _b.setSplitBill, clearSplitBill = _b.clearSplitBill, setSelectedGroup = _b.setSelectedGroup, getGroupTotal = _b.getGroupTotal, getGroupPaid = _b.getGroupPaid, getGroupRemaining = _b.getGroupRemaining, areAllGroupsPaid = _b.areAllGroupsPaid;
    var _c = (0, react_1.useState)('cash'), selectedMethod = _c[0], setSelectedMethod = _c[1];
    var _d = (0, react_1.useState)(''), amount = _d[0], setAmount = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), isAdding = _g[0], setIsAdding = _g[1];
    var _h = (0, react_1.useState)(false), showSplitBill = _h[0], setShowSplitBill = _h[1];
    var orderTotal = getTotal();
    var totalPaid = getTotalPaid();
    var remaining = getRemaining();
    // Split Bill logic
    var isSplitMode = splitBill !== null;
    var activeGroupRemaining = isSplitMode && selectedGroupId
        ? getGroupRemaining(selectedGroupId)
        : remaining;
    var activeGroupTotal = isSplitMode && selectedGroupId
        ? getGroupTotal(selectedGroupId)
        : orderTotal;
    var activeGroupPaid = isSplitMode && selectedGroupId
        ? getGroupPaid(selectedGroupId)
        : totalPaid;
    // Use split bill remaining or regular remaining
    var displayRemaining = isSplitMode ? activeGroupRemaining : remaining;
    var displayTotal = isSplitMode ? activeGroupTotal : orderTotal;
    var displayPaid = isSplitMode ? activeGroupPaid : totalPaid;
    // Auto-set amount when method changes
    (0, react_1.useEffect)(function () {
        if (selectedMethod) {
            // Protocol și Degustare: plată 0 (cadou / pe protocol)
            if (selectedMethod === 'protocol' || selectedMethod === 'degustare') {
                setAmount('0');
            }
            else if (displayRemaining > 0 && !amount) {
                setAmount(displayRemaining.toFixed(2));
            }
        }
    }, [selectedMethod, displayRemaining]);
    // Reset state when modal opens/closes
    (0, react_1.useEffect)(function () {
        if (isOpen) {
            setError(null);
            setAmount('');
            if (displayRemaining > 0) {
                setAmount(displayRemaining.toFixed(2));
            }
        }
    }, [isOpen, displayRemaining]);
    var parseAmount = function () {
        //   const { t } = useTranslation();
        if (!amount)
            return 0;
        var normalized = amount.replace(',', '.');
        var parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    };
    var handleAddPayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var numericAmount, isProtocolOrDegustare_1, maxAmount, groupRemaining, activeOrderId, payment, newGroupRemaining, newRemaining, apiError_1, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setError(null);
                    setIsAdding(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    // Validation
                    if (!selectedMethod) {
                        setError('Selectează metoda de plată');
                        return [2 /*return*/];
                    }
                    numericAmount = parseAmount();
                    isProtocolOrDegustare_1 = selectedMethod === 'protocol' || selectedMethod === 'degustare';
                    if (numericAmount < 0) {
                        setError('Suma nu poate fi negativă');
                        return [2 /*return*/];
                    }
                    if (numericAmount <= 0 && !isProtocolOrDegustare_1) {
                        setError('Introdu o sumă mai mare decât 0');
                        return [2 /*return*/];
                    }
                    maxAmount = isSplitMode && selectedGroupId
                        ? getGroupRemaining(selectedGroupId)
                        : remaining;
                    if (numericAmount > maxAmount) {
                        setError("Suma dep\u0103\u0219e\u0219te r\u0103masul de \u00EEncasat (".concat(maxAmount.toFixed(2), " RON)"));
                        return [2 /*return*/];
                    }
                    // Check if group is already paid (for split mode)
                    if (isSplitMode && selectedGroupId) {
                        groupRemaining = getGroupRemaining(selectedGroupId);
                        if (groupRemaining <= 0.01) {
                            setError('Acest grup este deja plătit complet');
                            return [2 /*return*/];
                        }
                    }
                    if (!orderId && !currentOrderId) {
                        setError('Nu există o comandă activă');
                        return [2 /*return*/];
                    }
                    activeOrderId = orderId || currentOrderId;
                    if (!activeOrderId) {
                        setError('Nu există o comandă activă');
                        return [2 /*return*/];
                    }
                    payment = {
                        id: "payment-".concat(Date.now(), "-").concat(Math.random()),
                        type: selectedMethod,
                        amount: numericAmount,
                        timestamp: new Date(),
                        reference: undefined,
                        groupId: isSplitMode && selectedGroupId ? selectedGroupId : undefined,
                    };
                    // Add payment to store (optimistic update)
                    addPayment(payment);
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, posApi_1.posApi.sendPayment(activeOrderId, {
                            method: selectedMethod,
                            amount: numericAmount,
                            metadata: payment.reference ? { reference: payment.reference } : undefined,
                        })];
                case 3:
                    _c.sent();
                    // Clear amount input
                    setAmount('');
                    if (remaining - numericAmount > 0) {
                        setAmount((remaining - numericAmount).toFixed(2));
                    }
                    // Check if fully paid
                    if (isSplitMode && selectedGroupId) {
                        newGroupRemaining = getGroupRemaining(selectedGroupId) - numericAmount;
                        if (newGroupRemaining <= 0.01) {
                            // Group is paid, check if all groups are paid
                            if (areAllGroupsPaid()) {
                                if (onPaymentCompleted) {
                                    onPaymentCompleted();
                                }
                            }
                        }
                    }
                    else {
                        newRemaining = remaining - numericAmount;
                        if (newRemaining <= 0.01) {
                            // Payment completed
                            if (onPaymentCompleted) {
                                onPaymentCompleted();
                            }
                        }
                    }
                    return [3 /*break*/, 6];
                case 4:
                    apiError_1 = _c.sent();
                    // Rollback optimistic update
                    removePayment(payment.id);
                    throw apiError_1;
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [3 /*break*/, 9];
                case 7:
                    err_1 = _c.sent();
                    console.error('PaymentSheet Error adding payment:', err_1);
                    setError(((_b = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_1.message || 'Eroare la adăugarea plății');
                    return [3 /*break*/, 9];
                case 8:
                    setIsAdding(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var handleRemovePayment = function (paymentId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setLoading(true);
                removePayment(paymentId);
                // Optionally sync with backend
                // await posApi.removePayment(orderId, paymentId);
            }
            catch (err) {
                console.error('PaymentSheet Error removing payment:', err);
                setError(err.message || 'Eroare la ștergerea plății');
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleExact = function () {
        if (remaining > 0) {
            setAmount(remaining.toFixed(2));
        }
    };
    var handleClear = function () {
        setAmount('');
    };
    var isFullyPaid = isSplitMode ? areAllGroupsPaid() : remaining <= 0.01;
    var isProtocolOrDegustare = selectedMethod === 'protocol' || selectedMethod === 'degustare';
    // Pentru protocol/degustare permitem plată 0 (comandă cadou); altfel rămas > 0
    var canAddPayment = !loading && !isAdding && selectedMethod && (displayRemaining > 0 || (isProtocolOrDegustare && displayRemaining >= 0));
    // Convert draftItems to SplitBill format
    var splitBillItems = (0, react_1.useMemo)(function () {
        return draftItems.map(function (item) { return ({
            productId: item.productId,
            name: item.name,
            qty: item.qty,
            unitPrice: item.unitPrice,
            total: item.total,
        }); });
    }, [draftItems]);
    var handleSplitBillChange = function (splitPayload) {
        setSplitBill(splitPayload);
    };
    var handleSplitBillApply = function (splitPayload) {
        setSplitBill(splitPayload);
        setShowSplitBill(false);
        // Select first group
        if (splitPayload.groups.length > 0) {
            setSelectedGroup(splitPayload.groups[0].id);
        }
    };
    return (<react_bootstrap_1.Modal show={isOpen} onHide={onClose} size="lg" centered>
      <react_bootstrap_1.Modal.Header closeButton>
        <react_bootstrap_1.Modal.Title>"plata comanda"</react_bootstrap_1.Modal.Title>
      </react_bootstrap_1.Modal.Header>
      <react_bootstrap_1.Modal.Body>
        {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { return setError(null); }}>
            {error}
          </react_bootstrap_1.Alert>)}

        {/* Split Bill Button */}
        {!isSplitMode && (<div className="payment-sheet-split-section">
            <react_bootstrap_1.Button variant="outline-primary" onClick={function () { return setShowSplitBill(true); }} disabled={loading || isAdding} className="w-100 mb-3">
              <i className="fas fa-users me-2"></i>
              Split Bill
            </react_bootstrap_1.Button>
          </div>)}

        {/* Split Bill Groups Selector */}
        {isSplitMode && splitBill && (<div className="payment-sheet-groups">
            <label className="payment-groups-label">"selecteaza grup pentru plata"</label>
            <div className="payment-groups-list">
              {splitBill.groups.map(function (group) {
                var groupPaid = getGroupPaid(group.id);
                var groupRemaining = getGroupRemaining(group.id);
                var isSelected = selectedGroupId === group.id;
                var isPaid = groupRemaining <= 0.01;
                return (<react_bootstrap_1.Button key={group.id} variant={isSelected ? 'primary' : 'outline-primary'} className={"payment-group-btn ".concat(isPaid ? 'paid' : '')} onClick={function () { return !isPaid && setSelectedGroup(group.id); }} disabled={isPaid}>
                    <div className="payment-group-info">
                      <div className="payment-group-label">{group.label}</div>
                      <div className="payment-group-amounts">
                        <span className="payment-group-total">{group.total.toFixed(2)} RON</span>
                        {isPaid ? (<react_bootstrap_1.Badge bg="success">Plătit</react_bootstrap_1.Badge>) : (<span className="payment-group-remaining">
                            Rămas: {groupRemaining.toFixed(2)} RON
                          </span>)}
                      </div>
                    </div>
                  </react_bootstrap_1.Button>);
            })}
            </div>
          </div>)}

        {/* Order Summary */}
        <div className="payment-sheet-summary">
          <div className="payment-summary-row">
            <span>{isSplitMode ? 'Total grup selectat' : 'Total comandă'}:</span>
            <strong>{displayTotal.toFixed(2)} RON</strong>
          </div>
          <div className="payment-summary-row">
            <span>"Plătit:"</span>
            <strong className="text-success">{displayPaid.toFixed(2)} RON</strong>
          </div>
          <div className="payment-summary-row payment-summary-row--remaining">
            <span>"ramas de incasat"</span>
            <strong className={displayRemaining > 0 ? 'text-danger' : 'text-success'}>
              {displayRemaining.toFixed(2)} RON
            </strong>
          </div>
        </div>

        {isFullyPaid ? (<react_bootstrap_1.Alert variant="success" className="mt-3">
            <i className="fas fa-check-circle me-2"></i>
            <strong>"comanda este platita complet"</strong>
            <p className="mb-0 mt-2">"poti proceda la fiscalizare"</p>
          </react_bootstrap_1.Alert>) : (<>
            {/* Payment Method Selector */}
            <PaymentMethodSelector_1.PaymentMethodSelector selectedMethod={selectedMethod} onChange={setSelectedMethod} disabled={loading || isAdding}/>

            {/* Payment Amount Input */}
            <PaymentAmountInput_1.PaymentAmountInput value={amount} remainingAmount={displayRemaining} onChange={setAmount} onExact={handleExact} onClear={handleClear} disabled={loading || isAdding || (isSplitMode && !selectedGroupId)}/>

            {/* Add Payment Button */}
            <div className="payment-sheet-actions">
              <react_bootstrap_1.Button variant="primary" size="lg" onClick={handleAddPayment} disabled={!canAddPayment || parseAmount() <= 0 || parseAmount() > displayRemaining || (isSplitMode && !selectedGroupId)} className="w-100">
                {isAdding ? (<>
                    <span className="spinner-border spinner-border-sm me-2"/>"se proceseaza"</>) : (<>
                    <i className="fas fa-plus me-2"></i>"adauga plata"</>)}
              </react_bootstrap_1.Button>
            </div>
          </>)}

        {/* Payments List */}
        {payments.length > 0 && (<PaymentsList_1.PaymentsList payments={isSplitMode && selectedGroupId
                ? payments.filter(function (p) { return p.groupId === selectedGroupId; })
                : payments} onRemove={handleRemovePayment} disabled={loading || isAdding}/>)}
      </react_bootstrap_1.Modal.Body>
      
      {/* Split Bill Modal */}
      <react_bootstrap_1.Modal show={showSplitBill} onHide={function () { return setShowSplitBill(false); }} size="xl" centered>
        <react_bootstrap_1.Modal.Header closeButton>
          <react_bootstrap_1.Modal.Title>Split Bill</react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal.Header>
        <react_bootstrap_1.Modal.Body>
          <SplitBill_1.default total={orderTotal} items={splitBillItems} onSplit={handleSplitBillApply} onSplitChange={handleSplitBillChange}/>
        </react_bootstrap_1.Modal.Body>
        <react_bootstrap_1.Modal.Footer>
          <react_bootstrap_1.Button variant="secondary" onClick={function () { return setShowSplitBill(false); }}>"Anulează"</react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant="primary" onClick={function () {
            if (splitBill) {
                handleSplitBillApply(splitBill);
            }
        }}>"aplica split"</react_bootstrap_1.Button>
        </react_bootstrap_1.Modal.Footer>
      </react_bootstrap_1.Modal>
      <react_bootstrap_1.Modal.Footer>
        <react_bootstrap_1.Button variant="secondary" onClick={onClose} disabled={loading || isAdding}>
          {isFullyPaid ? 'Închide' : 'Anulează'}
        </react_bootstrap_1.Button>
        {isFullyPaid && onPaymentCompleted && (<react_bootstrap_1.Button variant="success" onClick={function () {
                onPaymentCompleted();
                onClose();
            }}>"continua la fiscalizare"</react_bootstrap_1.Button>)}
      </react_bootstrap_1.Modal.Footer>
    </react_bootstrap_1.Modal>);
}
