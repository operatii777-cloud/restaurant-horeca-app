"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 📊 MENU ENGINEERING PAGE - Analiză profitabilitate produse
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
exports.MenuEngineeringPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./MenuEngineeringPage.css");
var MenuEngineeringPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), products = _b[0], setProducts = _b[1];
    var _c = (0, react_1.useState)(null), summary = _c[0], setSummary = _c[1];
    var _d = (0, react_1.useState)(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]), startDate = _d[0], setStartDate = _d[1];
    var _e = (0, react_1.useState)(new Date().toISOString().split('T')[0]), endDate = _e[0], setEndDate = _e[1];
    var _f = (0, react_1.useState)('all'), category = _f[0], setCategory = _f[1];
    var _g = (0, react_1.useState)('all'), selectedClassification = _g[0], setSelectedClassification = _g[1];
    var loadAnalysis = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    params = new URLSearchParams(__assign({ startDate: startDate, endDate: endDate }, (category !== 'all' && { category: category })));
                    return [4 /*yield*/, fetch("/api/menu-engineering/analysis?\"Params\"")];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setProducts(data.products || []);
                        setSummary(data.summary);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error('Error loading analysis:', err_1);
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
    }, [startDate, endDate, category]);
    var getClassificationIcon = function (classification) {
        switch (classification) {
            case 'star': return '⭐';
            case 'puzzle': return '🧩';
            case 'plowhorse': return '🐴';
            case 'dog': return '🐕';
            default: return '❓';
        }
    };
    var getClassificationColor = function (classification) {
        switch (classification) {
            case 'star': return '#22c55e';
            case 'puzzle': return '#3b82f6';
            case 'plowhorse': return '#f59e0b';
            case 'dog': return '#ef4444';
            default: return '#6b7280';
        }
    };
    var filteredProducts = selectedClassification === 'all'
        ? products
        : products.filter(function (p) { return p.classification === selectedClassification; });
    if (loading && !summary) {
        return (<div className="menu-engineering-page">
        <PageHeader_1.PageHeader title='📊 menu engineering' description="Se încarcă analiza..."/>
        <div className="loading">⏳ Se analizează produsele...</div>
      </div>);
    }
    return (<div className="menu-engineering-page">
      <PageHeader_1.PageHeader title='📊 menu engineering' description="Analiză profitabilitate și popularitate produse"/>

      {/* Filters */}
      <div className="menu-engineering-filters">
        <div className="filter-group">
          <label>Perioadă:</label>
          <input type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }}/>
          <span>→</span>
          <input type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }}/>
        </div>
        <div className="filter-group">
          <label>Categorie:</label>
          <select value={category} onChange={function (e) { return setCategory(e.target.value); }}>
            <option value="all">Toate</option>
            <option value="Pizza">Pizza</option>
            <option value="Bauturi">Bauturi</option>
            <option value="Desert">Desert</option>
          </select>
        </div>
        <button onClick={loadAnalysis} className="btn-refresh">
          🔄 Actualizează
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (<div className="menu-engineering-summary">
          <div className="summary-card">
            <h3>Total Produse</h3>
            <p className="summary-value">{summary.total_products}</p>
          </div>
          <div className="summary-card">
            <h3>Venituri Totale</h3>
            <p className="summary-value">{summary.total_revenue.toFixed(2)} RON</p>
          </div>
          <div className="summary-card">
            <h3>Food Cost %</h3>
            <p className="summary-value">{summary.avg_food_cost_percent.toFixed(1)}%</p>
          </div>
          <div className="summary-card">
            <h3>Profit Total</h3>
            <p className="summary-value">{summary.total_contribution.toFixed(2)} RON</p>
          </div>
        </div>)}

      {/* Classification Tabs */}
      <div className="classification-tabs">
        <button className={selectedClassification === 'all' ? 'active' : ''} onClick={function () { return setSelectedClassification('all'); }}>
          Toate ({products.length})
        </button>
        <button className={selectedClassification === 'star' ? 'active' : ''} onClick={function () { return setSelectedClassification('star'); }} style={{ color: getClassificationColor('star') }}>
          ⭐ Stars ({(summary === null || summary === void 0 ? void 0 : summary.classification_counts.star) || 0})
        </button>
        <button className={selectedClassification === 'puzzle' ? 'active' : ''} onClick={function () { return setSelectedClassification('puzzle'); }} style={{ color: getClassificationColor('puzzle') }}>
          🧩 Puzzles ({(summary === null || summary === void 0 ? void 0 : summary.classification_counts.puzzle) || 0})
        </button>
        <button className={selectedClassification === 'plowhorse' ? 'active' : ''} onClick={function () { return setSelectedClassification('plowhorse'); }} style={{ color: getClassificationColor('plowhorse') }}>
          🐴 Plowhorses ({(summary === null || summary === void 0 ? void 0 : summary.classification_counts.plowhorse) || 0})
        </button>
        <button className={selectedClassification === 'dog' ? 'active' : ''} onClick={function () { return setSelectedClassification('dog'); }} style={{ color: getClassificationColor('dog') }}>
          🐕 Dogs ({(summary === null || summary === void 0 ? void 0 : summary.classification_counts.dog) || 0})
        </button>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Clasificare</th>
              <th>Produs</th>
              <th>Categorie</th>
              <th>Preț</th>
              <th>Cantitate</th>
              <th>Venituri</th>
              <th>Food Cost</th>
              <th>Profit</th>
              <th>CM %</th>
              <th>Recomandare</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(function (product) { return (<tr key={product.product_id}>
                <td>
                  <span className="classification-badge" style={{ backgroundColor: getClassificationColor(product.classification) }}>
                    {getClassificationIcon(product.classification)} {product.classification.toUpperCase()}
                  </span>
                </td>
                <td><strong>{product.product_name}</strong></td>
                <td>{product.category}</td>
                <td>{product.selling_price.toFixed(2)} RON</td>
                <td>{product.quantity_sold}</td>
                <td>{product.revenue.toFixed(2)} RON</td>
                <td>{product.food_cost.toFixed(2)} RON</td>
                <td><strong>{product.contribution_margin.toFixed(2)} RON</strong></td>
                <td>{product.cm_percentage.toFixed(1)}%</td>
                <td className="recommendation-cell">
                  <small>{product.recommendation}</small>
                </td>
              </tr>); })}
          </tbody>
        </table>
      </div>

      {/* Matrix Explanation */}
      <div className="matrix-explanation">
        <h3>📊 Matrix Menu Engineering</h3>
        <div className="matrix-grid">
          <div className="matrix-cell" style={{ borderColor: '#3b82f6' }}>
            <strong>🧩 PUZZLE</strong>
            <p>Profitabile dar nu populare</p>
            <p>→ Crește vizibilitatea</p>
          </div>
          <div className="matrix-cell" style={{ borderColor: '#22c55e' }}>
            <strong>⭐ STARS</strong>
            <p>Profitabile și populare</p>
            <p>→ Menține și promovează</p>
          </div>
          <div className="matrix-cell" style={{ borderColor: '#ef4444' }}>
            <strong>🐕 DOGS</strong>
            <p>Nici profitabile nici populare</p>
            <p>→ Consideră eliminarea</p>
          </div>
          <div className="matrix-cell" style={{ borderColor: '#f59e0b' }}>
            <strong>🐴 PLOWHORSES</strong>
            <p>Populare dar profit mic</p>
            <p>→ Crește prețul sau reduce costurile</p>
          </div>
        </div>
      </div>
    </div>);
};
exports.MenuEngineeringPage = MenuEngineeringPage;
