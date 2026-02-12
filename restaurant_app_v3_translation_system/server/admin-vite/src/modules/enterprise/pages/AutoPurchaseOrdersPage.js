"use strict";
/**
 * 📦 AUTO PURCHASE ORDERS PAGE - Comenzi automate furnizori
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
exports.AutoPurchaseOrdersPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./AutoPurchaseOrdersPage.css");
var AutoPurchaseOrdersPage = function () {
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), orders = _b[0], setOrders = _b[1];
    var loadOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/purchase-orders')];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setOrders(data.orders || []);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error('Error loading orders:', err_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadOrders();
    }, []);
    var handleCheckReorder = function () { return __awaiter(void 0, void 0, void 0, function () {
        var analysisRes, analysisData, criticalSuppliers, created, _i, criticalSuppliers_1, supplier, res, data, err_2, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, fetch('/api/smart-restock-v2/analysis?days=30&forecast_days=14')];
                case 1:
                    analysisRes = _a.sent();
                    return [4 /*yield*/, analysisRes.json()];
                case 2:
                    analysisData = _a.sent();
                    if (!analysisData.success || !analysisData.supplier_orders || analysisData.supplier_orders.length === 0) {
                        alert('Nu sunt necesare comenzi în acest moment.');
                        return [2 /*return*/];
                    }
                    criticalSuppliers = analysisData.supplier_orders.filter(function (s) { return s.max_urgency >= 3; });
                    if (criticalSuppliers.length === 0) {
                        alert("Analiz\u0103 complet\u0103: ".concat(analysisData.supplier_orders.length, " furnizori identifica\u021Bi, dar niciun ingredient critic."));
                        return [2 /*return*/];
                    }
                    created = 0;
                    _i = 0, criticalSuppliers_1 = criticalSuppliers;
                    _a.label = 3;
                case 3:
                    if (!(_i < criticalSuppliers_1.length)) return [3 /*break*/, 9];
                    supplier = criticalSuppliers_1[_i];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, fetch('/api/smart-restock-v2/generate-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                supplier_id: supplier.supplier_id,
                                items: supplier.items
                            })
                        })];
                case 5:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 6:
                    data = _a.sent();
                    if (data.success) {
                        created++;
                    }
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    console.error('Error generating order:', err_2);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9:
                    alert("\u2705 Generate ".concat(created, " comenzi automate bazate pe Smart Restock ML!"));
                    loadOrders();
                    return [3 /*break*/, 11];
                case 10:
                    err_3 = _a.sent();
                    console.error('Error checking reorder:', err_3);
                    alert('Eroare la verificare: ' + err_3.message);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        switch (status) {
            case 'draft': return '#6b7280';
            case 'pending_approval': return '#f59e0b';
            case 'approved': return '#22c55e';
            case 'ordered': return '#3b82f6';
            case 'received': return '#8b5cf6';
            default: return '#6b7280';
        }
    };
    if (loading && orders.length === 0) {
        return (<div className="auto-purchase-orders-page">
        <PageHeader_1.PageHeader title="📦 Auto Purchase Orders" description="Se încarcă..."/>
        <div className="loading">⏳ Se încarcă...</div>
      </div>);
    }
    return (<div className="auto-purchase-orders-page">
      <PageHeader_1.PageHeader title="📦 Auto Purchase Orders" description="Comenzi automate către furnizori"/>

      <div className="orders-header">
        <button onClick={handleCheckReorder} className="btn-check">
          🔍 Verifică Necesarul de Recomandă
        </button>
        <button onClick={loadOrders} className="btn-refresh">
          🔄 Actualizează
        </button>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Furnizor</th>
              <th>Status</th>
              <th>Total</th>
              <th>Auto-generată</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(function (order) { return (<tr key={order.id}>
                <td><strong>#{order.id}</strong></td>
                <td>{order.supplier_name || "Furnizor ".concat(order.supplier_id)}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status.toUpperCase().replace('_', ' ')}
                  </span>
                </td>
                <td>{order.total_value ? "".concat(order.total_value.toFixed(2), " RON") : '-'}</td>
                <td>{order.auto_generated ? '✅ Da' : 'Manual'}</td>
                <td>{new Date(order.created_at).toLocaleDateString('ro-RO')}</td>
              </tr>); })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && !loading && (<div className="empty-state">
          <p>Nu există comenzi automate create.</p>
          <p>Apasă "Verifică Necesarul" pentru a genera comenzi automate bazate pe reguli de recomandă.</p>
        </div>)}
    </div>);
};
exports.AutoPurchaseOrdersPage = AutoPurchaseOrdersPage;
