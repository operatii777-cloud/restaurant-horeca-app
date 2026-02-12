"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 💹 FOOD COST DASHBOARD PAGE - Real-time Food Cost Analysis
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
exports.FoodCostDashboardPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./FoodCostDashboardPage.css");
var FoodCostDashboardPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), dashboard = _b[0], setDashboard = _b[1];
    var _c = (0, react_1.useState)([]), categories = _c[0], setCategories = _c[1];
    var _d = (0, react_1.useState)([]), trends = _d[0], setTrends = _d[1];
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var dashboardRes, dashboardData, categoryRes, categoryData, trendsRes, trendsData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    return [4 /*yield*/, fetch('/api/food-cost/realtime')];
                case 2:
                    dashboardRes = _a.sent();
                    return [4 /*yield*/, dashboardRes.json()];
                case 3:
                    dashboardData = _a.sent();
                    if (dashboardData.success) {
                        setDashboard(dashboardData);
                    }
                    return [4 /*yield*/, fetch('/api/food-cost/by-category')];
                case 4:
                    categoryRes = _a.sent();
                    return [4 /*yield*/, categoryRes.json()];
                case 5:
                    categoryData = _a.sent();
                    if (categoryData.success) {
                        setCategories(categoryData.categories || []);
                    }
                    return [4 /*yield*/, fetch('/api/food-cost/trends?days=30')];
                case 6:
                    trendsRes = _a.sent();
                    return [4 /*yield*/, trendsRes.json()];
                case 7:
                    trendsData = _a.sent();
                    if (trendsData.success) {
                        setTrends(trendsData.trends || []);
                    }
                    return [3 /*break*/, 10];
                case 8:
                    err_1 = _a.sent();
                    console.error('Error loading food cost data:', err_1);
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadData();
        var interval = setInterval(loadData, 60000); // Refresh every minute
        return function () { return clearInterval(interval); };
    }, []);
    var getStatusColor = function (costPct, target) {
        if (costPct <= target)
            return '#22c55e'; // Green
        if (costPct <= target + 5)
            return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };
    if (loading && !dashboard) {
        return (<div className="food-cost-dashboard-page">
        <PageHeader_1.PageHeader title="💹 Food Cost Dashboard" description="Se încarcă datele..."/>
        <div className="loading">⏳ Se analizează costurile...</div>
      </div>);
    }
    return (<div className="food-cost-dashboard-page">
      <PageHeader_1.PageHeader title="💹 Food Cost Dashboard" description="Analiză costuri alimentare în timp real"/>

      {/* Target & Summary */}
      {dashboard && (<div className="target-section">
          <div className="target-card">
            <h3>Target Food Cost</h3>
            <p className="target-value">{dashboard.target}%</p>
          </div>
          <button onClick={loadData} className="btn-refresh">
            🔄 Actualizează
          </button>
        </div>)}

      {/* Period Cards */}
      {dashboard && (<div className="period-cards">
          <div className="period-card">
            <h3>"Astăzi"</h3>
            <div className="period-stats">
              <div className="stat-item">
                <span className="stat-label">Food Cost:</span>
                <span className="stat-value" style={{ color: getStatusColor(parseFloat(dashboard.today.cost_pct), dashboard.target) }}>
                  {dashboard.today.cost_pct}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Venituri:</span>
                <span className="stat-value">{dashboard.today.revenue.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Costuri:</span>
                <span className="stat-value">{dashboard.today.cost.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit:</span>
                <span className="stat-value profit">{dashboard.today.profit.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comenzi:</span>
                <span className="stat-value">{dashboard.today.orders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ticket Mediu:</span>
                <span className="stat-value">{dashboard.today.avg_ticket} RON</span>
              </div>
            </div>
          </div>

          <div className="period-card">
            <h3>Ultimele 7 Zile</h3>
            <div className="period-stats">
              <div className="stat-item">
                <span className="stat-label">Food Cost:</span>
                <span className="stat-value" style={{ color: getStatusColor(parseFloat(dashboard.week.cost_pct), dashboard.target) }}>
                  {dashboard.week.cost_pct}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Venituri:</span>
                <span className="stat-value">{dashboard.week.revenue.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Costuri:</span>
                <span className="stat-value">{dashboard.week.cost.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit:</span>
                <span className="stat-value profit">{dashboard.week.profit.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comenzi:</span>
                <span className="stat-value">{dashboard.week.orders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ticket Mediu:</span>
                <span className="stat-value">{dashboard.week.avg_ticket} RON</span>
              </div>
            </div>
          </div>

          <div className="period-card">
            <h3>"luna curenta"</h3>
            <div className="period-stats">
              <div className="stat-item">
                <span className="stat-label">Food Cost:</span>
                <span className="stat-value" style={{ color: getStatusColor(parseFloat(dashboard.month.cost_pct), dashboard.target) }}>
                  {dashboard.month.cost_pct}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Venituri:</span>
                <span className="stat-value">{dashboard.month.revenue.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Costuri:</span>
                <span className="stat-value">{dashboard.month.cost.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit:</span>
                <span className="stat-value profit">{dashboard.month.profit.toFixed(2)} RON</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comenzi:</span>
                <span className="stat-value">{dashboard.month.orders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ticket Mediu:</span>
                <span className="stat-value">{dashboard.month.avg_ticket} RON</span>
              </div>
            </div>
          </div>
        </div>)}

      {/* By Category */}
      {categories.length > 0 && (<div className="category-section">
          <h3>"food cost pe categorii"</h3>
          <div className="category-table-container">
            <table className="category-table">
              <thead>
                <tr>
                  <th>Categorie</th>
                  <th>Produse</th>
                  <th>Preț Total</th>
                  <th>Cost Total</th>
                  <th>Food Cost %</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(function (cat, idx) { return (<tr key={idx}>
                    <td><strong>{cat.category || 'Necategorizat'}</strong></td>
                    <td>{cat.products}</td>
                    <td>{cat.total_price.toFixed(2)} RON</td>
                    <td>{cat.total_cost.toFixed(2)} RON</td>
                    <td>
                      <span className="cost-pct-badge" style={{
                    color: getStatusColor(parseFloat(cat.avg_cost_pct), (dashboard === null || dashboard === void 0 ? void 0 : dashboard.target) || 30)
                }}>
                        {cat.avg_cost_pct}%
                      </span>
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </div>)}
    </div>);
};
exports.FoodCostDashboardPage = FoodCostDashboardPage;
