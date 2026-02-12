"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🤖 SMART RESTOCK PAGE - Comenzi automate cu ML
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SmartRestockPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./SmartRestockPage.css");
var SmartRestockPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), data = _b[0], setData = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(30), periodDays = _d[0], setPeriodDays = _d[1];
    var _e = (0, react_1.useState)(null), generatingOrder = _e[0], setGeneratingOrder = _e[1];
    var loadAnalysis = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result, normalizedData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/smart-restock-v2/analysis?days=".concat(periodDays, "&forecast_days=14"))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        normalizedData = __assign(__assign({}, result), { supplier_orders: result.supplier_orders || [], predictions: result.predictions || [], summary: result.summary || {
                                total_low_stock_items: 0,
                                items_needing_reorder: 0,
                                critical_items: 0,
                                total_estimated_cost: '0.00',
                                suppliers_to_contact: 0,
                                sales_reorder_count: 0,
                                sales_low_count: 0,
                                sales_critical_count: 0,
                                sales_total_cost: '0.00',
                            } });
                        setData(normalizedData);
                    }
                    else {
                        setError(result.error || 'Eroare la încărcare');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    setError(err_1.message);
                    // Set empty data structure on error to prevent crashes
                    setData({
                        analysis_period_days: periodDays,
                        generated_at: new Date().toISOString(),
                        summary: {
                            total_low_stock_items: 0,
                            items_needing_reorder: 0,
                            critical_items: 0,
                            total_estimated_cost: '0.00',
                            suppliers_to_contact: 0,
                            sales_reorder_count: 0,
                            sales_low_count: 0,
                            sales_critical_count: 0,
                            sales_total_cost: '0.00',
                        },
                        predictions: [],
                        supplier_orders: [],
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadAnalysis();
    }, [periodDays]);
    var handleGenerateOrder = function (supplierOrder) { return __awaiter(void 0, void 0, void 0, function () {
        var response, result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setGeneratingOrder(supplierOrder.supplier_id);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/smart-restock-v2/generate-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                supplier_id: supplierOrder.supplier_id,
                                items: supplierOrder.items.map(function (item) { return ({
                                    ingredient_id: item.id,
                                    quantity: item.recommended_order_qty,
                                    cost_per_unit: item.cost_per_unit,
                                }); }),
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        alert("\u2705 Comand\u0103 ".concat(result.order_id, " creat\u0103 cu succes!"));
                        loadAnalysis();
                    }
                    else {
                        alert("\u274C Eroare: ".concat(result.error));
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _a.sent();
                    alert("\u274C Eroare: ".concat(err_2.message));
                    return [3 /*break*/, 6];
                case 5:
                    setGeneratingOrder(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var getUrgencyClass = function (urgency) {
        if (urgency >= 4)
            return 'urgency-critical';
        if (urgency >= 3)
            return 'urgency-high';
        if (urgency >= 2)
            return 'urgency-medium';
        return 'urgency-low';
    };
    if (loading) {
        return (<div className="smart-restock-page">
        <PageHeader_1.PageHeader title="🤖 Smart Restock" description="Se analizează datele..."/>
        <div className="loading-spinner">⏳ Analiză în curs...</div>
      </div>);
    }
    if (error) {
        return (<div className="smart-restock-page">
        <PageHeader_1.PageHeader title="🤖 Smart Restock" description="Eroare la încărcare"/>
        <div className="error-message">❌ {error}</div>
        <button onClick={loadAnalysis} className="btn-retry">"Reîncearcă"</button>
      </div>);
    }
    return (<div className="smart-restock-page" data-page-ready="true">
      <PageHeader_1.PageHeader title='🤖 smart restock comenzi automate ml' description={"Analiz\u0103 bazat\u0103 pe ultimele ".concat(periodDays, " zile. Generat: ").concat((data === null || data === void 0 ? void 0 : data.generated_at) ? new Date(data.generated_at).toLocaleString('ro-RO') : '')} actions={[
            { label: '🔄 Refresh', variant: 'secondary', onClick: loadAnalysis },
        ]}>
        {(data === null || data === void 0 ? void 0 : data.summary) && (<div className="suppliers-header-badge">
            <span className="badge-icon">🏪</span>
            <span className="badge-value">{data.summary.suppliers_to_contact}</span>
            <span className="badge-label">Furnizori</span>
          </div>)}
      </PageHeader_1.PageHeader>

      {/* Period Selector */}
      <div className="period-selector">
        <label>Perioada analiză:</label>
        <select value={periodDays} onChange={function (e) { return setPeriodDays(Number(e.target.value)); }}>
          <option value={7}>7 zile</option>
          <option value={14}>14 zile</option>
          <option value={30}>30 zile</option>
          <option value={60}>60 zile</option>
          <option value={90}>90 zile</option>
        </select>
      </div>

      {/* Summary Cards */}
      {(data === null || data === void 0 ? void 0 : data.summary) && (<div className="summary-grid">
          {/* Group 1: Consolidated / Real-time Stock Needs */}
          <div className="summary-card">
            <div className="summary-value">{data.summary.total_low_stock_items}</div>
            <div className="summary-label">Stoc Scăzut (Total)</div>
          </div>
          <div className="summary-card warning">
            <div className="summary-value">{data.summary.items_needing_reorder}</div>
            <div className="summary-label">Necesită Comandă</div>
          </div>
          <div className="summary-card danger">
            <div className="summary-value">{data.summary.critical_items}</div>
            <div className="summary-label">Critice (Real)</div>
          </div>
          <div className="summary-card info">
            <div className="summary-value">{data.summary.total_estimated_cost} RON</div>
            <div className="summary-label">Cost Estimat Total</div>
          </div>

          {/* Group 2: Pure Sales Predictions (Logica Inițială) */}
          <div className="summary-card alt">
            <div className="summary-value">{data.summary.sales_reorder_count}</div>
            <div className="summary-label">Analiză Vânzări</div>
          </div>
          <div className="summary-card alt warning">
            <div className="summary-value">{data.summary.sales_low_count}</div>
            <div className="summary-label">Cerere Prognozată</div>
          </div>
          <div className="summary-card alt danger">
            <div className="summary-value">{data.summary.sales_critical_count}</div>
            <div className="summary-label">Urgențe Vânzări</div>
          </div>
          <div className="summary-card alt info">
            <div className="summary-value">{data.summary.sales_total_cost} RON</div>
            <div className="summary-label">Cost Prognozat</div>
          </div>

        </div>)}

      {/* Supplier Orders */}
      <section className="supplier-orders-section">
        <h2>📦 Comenzi Sugerate pe Furnizori</h2>
        {!(data === null || data === void 0 ? void 0 : data.supplier_orders) || data.supplier_orders.length === 0 ? (<p className="no-data">✅ Toate stocurile sunt OK! Nu sunt necesare comenzi.</p>) : (<div className="supplier-orders-grid">
            {data.supplier_orders.map(function (order) { return (<div key={order.supplier_id} className={"supplier-order-card ".concat(getUrgencyClass(order.max_urgency))}>
                <div className="supplier-header">
                  <h3>🏪 {order.supplier_name}</h3>
                  <span className={"urgency-badge ".concat(getUrgencyClass(order.max_urgency))}>
                    {order.max_urgency >= 4 ? '🔴 URGENT' : order.max_urgency >= 3 ? '🟠 HIGH' : '🟡 MEDIUM'}
                  </span>
                </div>

                <div className="supplier-items">
                  {order.items.map(function (item) { return (<div key={item.id} className="supplier-item">
                      <span className="item-name">{item.ingredient_name}</span>
                      <span className="item-qty">
                        {item.recommended_order_qty} {item.unit}
                      </span>
                      <span className="item-cost">{item.estimated_cost} RON</span>
                      <span className={"item-days ".concat(item.days_until_stockout <= 3 ? 'critical' : '')}>
                        {item.days_until_stockout} zile
                      </span>
                    </div>); })}
                </div>

                <div className="supplier-footer">
                  <span className="total-cost">
                    Total: <strong>{order.total_cost.toFixed(2)} RON</strong>
                  </span>
                  <button className="btn-generate-order" onClick={function () { return handleGenerateOrder(order); }} disabled={generatingOrder === order.supplier_id}>
                    {generatingOrder === order.supplier_id ? '⏳ Se generează...' : '📝 Generează Comandă'}
                  </button>
                </div>
              </div>); })}
          </div>)}
      </section>

      {/* Detailed Predictions Table */}
      <section className="predictions-section">
        <h2>📊 Detalii Predicții</h2>
        <table className="predictions-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Stoc Actual</th>
              <th>Minim</th>
              <th>Consum/zi</th>
              <th>Zile Rămase</th>
              <th>Recomandare</th>
              <th>Cost Est.</th>
              <th>Urgență</th>
            </tr>
          </thead>
          <tbody>
            {data === null || data === void 0 ? void 0 : data.predictions.map(function (pred) { return (<tr key={pred.id} className={getUrgencyClass(pred.urgency)}>
                <td><strong>{pred.ingredient_name}</strong></td>
                <td>{pred.current_stock} {pred.unit}</td>
                <td>{pred.min_stock_alert} {pred.unit}</td>
                <td>{pred.daily_consumption} {pred.unit}</td>
                <td className={pred.days_until_stockout <= 3 ? 'critical' : ''}>
                  {pred.days_until_stockout === 999 ? '∞' : pred.days_until_stockout}
                </td>
                <td>{pred.recommended_order_qty} {pred.unit}</td>
                <td>{pred.estimated_cost} RON</td>
                <td>
                  <span className={"urgency-badge ".concat(getUrgencyClass(pred.urgency))}>
                    {pred.urgency_label}
                  </span>
                </td>
              </tr>); })}
          </tbody>
        </table>
      </section>
    </div>);
};
exports.SmartRestockPage = SmartRestockPage;
exports.default = exports.SmartRestockPage;
