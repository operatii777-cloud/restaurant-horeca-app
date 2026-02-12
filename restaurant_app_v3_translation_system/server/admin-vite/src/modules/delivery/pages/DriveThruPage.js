"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
// =====================================================================
// DRIVE-THRU PAGE
// POS simplificat pentru comenzi drive-thru
// =====================================================================
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
exports.DriveThruPage = void 0;
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
require("./DriveThruPage.css");
var DriveThruPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)([]), categories = _b[0], setCategories = _b[1];
    var _c = (0, react_1.useState)('Toate'), selectedCategory = _c[0], setSelectedCategory = _c[1];
    var _d = (0, react_1.useState)(''), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = (0, react_1.useState)([]), cart = _e[0], setCart = _e[1];
    var _f = (0, react_1.useState)('A1'), laneNumber = _f[0], setLaneNumber = _f[1];
    var _g = (0, react_1.useState)(''), carPlate = _g[0], setCarPlate = _g[1];
    var _h = (0, react_1.useState)('cash'), paymentMethod = _h[0], setPaymentMethod = _h[1];
    var _j = (0, react_1.useState)([]), queue = _j[0], setQueue = _j[1];
    var _k = (0, react_1.useState)(null), stats = _k[0], setStats = _k[1];
    var _l = (0, react_1.useState)(null), alert = _l[0], setAlert = _l[1];
    // Încarcă produse
    (0, react_1.useEffect)(function () {
        fetchProducts();
        fetchQueue();
        fetchStats();
        var interval = setInterval(function () {
            fetchQueue();
            fetchStats();
        }, 10000); // Refresh la 10s
        return function () { return clearInterval(interval); };
    }, []);
    var fetchProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, cats, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/menu/all')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setProducts(data.menu);
                        cats = __spreadArray(['Toate'], Array.from(new Set(data.menu.map(function (p) { return p.category; }))), true);
                        setCategories(cats);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error loading products:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchQueue = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/orders/drive-thru/queue')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setQueue(data.orders);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error loading queue:', err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchStats = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/orders/drive-thru/stats')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setStats(data.stats);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('Error loading stats:', err_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var addToCart = function (product) {
        var existing = cart.find(function (item) { return item.productId === product.id; });
        if (existing) {
            setCart(cart.map(function (item) {
                return item.productId === product.id
                    ? __assign(__assign({}, item), { quantity: item.quantity + 1 }) : item;
            }));
        }
        else {
            setCart(__spreadArray(__spreadArray([], cart, true), [{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                }], false));
        }
    };
    var updateQuantity = function (productId, delta) {
        setCart(cart.map(function (item) {
            if (item.productId === productId) {
                var newQty = item.quantity + delta;
                return newQty > 0 ? __assign(__assign({}, item), { quantity: newQty }) : item;
            }
            return item;
        }).filter(function (item) { return item.quantity > 0; }));
    };
    var clearCart = function () {
        setCart([]);
        setCarPlate('');
    };
    var calculateTotal = function () {
        return cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
    };
    var submitOrder = function () { return __awaiter(void 0, void 0, void 0, function () {
        var orderData, response, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cart.length === 0) {
                        setAlert({ type: 'warning', message: 'Coșul este gol!' });
                        return [2 /*return*/];
                    }
                    if (!paymentMethod) {
                        setAlert({ type: 'warning', message: 'Selectează metoda de plată!' });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    orderData = {
                        lane_number: laneNumber,
                        car_plate: carPlate || null,
                        items: JSON.stringify(cart.map(function (item) { return ({
                            id: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        }); })),
                        total: calculateTotal(),
                        payment_method: paymentMethod
                    };
                    return [4 /*yield*/, fetch('/api/orders/drive-thru', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderData)
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setAlert({ type: 'success', message: "Comand\u0103 #".concat(data.order_id, " creat\u0103 cu succes!") });
                        clearCart();
                        fetchQueue();
                        fetchStats();
                    }
                    else {
                        setAlert({ type: 'danger', message: data.error || 'Eroare la creare comandă' });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    setAlert({ type: 'danger', message: 'Eroare de conexiune' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var completeOrder = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/orders/drive-thru/".concat(orderId, "/complete"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setAlert({ type: 'success', message: "Comand\u0103 #".concat(orderId, " finalizat\u0103!") });
                        fetchQueue();
                        fetchStats();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_5 = _a.sent();
                    console.error('Error completing order:', err_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var filteredProducts = products.filter(function (p) {
        var matchesCategory = selectedCategory === 'Toate' || p.category === selectedCategory;
        var matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    var formatTime = function (seconds) {
        if (seconds < 60)
            return "\"Seconds\"s";
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return "\"Mins\"m \"Secs\"s";
    };
    return (<div className="drive-thru-page">
      {/* Header cu KPI-uri */}
      <div className="drive-thru-header">
        <h2>🚗 Drive-Thru</h2>
        {stats && (<div className="drive-thru-kpis">
            <div className="kpi-card">
              <div className="kpi-value">{stats.orders_today}</div>
              <div className="kpi-label">Comenzi Azi</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{formatTime(stats.avg_service_time_seconds)}</div>
              <div className="kpi-label">Timp Mediu</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{stats.current_queue_length}</div>
              <div className="kpi-label">"in coada"</div>
            </div>
            {stats.slow_orders_count > 0 && (<div className="kpi-card alert-kpi">
                <div className="kpi-value">⚠️ {stats.slow_orders_count}</div>
                <div className="kpi-label">{t('$([peste_5_min] -replace "\[|\]")')}</div>
              </div>)}
          </div>)}
      </div>

      {alert && (<react_bootstrap_1.Alert variant={alert.type} onClose={function () { return setAlert(null); }} dismissible>
          {alert.message}
        </react_bootstrap_1.Alert>)}

      <div className="drive-thru-content">
        {/* Produse (stânga) */}
        <div className="drive-thru-products">
          {/* Filtru categorie */}
          <div className="category-buttons">
            {categories.map(function (cat) { return (<react_bootstrap_1.Button key={cat} variant={selectedCategory === cat ? 'primary' : 'outline-primary'} size="sm" onClick={function () { return setSelectedCategory(cat); }}>
                {cat}
              </react_bootstrap_1.Button>); })}
          </div>

          {/* Search */}
          <react_bootstrap_1.Form.Control type="text" placeholder='[🔍_cauta_produs]' value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="mb-3"/>

          {/* Grid produse */}
          <div className="products-grid">
            {filteredProducts.map(function (product) { return (<react_bootstrap_1.Card key={product.id} className="product-card" onClick={function () { return addToCart(product); }}>
                {product.image && <react_bootstrap_1.Card.Img variant="top" src={product.image}/>}
                <react_bootstrap_1.Card.Body>
                  <react_bootstrap_1.Card.Title>{product.name}</react_bootstrap_1.Card.Title>
                  <react_bootstrap_1.Card.Text className="product-price">{product.price.toFixed(2)} RON</react_bootstrap_1.Card.Text>
                </react_bootstrap_1.Card.Body>
              </react_bootstrap_1.Card>); })}
          </div>
        </div>

        {/* Comandă (dreapta) */}
        <div className="drive-thru-order">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <h5>📋 Comandă Curentă</h5>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {/* Lane & Car */}
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Bandă</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Select value={laneNumber} onChange={function (e) { return setLaneNumber(e.target.value); }}>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Form.Group>

              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Număr Mașină (opțional)</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control type="text" placeholder="Ex: B-123-ABC" value={carPlate} onChange={function (e) { return setCarPlate(e.target.value.toUpperCase()); }}/>
              </react_bootstrap_1.Form.Group>

              {/* Cart Items */}
              <div className="cart-items">
                {cart.length === 0 ? (<p className="text-muted text-center">"cosul este gol"</p>) : (cart.map(function (item) { return (<div key={item.productId} className="cart-item">
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>{item.price.toFixed(2)} RON</span>
                      </div>
                      <div className="cart-item-controls">
                        <react_bootstrap_1.Button size="sm" variant="outline-secondary" onClick={function () { return updateQuantity(item.productId, -1); }}>−</react_bootstrap_1.Button>
                        <span className="cart-qty">{item.quantity}</span>
                        <react_bootstrap_1.Button size="sm" variant="outline-secondary" onClick={function () { return updateQuantity(item.productId, 1); }}>+</react_bootstrap_1.Button>
                      </div>
                    </div>); }))}
              </div>

              {/* Payment Method */}
              <react_bootstrap_1.Form.Group className="mb-3">
                <react_bootstrap_1.Form.Label>Metoda Plată</react_bootstrap_1.Form.Label>
                <div>
                  <react_bootstrap_1.Form.Check inline type="radio" label="💵 Cash" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={function (e) { return setPaymentMethod(e.target.value); }}/>
                  <react_bootstrap_1.Form.Check inline type="radio" label="💳 Card" name="payment" value="card" checked={paymentMethod === 'card'} onChange={function (e) { return setPaymentMethod(e.target.value); }}/>
                </div>
              </react_bootstrap_1.Form.Group>

              {/* Total */}
              <div className="cart-total">
                <strong>TOTAL:</strong>
                <strong>{calculateTotal().toFixed(2)} RON</strong>
              </div>

              {/* Actions */}
              <div className="cart-actions">
                <react_bootstrap_1.Button variant="danger" onClick={clearCart} disabled={cart.length === 0}>"Golește"</react_bootstrap_1.Button>
                <react_bootstrap_1.Button variant="success" onClick={submitOrder} disabled={cart.length === 0}>
                  Plasează Comandă
                </react_bootstrap_1.Button>
              </div>
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>

          {/* Queue */}
          <react_bootstrap_1.Card className="mt-3">
            <react_bootstrap_1.Card.Header>
              <h6>🚦 Coadă ({queue.length})</h6>
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body className="queue-list">
              {queue.map(function (order) { return (<div key={order.id} className={"queue-item ".concat(order.wait_time_minutes > 5 ? 'slow' : '')}>
                  <div>
                    <strong>#{order.id}</strong> - {order.lane_number}
                    {order.car_plate && <span className="text-muted"> ({order.car_plate})</span>}
                    <br />
                    <small>
                      {order.wait_time_minutes}min - 
                      <react_bootstrap_1.Badge bg={order.status === 'completed' ? 'success' : 'warning'} className="ms-1">
                        {order.status}
                      </react_bootstrap_1.Badge>
                    </small>
                  </div>
                  {order.status === 'completed' && (<react_bootstrap_1.Button size="sm" variant="success" onClick={function () { return completeOrder(order.id); }}>
                      Servit
                    </react_bootstrap_1.Button>)}
                </div>); })}
              {queue.length === 0 && <p className="text-muted text-center mb-0">"nicio comanda in asteptare"</p>}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>
    </div>);
};
exports.DriveThruPage = DriveThruPage;
exports.default = exports.DriveThruPage;
