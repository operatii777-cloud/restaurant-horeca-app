"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - CostsPage PRO Version
 * Profitabilitate pe produse cu S13 COGS Engine
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostsPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var PageHeader_1 = require("@/shared/components/PageHeader");
var useProductProfitability_1 = require("../hooks/useProductProfitability");
var profitabilityApi_1 = require("../api/profitabilityApi");
var ProfitabilityKpiCard_1 = require("../components/ProfitabilityKpiCard");
var ProductProfitabilityTable_1 = require("../components/ProductProfitabilityTable");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./CostsPage.css");
var CostsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(function () {
        var date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    }), dateFrom = _a[0], setDateFrom = _a[1];
    var _b = (0, react_1.useState)(function () {
        return new Date().toISOString().split('T')[0];
    }), dateTo = _b[0], setDateTo = _b[1];
    var _c = (0, react_1.useState)(''), categoryFilter = _c[0], setCategoryFilter = _c[1];
    var _d = (0, react_1.useState)(''), foodCostFilter = _d[0], setFoodCostFilter = _d[1];
    var _e = (0, react_1.useState)(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = (0, react_1.useState)(null), feedback = _f[0], setFeedback = _f[1];
    var _g = (0, react_1.useState)(false), syncingAll = _g[0], setSyncingAll = _g[1];
    var filters = (0, react_1.useMemo)(function () { return ({
        dateFrom: dateFrom,
        dateTo: dateTo,
        categoryCode: categoryFilter || undefined,
    }); }, [dateFrom, dateTo, categoryFilter]);
    var _h = (0, useProductProfitability_1.useProductProfitability)(filters), tableRows = _h.tableRows, stats = _h.stats, loading = _h.loading, error = _h.error, refetch = _h.refetch;
    // Filtrează produsele
    var filteredRows = (0, react_1.useMemo)(function () {
        var filtered = __spreadArray([], tableRows, true);
        if (searchTerm) {
            filtered = filtered.filter(function (p) {
                return p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        if (foodCostFilter) {
            filtered = filtered.filter(function (p) {
                switch (foodCostFilter) {
                    case 'excellent':
                        return p.foodCostPercent < 25;
                    case 'good':
                        return p.foodCostPercent >= 25 && p.foodCostPercent < 30;
                    case 'warning':
                        return p.foodCostPercent >= 30 && p.foodCostPercent < 35;
                    case 'danger':
                        return p.foodCostPercent >= 35;
                    default:
                        return true;
                }
            });
        }
        return filtered;
    }, [tableRows, searchTerm, foodCostFilter]);
    var handleSyncAll = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setSyncingAll(true);
                    setFeedback(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, profitabilityApi_1.syncAllCogs)()];
                case 2:
                    result = _c.sent();
                    if (result.success) {
                        setFeedback({
                            type: 'success',
                            message: "COGS sincronizat pentru ".concat(result.synced || "Toate", " produse!"),
                        });
                        // Refresh data after sync
                        setTimeout(function () {
                            refetch();
                        }, 1000);
                    }
                    else {
                        setFeedback({
                            type: 'error',
                            message: result.message || 'Eroare la sincronizare COGS',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _c.sent();
                    console.error('Error syncing all COGS:', error_1);
                    setFeedback({
                        type: 'error',
                        message: ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error_1.message || 'Eroare la sincronizare COGS',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setSyncingAll(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Calculează KPI blocks
    var kpiBlocks = (0, react_1.useMemo)(function () {
        return {
            avgFoodCost: {
                title: 'Food Cost Mediu',
                value: "".concat(stats.avgFoodCostPercent.toFixed(1), "%"),
                subtitle: "".concat(stats.totalProducts, " produse"),
                color: stats.avgFoodCostPercent > 35 ? 'red' : stats.avgFoodCostPercent > 30 ? 'orange' : 'green',
            },
            avgMargin: {
                title: 'Marjă Medie',
                value: "".concat(stats.avgMarginPercent.toFixed(1), "%"),
                subtitle: 'Profitabilitate',
                color: stats.avgMarginPercent < 50 ? 'orange' : 'green',
            },
            totalProducts: {
                title: 'Produse Analizate',
                value: stats.totalProducts.toString(),
                subtitle: 'Cu rețete definite',
                color: 'blue',
            },
            alertsCount: {
                title: 'Alerte Food Cost',
                value: stats.alertsCount.toString(),
                subtitle: 'Food Cost > 35%',
                color: stats.alertsCount > 0 ? 'red' : 'green',
            },
        };
    }, [stats]);
    // Top/Bottom products
    var topProducts = (0, react_1.useMemo)(function () {
        return __spreadArray([], filteredRows, true).sort(function (a, b) { return b.profit - a.profit; }).slice(0, 5);
    }, [filteredRows]);
    var bottomProducts = (0, react_1.useMemo)(function () {
        return __spreadArray([], filteredRows, true).filter(function (p) { return p.foodCostPercent >= 30; })
            .sort(function (a, b) { return b.foodCostPercent - a.foodCostPercent; })
            .slice(0, 5);
    }, [filteredRows]);
    return (<div className="costs-page">
      <PageHeader_1.PageHeader title='💵 Costuri & Prețuri' description="Analiză costuri, prețuri și profitabilitate produse cu S13 COGS Engine"/>

      {error && (<react_bootstrap_1.Alert variant="danger" dismissible onClose={function () { }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </react_bootstrap_1.Alert>)}

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'} dismissible onClose={function () { return setFeedback(null); }} className="mt-3">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      {/* KPI Cards */}
      <react_bootstrap_1.Row className="mb-4">
        <react_bootstrap_1.Col md={12} lg={3}>
          <ProfitabilityKpiCard_1.ProfitabilityKpiCard kpi={kpiBlocks.avgFoodCost} loading={loading}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={3}>
          <ProfitabilityKpiCard_1.ProfitabilityKpiCard kpi={kpiBlocks.avgMargin} loading={loading}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={3}>
          <ProfitabilityKpiCard_1.ProfitabilityKpiCard kpi={kpiBlocks.totalProducts} loading={loading}/>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={12} lg={3}>
          <ProfitabilityKpiCard_1.ProfitabilityKpiCard kpi={kpiBlocks.alertsCount} loading={loading}/>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>

      {/* Filters & Actions */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-filter me-2"></i>Filtre & Acțiuni
          </h5>
          <react_bootstrap_1.Button variant="success" onClick={handleSyncAll} disabled={syncingAll || loading}>
            <i className={"fas ".concat(syncingAll ? 'fa-spinner fa-spin' : 'fa-sync-alt', " me-2")}></i>
            {syncingAll ? 'Se sincronizează...' : 'Recalculează COGS (Toate Produsele)'}
          </react_bootstrap_1.Button>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <react_bootstrap_1.Row>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Perioada de la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateFrom} onChange={function (e) { return setDateFrom(e.target.value); }} onBlur={refetch}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Perioada până la</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="date" value={dateTo} onChange={function (e) { return setDateTo(e.target.value); }} onBlur={refetch}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Caută produs</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Control type="text" placeholder='🔍 Caută produs...' value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={3}>
              <react_bootstrap_1.Form.Label>Food Cost Level:</react_bootstrap_1.Form.Label>
              <react_bootstrap_1.Form.Select value={foodCostFilter} onChange={function (e) { return setFoodCostFilter(e.target.value); }}>
                <option value="">Toate nivelurile</option>
                <option value="excellent">✅ Excelent (&lt;25%)</option>
                <option value="good">👍 Bun (25-30%)</option>
                <option value="warning">⚠️ Atenție (30-35%)</option>
                <option value="danger">❌ Pericol (&gt;35%)</option>
              </react_bootstrap_1.Form.Select>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Products Table */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>Analiză Produse ({filteredRows.length} produse)
          </h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <ProductProfitabilityTable_1.ProductProfitabilityTable rows={filteredRows} loading={loading} onSyncComplete={refetch}/>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Top/Bottom Products */}
      <react_bootstrap_1.Row>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-trophy me-2"></i>Top 5 Cele Mai Profitabile
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {topProducts.length === 0 ? (<p className="text-muted text-center">Nu există date</p>) : (topProducts.map(function (product, index) { return (<div key={product.productId} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                      <strong>
                        {index + 1}. {product.productName}
                      </strong>
                      <br />
                      <small className="text-muted">
                        {product.profit.toFixed(2)} RON profit | {product.marginPercent.toFixed(1)}% marjă
                      </small>
                    </div>
                    <react_bootstrap_1.Badge bg="success">{product.marginPercent.toFixed(1)}%</react_bootstrap_1.Badge>
                  </div>); }))}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
        <react_bootstrap_1.Col md={6}>
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>Top 5 Necesită Atenție
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {bottomProducts.length === 0 ? (<p className="text-muted text-center">Nu există produse cu Food Cost ridicat.</p>) : (bottomProducts.map(function (product, index) {
            var level = product.foodCostPercent < 25
                ? { label: 'Excelent', badge: 'success' }
                : product.foodCostPercent < 30
                    ? { label: 'Bun', badge: 'info' }
                    : product.foodCostPercent < 35
                        ? { label: 'Atenție', badge: 'warning' }
                        : { label: 'Pericol', badge: 'danger' };
            return (<div key={product.productId} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <div>
                        <strong>
                          {index + 1}. {product.productName}
                        </strong>
                        <br />
                        <small className="text-muted">
                          Food Cost: {product.foodCostPercent.toFixed(1)}%
                        </small>
                      </div>
                      <react_bootstrap_1.Badge bg={level.badge}>{level.label}</react_bootstrap_1.Badge>
                    </div>);
        }))}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </react_bootstrap_1.Col>
      </react_bootstrap_1.Row>
    </div>);
};
exports.CostsPage = CostsPage;
