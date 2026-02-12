"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.B - POS Table Selector Component
 *
 * Selects table for dine-in orders.
 * - Loads tables from /api/hostess/tables
 * - Handles statuses: FREE, OCCUPIED, HAS_OPEN_ORDER
 * - On click: if has open order â†’ load order, if empty â†’ create new order
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
exports.PosTableSelector = PosTableSelector;
var react_1 = require("react");
var posStore_1 = require("../store/posStore");
var usePosOrder_1 = require("../hooks/usePosOrder");
var httpClient_1 = require("@/shared/api/httpClient");
require("./PosTableSelector.css");
function PosTableSelector() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, posStore_1.usePosStore)(), selectedTableId = _a.selectedTableId, setTable = _a.setTable, currentOrderId = _a.currentOrderId, loadOrderFromServer = _a.loadOrderFromServer, resetDraft = _a.resetDraft;
    var _b = (0, usePosOrder_1.usePosOrder)(), loadOrder = _b.loadOrder, createOrder = _b.createOrder;
    var _c = (0, react_1.useState)([]), tables = _c[0], setTables = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(null), processingTable = _f[0], setProcessingTable = _f[1];
    (0, react_1.useEffect)(function () {
        loadTables();
        // Refresh tables periodically
        var interval = setInterval(loadTables, 10000); // Every 10 seconds
        return function () { return clearInterval(interval); };
    }, []);
    var loadTables = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, tablesData, mappedTables, err_1;
        var _this = this;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/hostess/tables')];
                case 1:
                    response = _d.sent();
                    tablesData = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || [];
                    return [4 /*yield*/, Promise.all(tablesData.map(function (table) { return __awaiter(_this, void 0, void 0, function () {
                            var status, orderId, ordersResponse, orders, openOrder, err_2;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        status = table.status === 'OCCUPIED' ? 'OCCUPIED' : 'FREE';
                                        if (!table.session_id) return [3 /*break*/, 4];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, httpClient_1.httpClient.get('/api/orders/active', {
                                                params: { table_id: table.id },
                                            })];
                                    case 2:
                                        ordersResponse = _b.sent();
                                        orders = ((_a = ordersResponse.data) === null || _a === void 0 ? void 0 : _a.data) || ordersResponse.data || [];
                                        openOrder = orders.find(function (o) {
                                            return o.status === "Pending:" || o.status === "în progres" || o.status === 'open';
                                        });
                                        if (openOrder) {
                                            status = 'HAS_OPEN_ORDER';
                                            orderId = openOrder.id;
                                        }
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_2 = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/, {
                                            id: table.id,
                                            table_number: table.table_number || table.number || table.id,
                                            location: table.location,
                                            capacity: table.capacity,
                                            status: status,
                                            session_id: table.session_id,
                                            order_id: orderId,
                                        }];
                                }
                            });
                        }); }))];
                case 2:
                    mappedTables = _d.sent();
                    setTables(mappedTables);
                    setError(null);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _d.sent();
                    console.error('PosTableSelector Error loading tables:', err_1);
                    setError(((_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Eroare la încărcarea meselor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleTableClick = function (table) { return __awaiter(_this, void 0, void 0, function () {
        var order, draftItems, err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (processingTable === table.id)
                        return [2 /*return*/];
                    setProcessingTable(table.id);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, 6, 7]);
                    if (!(table.status === 'HAS_OPEN_ORDER' && table.order_id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, loadOrder(table.order_id)];
                case 2:
                    order = _c.sent();
                    if (order) {
                        draftItems = (order.items || []).map(function (item) { return ({
                            productId: item.product_id || item.productId,
                            name: item.name || item.product_name || 'Produs',
                            qty: item.quantity || item.qty || 1,
                            unitPrice: item.price || item.unit_price || 0,
                            total: (item.quantity || item.qty || 1) * (item.price || item.unit_price || 0),
                            notes: item.notes,
                            options: item.options,
                        }); });
                        // Update store
                        posStore_1.usePosStore.setState({
                            currentOrderId: Number(order.id),
                            selectedTableId: table.id,
                            draftItems: draftItems,
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    // Create new order for this table
                    setTable(table.id);
                    resetDraft();
                    _c.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    err_3 = _c.sent();
                    console.error('PosTableSelector Error handling table click:', err_3);
                    alert(((_b = (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la procesarea mesei');
                    return [3 /*break*/, 7];
                case 6:
                    setProcessingTable(null);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="pos-table-selector-loading">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Se încarcă mesele...</span>
        </div>
        <p className="text-muted mt-2">Se încarcă mesele...</p>
      </div>);
    }
    if (error) {
        return (<div className="pos-table-selector-error">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadTables}>
          <i className="fas fa-redo me-1"></i>Reîncearcă</button>
      </div>);
    }
    var getStatusLabel = function (status) {
        switch (status) {
            case 'FREE':
                return 'Liberă';
            case 'OCCUPIED':
                return 'Ocupată';
            case 'HAS_OPEN_ORDER':
                return 'Comandă deschisă';
            default:
                return status;
        }
    };
    var getStatusClass = function (status) {
        switch (status) {
            case 'FREE':
                return 'status-free';
            case 'OCCUPIED':
                return 'status-occupied';
            case 'HAS_OPEN_ORDER':
                return 'status-open-order';
            default:
                return '';
        }
    };
    return (<div className="pos-table-selector">
      <div className="pos-table-selector-header">
        <h4 className="pos-table-selector-title">Selectează Masa</h4>
        <button className="btn btn-sm btn-outline-secondary" onClick={loadTables} title="Reîncarcă mesele">
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      <div className="pos-table-grid">
        {tables.length === 0 ? (<div className="pos-table-empty">
            <p className="text-muted">Nu există mese disponibile</p>
          </div>) : (tables.map(function (table) {
            var isProcessing = processingTable === table.id;
            var isSelected = selectedTableId === table.id;
            return (<button key={table.id} className={"pos-table-btn ".concat(isSelected ? 'selected' : '', " ").concat(getStatusClass(table.status))} onClick={function () { return handleTableClick(table); }} disabled={isProcessing} title={"Masa ".concat(table.table_number, " - ").concat(getStatusLabel(table.status))}>
                {isProcessing ? (<div className="pos-table-processing">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Se procesează...</span>
                    </div>
                  </div>) : (<>
                    <span className="pos-table-number">{table.table_number}</span>
                    {table.capacity && (<span className="pos-table-capacity">
                        <i className="fas fa-users"></i> {table.capacity}
                      </span>)}
                    <span className={"pos-table-status ".concat(getStatusClass(table.status))}>
                      {getStatusLabel(table.status)}
                    </span>
                    {table.status === 'HAS_OPEN_ORDER' && (<span className="pos-table-order-badge">
                        <i className="fas fa-receipt"></i>
                      </span>)}
                  </>)}
              </button>);
        }))}
      </div>

      {selectedTableId && (<div className="pos-table-actions">
          <button className="btn btn-sm btn-outline-danger" onClick={function () {
                setTable(null);
                resetDraft();
            }}>
            <i className="fas fa-times me-1"></i>Șterge selecția</button>
        </div>)}
    </div>);
}
