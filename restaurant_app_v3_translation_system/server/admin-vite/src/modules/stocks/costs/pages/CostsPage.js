"use strict";
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
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var httpClient_1 = require("@/shared/api/httpClient");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./CostsPage.css");
var CostsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), products = _b[0], setProducts = _b[1];
    var _c = (0, react_1.useState)([]), filteredProducts = _c[0], setFilteredProducts = _c[1];
    var _d = (0, react_1.useState)({
        avgFoodCost: 0,
        avgMargin: 0,
        alertsCount: 0,
        totalProducts: 0,
    }), stats = _d[0], setStats = _d[1];
    var _e = (0, react_1.useState)(''), categoryFilter = _e[0], setCategoryFilter = _e[1];
    var _f = (0, react_1.useState)(''), foodCostFilter = _f[0], setFoodCostFilter = _f[1];
    var _g = (0, react_1.useState)(''), searchTerm = _g[0], setSearchTerm = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    (0, react_1.useEffect)(function () {
        loadProducts();
    }, []);
    (0, react_1.useEffect)(function () {
        filterProducts();
    }, [products, categoryFilter, foodCostFilter, searchTerm]);
    var loadProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/costs')];
                case 2:
                    response = _b.sent();
                    if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.success) && Array.isArray(response.data.data)) {
                        setProducts(response.data.data);
                        updateStats(response.data.data);
                    }
                    else if (Array.isArray(response.data)) {
                        setProducts(response.data);
                        updateStats(response.data);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error loading costs:', error_1);
                    setFeedback({ type: 'error', message: 'Eroare la încărcarea costurilor' });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var updateStats = function (productsData) {
        if (productsData.length === 0) {
            setStats({ avgFoodCost: 0, avgMargin: 0, alertsCount: 0, totalProducts: 0 });
            return;
        }
        var totalFoodCost = productsData.reduce(function (sum, p) {
            var foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
            return sum + foodCostPercent;
        }, 0);
        var totalMargin = productsData.reduce(function (sum, p) { return sum + (p.profit_margin || 0); }, 0);
        var alertsCount = productsData.filter(function (p) {
            var foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
            return foodCostPercent > 35;
        }).length;
        setStats({
            avgFoodCost: totalFoodCost / productsData.length,
            avgMargin: totalMargin / productsData.length,
            alertsCount: alertsCount,
            totalProducts: productsData.length,
        });
    };
    var filterProducts = function () {
        var filtered = __spreadArray([], products, true);
        if (categoryFilter) {
            filtered = filtered.filter(function (p) { return p.category === categoryFilter; });
        }
        if (foodCostFilter) {
            filtered = filtered.filter(function (p) {
                var foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
                switch (foodCostFilter) {
                    case 'excellent':
                        return foodCostPercent < 25;
                    case 'good':
                        return foodCostPercent >= 25 && foodCostPercent < 30;
                    case 'warning':
                        return foodCostPercent >= 30 && foodCostPercent < 35;
                    case 'danger':
                        return foodCostPercent >= 35;
                    default:
                        return true;
                }
            });
        }
        if (searchTerm) {
            filtered = filtered.filter(function (p) {
                var _a;
                return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ((_a = p.name_en) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
            });
        }
        setFilteredProducts(filtered);
    };
    var getFoodCostLevel = function (foodCostPercent) {
        if (foodCostPercent < 25) {
            return { label: 'Excelent', badge: 'success', icon: '✅' };
        }
        else if (foodCostPercent < 30) {
            return { label: 'Bun', badge: 'info', icon: '👍' };
        }
        else if (foodCostPercent < 35) {
            return { label: 'Atenție', badge: 'warning', icon: '⚠️' };
        }
        else {
            return { label: 'Pericol', badge: 'danger', icon: '❌' };
        }
    };
    var formatCurrency = function (value) {
        return "".concat(value.toFixed(2), " RON");
    };
    var formatPercent = function (value) {
        return "".concat(value.toFixed(1), "%");
    };
    var getTopProducts = function () {
        return __spreadArray([], products, true).sort(function (a, b) { return b.profit - a.profit; })
            .slice(0, 5);
    };
    var getBottomProducts = function () {
        return __spreadArray([], products, true).filter(function (p) {
            var foodCostPercent = p.price > 0 ? (p.recipe_cost / p.price) * 100 : 0;
            return foodCostPercent >= 30;
        })
            .sort(function (a, b) {
            var aPercent = a.price > 0 ? (a.recipe_cost / a.price) * 100 : 0;
            var bPercent = b.price > 0 ? (b.recipe_cost / b.price) * 100 : 0;
            return bPercent - aPercent;
        })
            .slice(0, 5);
    };
    return (<div className="costs-page">
      <PageHeader_1.PageHeader title='💸 Costuri & Prețuri' description="Analiză costuri, prețuri și profitabilitate produse"/>

      {feedback && (<react_bootstrap_1.Alert variant={feedback.type === 'error' ? 'danger' : feedback.type === 'success' ? 'success' : 'info'} dismissible onClose={function () { return setFeedback(null); }} className="mt-3">
          {feedback.message}
        </react_bootstrap_1.Alert>)}

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <react_bootstrap_1.Card className="stat-card stat-good">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-percentage fa-2x text-info"></i>
                </div>
                <div>
                  <div className="stat-value">{formatPercent(stats.avgFoodCost)}</div>
                  <div className="stat-label">Food Cost Mediu</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="stat-card stat-success">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-chart-line fa-2x text-success"></i>
                </div>
                <div>
                  <div className="stat-value">{formatPercent(stats.avgMargin)}</div>
                  <div className="stat-label">Marjă medie</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="stat-card stat-warning">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-exclamation-triangle fa-2x text-warning"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.alertsCount}</div>
                  <div className="stat-label">Alerte Food Cost</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-3">
          <react_bootstrap_1.Card className="stat-card stat-info">
            <react_bootstrap_1.Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-utensils fa-2x text-primary"></i>
                </div>
                <div>
                  <div className="stat-value">{stats.totalProducts}</div>
                  <div className="stat-label">Produse Analizate</div>
                </div>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>

      {/* Food Cost Guidelines */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-info-circle me-2"></i>Ghid Food Cost
          </h5>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          <div className="row">
            <div className="col-md-3 mb-3">
              <react_bootstrap_1.Badge bg="success" className="p-2 mb-2 d-block">✅ Excelent: &lt; 25%</react_bootstrap_1.Badge>
              <p className="small text-muted mb-0">Profitabilitate foarte bună</p>
            </div>
            <div className="col-md-3 mb-3">
              <react_bootstrap_1.Badge bg="info" className="p-2 mb-2 d-block">👍 Bun: 25-30%</react_bootstrap_1.Badge>
              <p className="small text-muted mb-0">Profitabilitate acceptabilă</p>
            </div>
            <div className="col-md-3 mb-3">
              <react_bootstrap_1.Badge bg="warning" className="p-2 mb-2 d-block">⚠️ Atenție: 30-35%</react_bootstrap_1.Badge>
              <p className="small text-muted mb-0">Necesită optimizare</p>
            </div>
            <div className="col-md-3 mb-3">
              <react_bootstrap_1.Badge bg="danger" className="p-2 mb-2 d-block">❌ Pericol: &gt; 35%</react_bootstrap_1.Badge>
              <p className="small text-muted mb-0">Pierdere sau profit minim</p>
            </div>
          </div>
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Products Analysis */}
      <react_bootstrap_1.Card className="mb-4">
        <react_bootstrap_1.Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>Analiză produse</h5>
          <div>
            <react_bootstrap_1.Button variant="success" className="me-2" onClick={loadProducts}>
              <i className="fas fa-sync-alt me-2"></i>Reîncarcă</react_bootstrap_1.Button>
          </div>
        </react_bootstrap_1.Card.Header>
        <react_bootstrap_1.Card.Body>
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4">
              <react_bootstrap_1.Form.Control type="text" placeholder='🔍 Caută produs...' value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
            </div>
            <div className="col-md-4">
              <react_bootstrap_1.Form.Select value={categoryFilter} onChange={function (e) { return setCategoryFilter(e.target.value); }}>
                <option value="">Toate Categoriile</option>
                <option value="aperitive">Aperitive</option>
                <option value="ciorbe">Ciorbe</option>
                <option value="salate">Salate</option>
                <option value="pizza">Pizza</option>
                <option value="paste">Paste</option>
                <option value="Feluri Principale">Feluri Principale</option>
                <option value="deserturi">Deserturi</option>
                <option value="bauturi">Băuturi</option>
              </react_bootstrap_1.Form.Select>
            </div>
            <div className="col-md-4">
              <react_bootstrap_1.Form.Select value={foodCostFilter} onChange={function (e) { return setFoodCostFilter(e.target.value); }}>
                <option value="">Toate nivelurile</option>
                <option value="excellent">✅ Excelent (&lt;25%)</option>
                <option value="good">👍 Bun (25-30%)</option>
                <option value="warning">⚠️ Atenție (30-35%)</option>
                <option value="danger">❌ Pericol (&gt;35%)</option>
              </react_bootstrap_1.Form.Select>
            </div>
          </div>

          {loading ? (<div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>) : filteredProducts.length === 0 ? (<div className="text-center py-5">
              <i className="fas fa-calculator fa-4x text-muted mb-3"></i>
              <h5>Nu există date</h5>
              <p className="text-muted">Produsele cu rețete definite vor apărea aici automat.</p>
            </div>) : (<react_bootstrap_1.Table striped hover responsive>
              <thead>
                <tr>
                  <th>Produs</th>
                  <th>Cost Ingrediente</th>
                  <th>Preț vânzare</th>
                  <th>Food Cost %</th>
                  <th>Marjă</th>
                  <th>Profit/Porție</th>
                  <th>Recomandare</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(function (product) {
                var foodCostPercent = product.price > 0
                    ? (product.recipe_cost / product.price) * 100
                    : 0;
                var level = getFoodCostLevel(foodCostPercent);
                return (<tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <br />
                        <small className="text-muted">{product.category}</small>
                      </td>
                      <td>{formatCurrency(product.recipe_cost)}</td>
                      <td>
                        <strong>{formatCurrency(product.price)}</strong>
                      </td>
                      <td>
                        <strong className={"text-".concat(level.badge)}>
                          {formatPercent(foodCostPercent)}
                        </strong>
                        <div className="progress mt-1" style={{ height: '8px' }}>
                          <div className={"progress-bar bg-".concat(level.badge)} style={{ width: "".concat(Math.min(foodCostPercent, 100), "%") }}></div>
                        </div>
                      </td>
                      <td>
                        <strong>{formatPercent(product.profit_margin || 0)}</strong>
                      </td>
                      <td>
                        <strong>{formatCurrency(product.profit)}</strong>
                      </td>
                      <td>
                        <react_bootstrap_1.Badge bg={level.badge}>
                          {level.icon} {level.label}
                        </react_bootstrap_1.Badge>
                      </td>
                    </tr>);
            })}
              </tbody>
            </react_bootstrap_1.Table>)}
        </react_bootstrap_1.Card.Body>
      </react_bootstrap_1.Card>

      {/* Top/Bottom Products */}
      <div className="row">
        <div className="col-md-6">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-trophy me-2"></i>Top 5 Cele Mai Profitabile
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {getTopProducts().map(function (product, index) { return (<div key={product.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <div>
                    <strong>{index + 1}. {product.name}</strong>
                    <br />
                    <small className="text-muted">{formatCurrency(product.profit)} profit</small>
                  </div>
                  <react_bootstrap_1.Badge bg="success">{formatPercent(product.profit_margin || 0)}</react_bootstrap_1.Badge>
                </div>); })}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
        <div className="col-md-6">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>Top 5 Necesită Atenție
              </h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {getBottomProducts().map(function (product, index) {
            var foodCostPercent = product.price > 0
                ? (product.recipe_cost / product.price) * 100
                : 0;
            var level = getFoodCostLevel(foodCostPercent);
            return (<div key={product.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                      <strong>{index + 1}. {product.name}</strong>
                      <br />
                      <small className="text-muted">Food Cost: {formatPercent(foodCostPercent)}</small>
                    </div>
                    <react_bootstrap_1.Badge bg={level.badge}>{level.icon}</react_bootstrap_1.Badge>
                  </div>);
        })}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>
    </div>);
};
exports.CostsPage = CostsPage;
