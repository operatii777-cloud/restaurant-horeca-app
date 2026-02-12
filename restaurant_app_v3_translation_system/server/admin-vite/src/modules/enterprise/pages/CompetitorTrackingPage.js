"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🔍 COMPETITOR PRICE TRACKING PAGE
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
exports.CompetitorTrackingPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./CompetitorTrackingPage.css");
var CompetitorTrackingPage = function () {
    var _a;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)([]), competitors = _b[0], setCompetitors = _b[1];
    var _c = (0, react_1.useState)(null), selectedCompetitor = _c[0], setSelectedCompetitor = _c[1];
    var _d = (0, react_1.useState)([]), prices = _d[0], setPrices = _d[1];
    var _e = (0, react_1.useState)(null), comparison = _e[0], setComparison = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), showAddModal = _g[0], setShowAddModal = _g[1];
    var _h = (0, react_1.useState)(false), showAddPriceModal = _h[0], setShowAddPriceModal = _h[1];
    var _j = (0, react_1.useState)({ name: '', location: '', website: '', category: 'Restaurant' }), newCompetitor = _j[0], setNewCompetitor = _j[1];
    var _k = (0, react_1.useState)({ product_name: '', price: '', category: '' }), newPrice = _k[0], setNewPrice = _k[1];
    var loadCompetitors = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/competitors')];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setCompetitors(data.competitors);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error loading competitors:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadComparison = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/competitors/comparison')];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setComparison(data);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error loading comparison:', err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadPrices = function (competitorId) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/competitors/".concat(competitorId, "/prices"))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setPrices(data.prices);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('Error loading prices:', err_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        var init = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true);
                        return [4 /*yield*/, loadCompetitors()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, loadComparison()];
                    case 2:
                        _a.sent();
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        init();
    }, []);
    (0, react_1.useEffect)(function () {
        if (selectedCompetitor) {
            loadPrices(selectedCompetitor);
        }
    }, [selectedCompetitor]);
    var handleAddCompetitor = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/competitors', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newCompetitor),
                        })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setShowAddModal(false);
                        setNewCompetitor({ name: '', location: '', website: '', category: 'Restaurant' });
                        loadCompetitors();
                    }
                    else {
                        alert(data.error);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _a.sent();
                    alert(err_4.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleAddPrice = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedCompetitor)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/competitors/".concat(selectedCompetitor, "/prices"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, newPrice), { price: parseFloat(newPrice.price) })),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowAddPriceModal(false);
                        setNewPrice({ product_name: '', price: '', category: '' });
                        loadPrices(selectedCompetitor);
                        loadComparison();
                    }
                    else {
                        alert(data.error);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_5 = _a.sent();
                    alert(err_5.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getPriceDiffClass = function (diff) {
        if (diff > 10)
            return 'more-expensive';
        if (diff < -10)
            return 'cheaper';
        return 'same';
    };
    if (loading) {
        return (<div className="competitor-tracking-page">
        <PageHeader_1.PageHeader title='🔍 competitor tracking' description='Se încarcă...'/>
        <div className="loading">⏳ Se încarcă datele...</div>
      </div>);
    }
    return (<div className="competitor-tracking-page" data-page-ready="true">
      <PageHeader_1.PageHeader title='🔍 competitor price tracking' description="Monitorizare prețuri competitori și analiză poziționare piață" actions={[
            { label: '➕ Adaugă Competitor', variant: 'primary', onClick: function () { return setShowAddModal(true); } },
            { label: '🔄 Refresh', variant: 'secondary', onClick: function () { loadCompetitors(); loadComparison(); } },
        ]}/>

      {/* Stats Overview */}
      {(comparison === null || comparison === void 0 ? void 0 : comparison.stats) && (<div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{comparison.stats.total_products_tracked}</div>
            <div className="stat-label">Produse Monitorizate</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{comparison.stats.we_are_cheaper}</div>
            <div className="stat-label">noi mai ieftini</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{comparison.stats.we_are_more_expensive}</div>
            <div className="stat-label">noi mai scumpi</div>
          </div>
          <div className="stat-card info">
            <div className="stat-value">{comparison.stats.avg_price_diff}%</div>
            <div className="stat-label">diferență medie</div>
          </div>
        </div>)}

      {/* Insights */}
      {(comparison === null || comparison === void 0 ? void 0 : comparison.insights) && comparison.insights.length > 0 && (<div className="insights-section">
          {comparison.insights.map(function (insight, i) { return (<div key={i} className={"insight-card ".concat(insight.type)}>
              <span className="insight-icon">{insight.icon}</span>
              <span className="insight-message">{insight.message}</span>
            </div>); })}
        </div>)}

      <div className="main-content">
        {/* Competitors List */}
        <div className="competitors-panel">
          <h2>🏪 Competitori</h2>
          {competitors.length === 0 ? (<div className="no-data">nu aveți competitori adăugați<button onClick={function () { return setShowAddModal(true); }}>➕ Adaugă primul competitor</button>
            </div>) : (<div className="competitors-list">
              {competitors.map(function (comp) { return (<div key={comp.id} className={"competitor-item ".concat(selectedCompetitor === comp.id ? 'selected' : '')} onClick={function () { return setSelectedCompetitor(comp.id); }}>
                  <div className="comp-name">{comp.name}</div>
                  <div className="comp-details">
                    <span className="comp-location">📍 {comp.location || 'N/A'}</span>
                    <span className="comp-products">{comp.products_tracked} produse</span>
                  </div>
                </div>); })}
            </div>)}
        </div>

        {/* Prices Panel */}
        <div className="prices-panel">
          {selectedCompetitor ? (<>
              <div className="prices-header">
                <h2>💰 Prețuri {(_a = competitors.find(function (c) { return c.id === selectedCompetitor; })) === null || _a === void 0 ? void 0 : _a.name}</h2>
                <button className="btn-add-price" onClick={function () { return setShowAddPriceModal(true); }}>
                  ➕ Adaugă Preț
                </button>
              </div>
              {prices.length === 0 ? (<div className="no-data">nu sunt prețuri înregistrate pentru acest competitor</div>) : (<table className="prices-table">
                  <thead>
                    <tr>
                      <th>produs competitor</th>
                      <th>preț competitor</th>
                      <th>Produsul Nostru</th>
                      <th>prețul nostru</th>
                      <th>Diferență</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(function (price) { return (<tr key={price.id}>
                        <td><strong>{price.product_name}</strong></td>
                        <td className="price-cell">{price.price} RON</td>
                        <td>{price.our_product_name || '—'}</td>
                        <td className="price-cell">{price.our_price ? "".concat(price.our_price, " RON") : '—'}</td>
                        <td>
                          {price.price_diff_percent != null ? (<span className={"diff-badge ".concat(getPriceDiffClass(price.price_diff_percent))}>
                              {price.price_diff_percent > 0 ? '+' : ''}{price.price_diff_percent}%
                            </span>) : '—'}
                        </td>
                      </tr>); })}
                  </tbody>
                </table>)}
            </>) : (<div className="no-selection">
              👈 Selectați un competitor pentru a vedea prețurile
            </div>)}
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (<div className="modal-overlay" onClick={function () { return setShowAddModal(false); }}>
          <div className="modal" onClick={function (e) { return e.stopPropagation(); }}>
            <h3>➕ Adaugă Competitor</h3>
            <div className="form-group">
              <label>Nume *</label>
              <input type="text" value={newCompetitor.name} onChange={function (e) { return setNewCompetitor(__assign(__assign({}, newCompetitor), { name: e.target.value })); }} placeholder="restaurant xyz"/>
            </div>
            <div className="form-group">
              <label>Locație</label>
              <input type="text" value={newCompetitor.location} onChange={function (e) { return setNewCompetitor(__assign(__assign({}, newCompetitor), { location: e.target.value })); }} placeholder="Ex: București, Sector 1"/>
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="text" value={newCompetitor.website} onChange={function (e) { return setNewCompetitor(__assign(__assign({}, newCompetitor), { website: e.target.value })); }} placeholder="https://..."/>
            </div>
            <div className="form-group">
              <label>Categorie</label>
              <select value={newCompetitor.category} onChange={function (e) { return setNewCompetitor(__assign(__assign({}, newCompetitor), { category: e.target.value })); }}>
                <option value="Restaurant">Restaurant</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Pizzerie">Pizzerie</option>
                <option value="Cafenea">Cafenea</option>
                <option value="Bar">Bar</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={function () { return setShowAddModal(false); }}>Anulează</button>
              <button className="btn-save" onClick={handleAddCompetitor}>Salvează</button>
            </div>
          </div>
        </div>)}

      {/* Add Price Modal */}
      {showAddPriceModal && (<div className="modal-overlay" onClick={function () { return setShowAddPriceModal(false); }}>
          <div className="modal" onClick={function (e) { return e.stopPropagation(); }}>
            <h3>➕ Adaugă Preț Competitor</h3>
            <div className="form-group">
              <label>Nume Produs *</label>
              <input type="text" value={newPrice.product_name} onChange={function (e) { return setNewPrice(__assign(__assign({}, newPrice), { product_name: e.target.value })); }} placeholder="Pizza Margherita"/>
            </div>
            <div className="form-group">
              <label>Preț (RON) *</label>
              <input type="number" step="0.01" value={newPrice.price} onChange={function (e) { return setNewPrice(__assign(__assign({}, newPrice), { price: e.target.value })); }} placeholder="35.00"/>
            </div>
            <div className="form-group">
              <label>Categorie</label>
              <input type="text" value={newPrice.category} onChange={function (e) { return setNewPrice(__assign(__assign({}, newPrice), { category: e.target.value })); }} placeholder="Pizza"/>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={function () { return setShowAddPriceModal(false); }}>Anulează</button>
              <button className="btn-save" onClick={handleAddPrice}>Salvează</button>
            </div>
          </div>
        </div>)}
    </div>);
};
exports.CompetitorTrackingPage = CompetitorTrackingPage;
exports.default = exports.CompetitorTrackingPage;
