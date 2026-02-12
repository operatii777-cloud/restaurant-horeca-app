"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Order Page (Comanda)
 *
 * React implementation replacing comanda.html.
 * Main interface for creating orders (menu, cart, table selection).
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
exports.OrderPage = OrderPage;
var react_1 = require("react");
var orderStore_1 = require("../orderStore");
var orderApi_1 = require("../api/orderApi");
var useOrderEvents_1 = require("@/core/hooks/useOrderEvents");
require("./OrderPage.css");
/**
 * Order Page Component
 */
function OrderPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, orderStore_1.useOrderStore)(), menuItems = _a.menuItems, categories = _a.categories, selectedCategory = _a.selectedCategory, cart = _a.cart, selectedTable = _a.selectedTable, orderType = _a.orderType, notes = _a.notes, isCartOpen = _a.isCartOpen, isLoading = _a.isLoading, setMenuItems = _a.setMenuItems, setCategories = _a.setCategories, setSelectedCategory = _a.setSelectedCategory, addToCart = _a.addToCart, updateCartQuantity = _a.updateCartQuantity, removeFromCart = _a.removeFromCart, clearCart = _a.clearCart, setTable = _a.setSelectedTable, setOrderType = _a.setOrderType, setNotes = _a.setNotes, toggleCart = _a.toggleCart, setLoading = _a.setLoading, getCartTotal = _a.getCartTotal, getCartItemCount = _a.getCartItemCount, getFilteredMenuItems = _a.getFilteredMenuItems;
    var _b = (0, react_1.useState)([]), tables = _b[0], setTables = _b[1];
    var _c = (0, react_1.useState)('ro'), lang = _c[0], setLang = _c[1];
    var _d = (0, react_1.useState)(null), selectedProduct = _d[0], setSelectedProduct = _d[1];
    var _e = (0, react_1.useState)({}), selectedCustomizations = _e[0], setSelectedCustomizations = _e[1];
    // Sync with order events (optional, for real-time updates)
    (0, useOrderEvents_1.useOrderEvents)();
    // Load menu and categories on mount
    (0, react_1.useEffect)(function () {
        loadMenu();
        loadTables();
    }, [lang]);
    var loadMenu = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, menuData, categoriesData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            (0, orderApi_1.getMenuItems)(lang),
                            (0, orderApi_1.getCategories)(lang),
                        ])];
                case 1:
                    _a = _b.sent(), menuData = _a[0], categoriesData = _a[1];
                    setMenuItems(menuData);
                    setCategories(categoriesData);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('OrderPage Error loading menu:', error_1);
                    alert('Eroare la încărcarea meniului');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadTables = function () { return __awaiter(_this, void 0, void 0, function () {
        var tablesData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, orderApi_1.getTables)()];
                case 1:
                    tablesData = _a.sent();
                    setTables(tablesData);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('OrderPage Error loading tables:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAddToCart = function (product) {
        var customizations = selectedCustomizations[product.id] || [];
        addToCart(product, 1, customizations);
        // Reset customizations for this product
        setSelectedCustomizations(function (prev) {
            var next = __assign({}, prev);
            delete next[product.id];
            return next;
        });
        // Haptic feedback for mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    };
    var handleCustomizationToggle = function (productId, customization) {
        setSelectedCustomizations(function (prev) {
            var _a, _b, _c;
            var current = prev[productId] || [];
            var exists = current.find(function (c) { return c.id === customization.id; });
            if (exists) {
                // Remove if already selected
                return __assign(__assign({}, prev), (_a = {}, _a[productId] = current.filter(function (c) { return c.id !== customization.id; }), _a));
            }
            else {
                // Add if not selected
                // Check if exclusive - remove others if so
                if (customization.is_exclusive) {
                    return __assign(__assign({}, prev), (_b = {}, _b[productId] = [customization], _b));
                }
                return __assign(__assign({}, prev), (_c = {}, _c[productId] = __spreadArray(__spreadArray([], current, true), [customization], false), _c));
            }
        });
    };
    var handleCreateOrder = function () { return __awaiter(_this, void 0, void 0, function () {
        var orderItems, total, result, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (cart.length === 0) {
                        alert('Coșul este gol');
                        return [2 /*return*/];
                    }
                    if (!orderType) {
                        alert('Selectează tipul comenzii');
                        return [2 /*return*/];
                    }
                    if (orderType === 'dine_in' && !selectedTable) {
                        alert('Selectează o masă');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    orderItems = cart.map(function (item) { return ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                        customizations: item.customizations.map(function (c) { return ({ id: c.id }); }),
                        isFree: item.isFree || false,
                    }); });
                    total = getCartTotal();
                    return [4 /*yield*/, (0, orderApi_1.createOrder)({
                            items: orderItems,
                            table: selectedTable,
                            type: orderType,
                            notes: notes,
                            total: total,
                        })];
                case 2:
                    result = _c.sent();
                    if (result.success) {
                        alert("Comand\u0103 creat\u0103 cu succes! ID: ".concat(result.orderId));
                        clearCart();
                        setTable(null);
                        setOrderType(null);
                        setNotes('');
                        toggleCart();
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _c.sent();
                    console.error('OrderPage Error creating order:', error_3);
                    alert("Eroare la crearea comenzii: ".concat(((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error_3.message));
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var filteredItems = getFilteredMenuItems();
    return (<div className="order-page">
      {/* Top Bar */}
      <header className="order-top-bar">
        <div className="order-restaurant-name">"Restaurant"</div>
        <div className="order-header-actions">
          <button className="order-cart-btn" onClick={toggleCart}>
            🛒 Coș ({getCartItemCount()})
          </button>
          <button className="order-lang-btn" onClick={function () { return setLang(lang === 'ro' ? 'en' : 'ro'); }}>
            {lang === 'ro' ? 'EN' : 'RO'}
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="order-categories">
        <button className={"order-category-btn ".concat(selectedCategory === null ? 'active' : '')} onClick={function () { return setSelectedCategory(null); }}>Toate</button>
        {categories.map(function (cat) { return (<button key={cat.id} className={"order-category-btn ".concat(selectedCategory === cat.id ? 'active' : '')} onClick={function () { return setSelectedCategory(cat.id); }}>
            {lang === 'ro' ? cat.name : cat.name_en || cat.name}
          </button>); })}
      </div>

      {/* Menu Items */}
      <div className="order-menu-container">
        {isLoading ? (<div className="order-loading">Se încarcă...</div>) : (<div className="order-menu-grid">
            {filteredItems.map(function (item) { return (<div key={item.id} className="order-product-card">
                {item.image_url && (<div className="order-product-image">
                    <img src={item.image_url} alt={item.name}/>
                  </div>)}
                <div className="order-product-info">
                  <h3 className="order-product-name">
                    {lang === 'ro' ? item.name : item.name_en || item.name}
                  </h3>
                  <p className="order-product-description">
                    {lang === 'ro' ? item.description : item.description_en || item.description}
                  </p>
                  <div className="order-product-price">
                    {item.price.toFixed(2)} RON
                  </div>

                  {item.customizations && item.customizations.length > 0 && (<div className="order-customizations">
                      {item.customizations.map(function (custom) {
                        var isSelected = (selectedCustomizations[item.id] || []).some(function (c) { return c.id === custom.id; });
                        return (<label key={custom.id} className="order-customization-option">
                            <input type="checkbox" checked={isSelected} onChange={function () { return handleCustomizationToggle(item.id, custom); }}/>
                            <span>
                              {custom.option_name}
                              {custom.extra_price > 0 && " (+".concat(custom.extra_price.toFixed(2), " RON)")}
                            </span>
                          </label>);
                    })}
                    </div>)}

                  <button className="order-add-btn" onClick={function () { return handleAddToCart(item); }} disabled={!item.is_available}>
                    {item.is_available ? 'Adaugă în Coș' : 'Indisponibil'}
                  </button>
                </div>
              </div>); })}
          </div>)}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (<div className="order-cart-modal" onClick={function (e) {
                if (e.target === e.currentTarget)
                    toggleCart();
            }}>
          <div className="order-cart-content" onClick={function (e) { return e.stopPropagation(); }}>
            <div className="order-cart-header">
              <h2>Coș de Cumpărături</h2>
              <button className="order-cart-close" onClick={toggleCart}>×</button>
            </div>

            <div className="order-cart-items">
              {cart.length === 0 ? (<div className="order-cart-empty">Coșul este gol</div>) : (cart.map(function (item) { return (<div key={item.cartId} className="order-cart-item">
                    <div className="order-cart-item-info">
                      <div className="order-cart-item-name">
                        {lang === 'ro' ? item.product.name : item.product.name_en || item.product.name}
                        {item.isFree && <span className="order-cart-item-free"> (GRATUIT)</span>}
                      </div>
                      <div className="order-cart-item-price">
                        {item.isFree ? '0.00' : ((item.product.price + item.customizations.reduce(function (sum, c) { return sum + c.extra_price; }, 0)) * item.quantity).toFixed(2)} RON
                      </div>
                    </div>
                    <div className="order-cart-item-actions">
                      <button onClick={function () { return updateCartQuantity(item.cartId, -1); }}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={function () { return updateCartQuantity(item.cartId, 1); }}>+</button>
                      <button onClick={function () { return removeFromCart(item.cartId); }} className="order-cart-remove">🗑️</button>
                    </div>
                  </div>); }))}
            </div>

            {cart.length > 0 && (<>
                <div className="order-cart-total">
                  <strong>Total: {getCartTotal().toFixed(2)} RON</strong>
                </div>

                <div className="order-cart-form">
                  <div className="order-form-group">
                    <label>Tip Comandă</label>
                    <select value={orderType || ''} onChange={function (e) { return setOrderType(e.target.value); }}>
                      <option value="">Selectează...</option>
                      <option value="Dine-In">La Masă</option>
                      <option value="takeout">Takeaway</option>
                      <option value="delivery">Livrare</option>
                    </select>
                  </div>

                  {orderType === 'dine_in' && (<div className="order-form-group">
                      <label>Masă:</label>
                      <select value={selectedTable || ''} onChange={function (e) { return setTable(e.target.value); }}>
                        <option value="">Selectează Masa</option>
                        {tables.map(function (table) { return (<option key={table.id} value={table.number}>
                            Masa {table.number}
                          </option>); })}
                      </select>
                    </div>)}

                  <div className="order-form-group">
                    <label>Note:</label>
                    <textarea value={notes} onChange={function (e) { return setNotes(e.target.value); }} placeholder="note pentru comanda" rows={3}/>
                  </div>

                  <button className="order-submit-btn" onClick={handleCreateOrder} disabled={isLoading || cart.length === 0 || !orderType}>
                    {isLoading ? 'Se procesează...' : 'Plasează Comanda'}
                  </button>
                </div>
              </>)}
          </div>
        </div>)}
    </div>);
}
