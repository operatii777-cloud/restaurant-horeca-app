"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.A - POS Product Grid Component
 *
 * Grid de produse pentru POS cu:
 * - Încărcare produse din /api/catalog-produse/products
 * - Grupare pe categorii
 * - Search rapid (client-side)
 * - Click → add product to order
 * - Highlight produse indisponibile (0 stock)
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
exports.PosProductGrid = PosProductGrid;
var react_1 = require("react");
var posStore_1 = require("../store/posStore");
var httpClient_1 = require("@/shared/api/httpClient");
require("./PosProductGrid.css");
/** Returnează prețul efectiv pe baza tier-ului (1=standard, 2=preț 2, 3=preț 3) */
function getEffectivePrice(p, tier) {
    if (tier === 2 && p.pret2 != null && p.pret2 > 0)
        return p.pret2;
    if (tier === 3 && p.pret3 != null && p.pret3 > 0)
        return p.pret3;
    return p.price;
}
function PosProductGrid() {
    var _this = this;
    var _a, _b;
    //   const { t } = useTranslation();
    var _c = (0, posStore_1.usePosStore)(), addItem = _c.addItem, priceTier = _c.priceTier, setPriceTier = _c.setPriceTier;
    var _d = (0, react_1.useState)([]), products = _d[0], setProducts = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(''), searchTerm = _g[0], setSearchTerm = _g[1];
    var _h = (0, react_1.useState)('all'), selectedCategory = _h[0], setSelectedCategory = _h[1];
    var _j = (0, react_1.useState)(null), dailyMenuData = _j[0], setDailyMenuData = _j[1];
    // Load products
    (0, react_1.useEffect)(function () {
        loadProducts();
        loadDailyMenu();
    }, []);
    // Debug: Log when dailyMenuData changes
    (0, react_1.useEffect)(function () {
        console.log('PosProductGrid dailyMenuData changed:', dailyMenuData);
        console.log('PosProductGrid categories will include Meniul Zilei:', !!dailyMenuData);
    }, [dailyMenuData]);
    // Load daily menu
    var loadDailyMenu = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/daily-menu')];
                case 1:
                    response = _a.sent();
                    console.log('PosProductGrid Daily menu response:', response.data);
                    if (response.data && response.data.soup && response.data.mainCourse) {
                        setDailyMenuData({
                            soup: response.data.soup,
                            mainCourse: response.data.mainCourse,
                            discount: response.data.discount || 0,
                        });
                        console.log('PosProductGrid Daily menu loaded successfully');
                    }
                    else {
                        console.log('PosProductGrid Daily menu data incomplete:', response.data);
                        setDailyMenuData(null);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.log('PosProductGrid No daily menu for today:', err_1);
                    setDailyMenuData(null);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadProducts = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, productsData, err_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get('/api/catalog-produse/products', {
                            params: {
                                is_active: 1, // Only active products
                            },
                        })];
                case 2:
                    response = _e.sent();
                    productsData = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.products) || ((_b = response.data) === null || _b === void 0 ? void 0 : _b.data) || (Array.isArray(response.data) ? response.data : []) || [];
                    setProducts(Array.isArray(productsData) ? productsData : []);
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _e.sent();
                    console.error('PosProductGrid Error loading products:', err_2);
                    setError(((_d = (_c = err_2.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || 'Eroare la încărcarea produselor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Get unique categories (include Meniul Zilei if available)
    var categories = (0, react_1.useMemo)(function () {
        var cats = new Set();
        products.forEach(function (p) {
            if (p.category) {
                cats.add(p.category);
            }
        });
        // Add "Meniul Zilei" if daily menu is available
        if (dailyMenuData && dailyMenuData.soup && dailyMenuData.mainCourse) {
            cats.add('Meniul Zilei');
            console.log('PosProductGrid ✅ Adding Meniul Zilei to categories');
        }
        else {
            console.log('PosProductGrid ❌ NOT adding Meniul Zilei - dailyMenuData:', dailyMenuData);
        }
        // Sort categories, but put "Meniul Zilei" first if it exists
        var allCats = Array.from(cats);
        var sorted = allCats.sort(function (a, b) {
            if (a === 'Meniul Zilei')
                return -1;
            if (b === 'Meniul Zilei')
                return 1;
            return a.localeCompare(b);
        });
        console.log('PosProductGrid 📋 Final categories:', sorted);
        return sorted;
    }, [products, dailyMenuData]);
    // Filter products
    var filteredProducts = (0, react_1.useMemo)(function () {
        console.log('PosProductGrid filteredProducts - searchTerm:', searchTerm, 'selectedCategory:', selectedCategory, 'products:', products.length);
        // If "Meniul Zilei" is selected, return empty array (will show special UI)
        if (selectedCategory === 'Meniul Zilei') {
            return [];
        }
        // If search term exists, search in ALL products regardless of category
        if (searchTerm && searchTerm.trim()) {
            var term_1 = searchTerm.toLowerCase().trim();
            console.log('PosProductGrid Searching for term:', term_1);
            var filtered_1 = products.filter(function (p) {
                var name = (p.name || '').toLowerCase();
                var nameEn = (p.name_en || '').toLowerCase();
                var category = (p.category || '').toLowerCase();
                var description = ((p.description || '') + ' ' + (p.description_en || '')).toLowerCase();
                var matches = name.includes(term_1) || nameEn.includes(term_1) || category.includes(term_1) || description.includes(term_1);
                return matches;
            });
            console.log('PosProductGrid Search results:', filtered_1.length, 'products');
            return filtered_1;
        }
        // If no search term, filter by category
        var filtered = products;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(function (p) { return p.category === selectedCategory; });
        }
        console.log('PosProductGrid Category filtered:', filtered.length, 'products');
        return filtered;
    }, [products, selectedCategory, searchTerm]);
    // Group products by category
    var groupedProducts = (0, react_1.useMemo)(function () {
        var grouped = {};
        filteredProducts.forEach(function (product) {
            var category = product.category || 'Necategorizat';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(product);
        });
        return grouped;
    }, [filteredProducts]);
    // Handle product click
    var handleProductClick = function (product) {
        var _a;
        // Check if product is available
        if (!product.is_active) {
            alert('Produsul nu este activ');
            return;
        }
        if (product.stock_management && (product.current_stock || 0) <= 0) {
            alert('Produsul nu este în stoc');
            return;
        }
        var effectivePrice = getEffectivePrice(product, priceTier);
        addItem({
            productId: product.id,
            name: product.name,
            qty: 1,
            unitPrice: effectivePrice,
            total: effectivePrice,
            categoryId: undefined, // Can be enhanced
            station: ((_a = product.preparation_section) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'bar' ? 'bar' : 'kitchen',
        });
    };
    // Check if product is unavailable
    var isUnavailable = function (product) {
        return (!product.is_active ||
            (product.stock_management && (product.current_stock || 0) <= 0));
    };
    if (loading) {
        return (<div className="pos-product-grid-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">"se incarca produsele"</span>
        </div>
        <p className="text-muted mt-2">"se incarca produsele"</p>
      </div>);
    }
    if (error) {
        return (<div className="pos-product-grid-error">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-outline-primary" onClick={loadProducts}>
          <i className="fas fa-redo me-1"></i>"Reîncearcă"</button>
      </div>);
    }
    return (<div className="pos-product-grid">
      {/* Preț Tier Selector */}
      <div className="pos-product-grid-price-tier mb-2">
        <span className="me-2" style={{ fontSize: '0.9rem', color: '#666' }}>Preț:</span>
        {[1, 2, 3].map(function (tier) { return (<button key={tier} type="button" className={"btn btn-sm ".concat(priceTier === tier ? 'btn-primary' : 'btn-outline-secondary')} onClick={function () { return setPriceTier(tier); }}>
            Preț {tier}
          </button>); })}
      </div>

      {/* Search Bar */}
      <div className="pos-product-grid-search">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fas fa-search"></i>
          </span>
          <input type="text" className="form-control" placeholder='[🔍_cauta_produs]' value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
          {searchTerm && (<button className="btn btn-outline-secondary" onClick={function () { return setSearchTerm(''); }} title="Șterge căutarea">
              <i className="fas fa-times"></i>
            </button>)}
        </div>
      </div>

      {/* Category Filter */}
      <div className="pos-product-grid-categories">
        <button className={"pos-category-btn ".concat(selectedCategory === 'all' ? 'active' : '')} onClick={function () {
            console.log('PosProductGrid Click on "Toate"');
            setSelectedCategory('all');
        }}>"Toate"</button>
        {categories.map(function (category) { return (<button key={category} className={"pos-category-btn ".concat(selectedCategory === category ? 'active' : '')} onClick={function () {
                console.log('PosProductGrid Click on category:', category);
                setSelectedCategory(category);
            }}>
            {category}
          </button>); })}
      </div>

      {/* Products Grid */}
      <div className="pos-product-grid-content">
        {(function () {
            console.log('PosProductGrid 🔍 Rendering grid - selectedCategory:', selectedCategory);
            console.log('PosProductGrid 🔍 dailyMenuData available:', !!dailyMenuData);
            if (dailyMenuData) {
                console.log('PosProductGrid 🔍 dailyMenuData.soup:', !!dailyMenuData.soup);
                console.log('PosProductGrid 🔍 dailyMenuData.mainCourse:', !!dailyMenuData.mainCourse);
            }
            return selectedCategory === 'Meniul Zilei';
        })() ? (dailyMenuData && dailyMenuData.soup && dailyMenuData.mainCourse ? (<div style={{ width: '100%', padding: '2rem' }}>
              <div style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '2px solid rgba(255, 107, 53, 0.5)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h1 style={{ color: '#ff6b35', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    🍲 Meniul Zilei
                  </h1>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  {/* Soup */}
                  <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(255, 107, 53, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 107, 53, 0.2)'
            }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      {dailyMenuData.soup.image_url ? (<img src={dailyMenuData.soup.image_url} alt={dailyMenuData.soup.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}/>) : (<div style={{ width: '60px', height: '60px', background: '#ff6b35', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                          🍲
                        </div>)}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#333', margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                          {dailyMenuData.soup.name}
                        </h3>
                        {dailyMenuData.soup.description && (<p style={{ color: '#666', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {dailyMenuData.soup.description}
                          </p>)}
                        {dailyMenuData.soup.allergens && (<p style={{ color: '#888', margin: 0, marginTop: '0.5rem', fontSize: '0.75rem' }}>
                            <strong style={{ color: '#333' }}>Alergeni:</strong> {dailyMenuData.soup.allergens}
                          </p>)}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b', marginLeft: '1rem' }}>
                      {(_a = dailyMenuData.soup.price) === null || _a === void 0 ? void 0 : _a.toFixed(2)} RON
                    </span>
                  </div>

                  {/* Plus symbol */}
                  <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#ff6b35', margin: '1rem 0', fontWeight: 'bold' }}>+</div>

                  {/* Main Course */}
                  <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255, 107, 53, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 107, 53, 0.2)'
            }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      {dailyMenuData.mainCourse.image_url ? (<img src={dailyMenuData.mainCourse.image_url} alt={dailyMenuData.mainCourse.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}/>) : (<div style={{ width: '60px', height: '60px', background: '#ff6b35', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                          🍽️
                        </div>)}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#333', margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                          {dailyMenuData.mainCourse.name}
                        </h3>
                        {dailyMenuData.mainCourse.description && (<p style={{ color: '#666', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {dailyMenuData.mainCourse.description}
                          </p>)}
                        {dailyMenuData.mainCourse.allergens && (<p style={{ color: '#888', margin: 0, marginTop: '0.5rem', fontSize: '0.75rem' }}>
                            <strong style={{ color: '#333' }}>Alergeni:</strong> {dailyMenuData.mainCourse.allergens}
                          </p>)}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b', marginLeft: '1rem' }}>
                      {(_b = dailyMenuData.mainCourse.price) === null || _b === void 0 ? void 0 : _b.toFixed(2)} RON
                    </span>
                  </div>
                </div>

                <hr style={{ margin: '1.5rem 0', border: '1px dashed rgba(0, 0, 0, 0.2)' }}/>

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#888', textDecoration: 'line-through' }}>
                      Total: {(dailyMenuData.soup.price + dailyMenuData.mainCourse.price).toFixed(2)} RON
                    </span>
                    <br />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>
                      Preț Ofertă: {((dailyMenuData.soup.price + dailyMenuData.mainCourse.price) - (dailyMenuData.discount || 0)).toFixed(2)} RON
                    </span>
                  </div>
                </div>

                <button className="btn btn-danger" onClick={function () {
                // Add soup
                addItem({
                    productId: dailyMenuData.soup.id,
                    name: dailyMenuData.soup.name,
                    qty: 1,
                    unitPrice: dailyMenuData.soup.price,
                    total: dailyMenuData.soup.price,
                    categoryId: undefined,
                    station: 'kitchen',
                });
                // Add main course
                addItem({
                    productId: dailyMenuData.mainCourse.id,
                    name: dailyMenuData.mainCourse.name,
                    qty: 1,
                    unitPrice: dailyMenuData.mainCourse.price,
                    total: dailyMenuData.mainCourse.price,
                    categoryId: undefined,
                    station: 'kitchen',
                });
            }} style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                background: '#ff6b35',
                border: '2px solid #ff6b35',
                boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)'
            }}>
                  <i className="fas fa-shopping-cart me-2"></i>"adauga in comanda"</button>
              </div>
            </div>) : (<div className="pos-product-grid-empty">
              <p className="text-muted">"nu exista meniu al zilei astazi"</p>
            </div>)) : Object.keys(groupedProducts).length === 0 ? (<div className="pos-product-grid-empty">
            <p className="text-muted">
              {searchTerm
                ? 'Nu s-au găsit produse pentru căutarea ta'
                : 'Nu există produse disponibile'}
            </p>
          </div>) : (Object.entries(groupedProducts).map(function (_a) {
            var category = _a[0], categoryProducts = _a[1];
            return (<div key={category} className="pos-product-category-section">
              <h5 className="pos-product-category-title">{category}</h5>
              <div className="pos-product-grid-items">
                {categoryProducts.map(function (product) {
                    var unavailable = isUnavailable(product);
                    return (<button key={product.id} className={"pos-product-card ".concat(unavailable ? 'unavailable' : '')} onClick={function () { return handleProductClick(product); }} disabled={unavailable} title={unavailable
                            ? 'Produs indisponibil'
                            : "".concat(product.name, " - ").concat(getEffectivePrice(product, priceTier).toFixed(2), " RON")}>
                      {product.image_url ? (<div className="pos-product-image" style={{
                                backgroundImage: "url(".concat(product.image_url, ")"),
                            }}/>) : (<div className="pos-product-image pos-product-image-placeholder">
                          <i className="fas fa-image"></i>
                        </div>)}
                      <div className="pos-product-info">
                        <div className="pos-product-name">{product.name}</div>
                        <div className="pos-product-price">
                          {getEffectivePrice(product, priceTier).toFixed(2)} RON
                        </div>
                        {product.stock_management && (<div className="pos-product-stock">
                            Stoc: {product.current_stock || 0}
                          </div>)}
                      </div>
                      {unavailable && (<div className="pos-product-unavailable-overlay">
                          <i className="fas fa-ban"></i>
                          Indisponibil
                        </div>)}
                    </button>);
                })}
              </div>
            </div>);
        }))}
      </div>
    </div>);
}
