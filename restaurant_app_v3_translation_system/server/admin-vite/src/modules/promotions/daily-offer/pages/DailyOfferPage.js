"use strict";
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
exports.DailyOfferPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
require("./DailyOfferPage.css");
var DailyOfferPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(null), currentOffer = _a[0], setCurrentOffer = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), saving = _c[0], setSaving = _c[1];
    var _d = (0, react_1.useState)(false), showModal = _d[0], setShowModal = _d[1];
    var _e = (0, react_1.useState)([]), products = _e[0], setProducts = _e[1];
    var _f = (0, react_1.useState)([]), categories = _f[0], setCategories = _f[1];
    // Form state
    var _g = (0, react_1.useState)({
        title: '',
        description: '',
        title_en: '',
        description_en: '',
        is_active: false,
        conditions: [{ category: '', quantity: 2 }],
        benefit_type: 'category',
        benefit_category: '',
        benefit_quantity: 1,
        benefit_products: []
    }), formData = _g[0], setFormData = _g[1];
    (0, react_1.useEffect)(function () {
        loadOffer();
        loadProducts();
    }, []);
    var loadOffer = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/daily-offer')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setCurrentOffer(data.offer || null);
                    _a.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error loading offer:', error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var loadProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, menuItems, uniqueCategories, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/menu/all')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    menuItems = data.data || [];
                    setProducts(menuItems);
                    uniqueCategories = __spreadArray([], new Set(menuItems.map(function (p) { return p.category; })), true).sort();
                    setCategories(uniqueCategories);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error loading products:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenModal = function () {
        if (currentOffer) {
            // Normalizăm produsele de beneficiu pentru a fi doar ID-uri în formular
            var benefitProductIds = (currentOffer.benefit_products || []).map(function (p) {
                return (p && typeof p === 'object') ? p.id : p;
            });
            setFormData(__assign(__assign({}, currentOffer), { conditions: currentOffer.conditions && currentOffer.conditions.length > 0
                    ? currentOffer.conditions
                    : [{ category: '', quantity: 2 }], benefit_products: benefitProductIds }));
        }
        else {
            setFormData({
                title: '',
                description: '',
                title_en: '',
                description_en: '',
                is_active: false,
                conditions: [{ category: '', quantity: 2 }],
                benefit_type: 'category',
                benefit_category: '',
                benefit_quantity: 1,
                benefit_products: []
            });
        }
        setShowModal(true);
    };
    var handleCloseModal = function () {
        setShowModal(false);
    };
    var handleAddCondition = function () {
        setFormData(__assign(__assign({}, formData), { conditions: __spreadArray(__spreadArray([], formData.conditions, true), [{ category: '', quantity: 2 }], false) }));
    };
    var handleRemoveCondition = function (index) {
        if (formData.conditions.length > 1) {
            setFormData(__assign(__assign({}, formData), { conditions: formData.conditions.filter(function (_, i) { return i !== index; }) }));
        }
        else {
            alert('Trebuie să existe cel puțin o condiție!');
        }
    };
    var handleConditionChange = function (index, field, value) {
        var _a;
        var newConditions = __spreadArray([], formData.conditions, true);
        newConditions[index] = __assign(__assign({}, newConditions[index]), (_a = {}, _a[field] = value, _a));
        setFormData(__assign(__assign({}, formData), { conditions: newConditions }));
    };
    var handleBenefitTypeChange = function (type) {
        setFormData(__assign(__assign({}, formData), { benefit_type: type, benefit_category: type === 'category' ? formData.benefit_category : '', benefit_products: type === 'specific' ? (formData.benefit_products || []) : [] }));
    };
    var handleBenefitProductChange = function (index, productId) {
        var newProducts = __spreadArray([], (formData.benefit_products || []), true);
        while (newProducts.length < 5) {
            newProducts.push(0);
        }
        newProducts[index] = productId ? parseInt(productId, 10) : 0;
        setFormData(__assign(__assign({}, formData), { benefit_products: newProducts.filter(function (id) { return id > 0; }) }));
    };
    var handleSave = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var offerData, response, result, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.title || !formData.description) {
                        alert('Titlul și descrierea sunt obligatorii!');
                        return [2 /*return*/];
                    }
                    if (formData.conditions.some(function (c) { return !c.category || c.quantity <= 0; })) {
                        alert('Toate condițiile trebuie să aibă categorie și cantitate validă!');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    setSaving(true);
                    offerData = __assign(__assign({}, formData), { id: currentOffer === null || currentOffer === void 0 ? void 0 : currentOffer.id, conditions: formData.conditions.filter(function (c) { return c.category && c.quantity > 0; }), benefit_products: formData.benefit_type === 'specific'
                            ? ((_a = formData.benefit_products) === null || _a === void 0 ? void 0 : _a.filter(function (id) { return id > 0; })) || []
                            : [] });
                    return [4 /*yield*/, fetch('/api/daily-offer', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(offerData)
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _b.sent();
                    if (response.ok) {
                        alert('Oferta a fost salvată cu succes!');
                        handleCloseModal();
                        loadOffer();
                    }
                    else {
                        alert(result.error || 'Eroare la salvarea ofertei');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _b.sent();
                    console.error('Error saving offer:', error_3);
                    alert('Eroare la salvarea ofertei');
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="daily-offer-page">
        <div className="loading">Se încarcă...</div>
      </div>);
    }
    return (<div className="daily-offer-page">
      <div className="page-header">
        <h1>⭐ Oferta Zilei</h1>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <span>➕</span>Configurează oferta zilei</button>
          <button className="btn btn-warning" onClick={loadOffer}>
            <span>🔄</span>Reîncarcă</button>
        </div>
      </div>

      <div className="daily-offer-container">
        <div className="daily-offer-card">
          <div className="daily-offer-header">
            <h3>Oferta Activă</h3>
            <div className="offer-status">
              <span className={"status-indicator ".concat((currentOffer === null || currentOffer === void 0 ? void 0 : currentOffer.is_active) ? 'active' : 'inactive')}></span>
              <span>{(currentOffer === null || currentOffer === void 0 ? void 0 : currentOffer.is_active) ? 'Activă' : 'Inactivă'}</span>
            </div>
          </div>

          <div className="daily-offer-content">
            {currentOffer && currentOffer.is_active ? (<div className="offer-details">
                <div className="offer-title">{currentOffer.title}</div>
                <div className="offer-description">{currentOffer.description}</div>

                {currentOffer.conditions && currentOffer.conditions.length > 0 && (<div className="offer-conditions">
                    <h4>Condiții pentru ofertă</h4>
                    {currentOffer.conditions.map(function (condition, index) { return (<div key={index} className="condition-item">
                        <span className="condition-category">{condition.category}</span>
                        <span className="condition-quantity">{condition.quantity}x</span>
                      </div>); })}
                  </div>)}

                <div className="offer-benefits">
                  <h4>Beneficiile Ofertei</h4>
                  {currentOffer.benefit_type === 'category' ? (<div className="benefit-item">
                      <span className="benefit-icon">🎁</span>
                      <span>
                        {currentOffer.benefit_quantity}x {currentOffer.benefit_category} gratuit
                        {currentOffer.benefit_quantity && currentOffer.benefit_quantity > 1 ? 'e' : ''}
                      </span>
                    </div>) : (<div className="benefit-item">
                      <span className="benefit-icon">🎁</span>
                      <span>Produse gratuite disponibile:</span>
                      <div className="free-products-list">
                        {currentOffer.benefit_products && currentOffer.benefit_products.length > 0 ? (currentOffer.benefit_products.map(function (p, index) {
                    // Gestionăm atât ID-uri cât și obiecte primite de la server
                    var productId = (p && typeof p === 'object') ? p.id : p;
                    var productName = (p && typeof p === 'object') ? p.name : null;
                    var productPrice = (p && typeof p === 'object') ? p.price : null;
                    var product = products.find(function (prod) { return prod.id === productId; });
                    var displayName = productName || (product ? product.name : "Produs ID: ".concat(productId));
                    var displayPrice = productPrice !== null ? productPrice : (product ? product.price : 0);
                    return (<span key={index} className="free-product-tag">
                                {displayName} - {displayPrice.toFixed(2)} RON
                              </span>);
                })) : (<span className="no-products">Nu sunt produse configurate</span>)}
                      </div>
                    </div>)}
                </div>
              </div>) : (<div className="no-offer">
                <div className="no-offer-icon">📋</div>
                <h3>Nu există ofertă activă</h3>
                <p>Configurează o ofertă zilnică pentru a atrage clienții.</p>
              </div>)}
          </div>
        </div>
      </div>

      {/* Modal pentru configurare */}
      {showModal && (<div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
            <div className="modal-header">
              <h2>Configurează oferta zilei</h2>
              <span className="close" onClick={handleCloseModal}>&times;</span>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Titlu (RO): *</label>
                <input type="text" value={formData.title} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }} required title="Titlu în română"/>
              </div>

              <div className="form-group">
                <label>Descriere (RO): *</label>
                <textarea value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} required title="Descriere în română"/>
              </div>

              <div className="form-group">
                <label>Titlu (EN):</label>
                <input type="text" value={formData.title_en || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title_en: e.target.value })); }} title="Titlu în engleză"/>
              </div>

              <div className="form-group">
                <label>Descriere (EN):</label>
                <textarea value={formData.description_en || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description_en: e.target.value })); }} title="Descriere în engleză"/>
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.is_active} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { is_active: e.target.checked })); }}/>Ofertă activă</label>
              </div>

              {/* Condiții */}
              <div className="offer-conditions-section">
                <h4>Condiții pentru ofertă</h4>
                {formData.conditions.map(function (condition, index) { return (<div key={index} className="condition-item">
                    <select className="category-select" value={condition.category} onChange={function (e) { return handleConditionChange(index, 'category', e.target.value); }} required title="Selectează categoria">
                      <option value="">Selectează categoria</option>
                      {categories.map(function (cat) { return (<option key={cat} value={cat}>{cat}</option>); })}
                    </select>
                    <input type="number" className="quantity-input" min="1" placeholder="Cantitate" value={condition.quantity} onChange={function (e) { return handleConditionChange(index, 'quantity', parseInt(e.target.value, 10) || 1); }} required title="Cantitate minimă"/>
                    <button type="button" className="btn btn-danger btn-sm" onClick={function () { return handleRemoveCondition(index); }}>Șterge</button>
                  </div>); })}
                <button type="button" className="btn btn-success btn-sm" onClick={handleAddCondition}>
                  ➕ Adaugă Condiție
                </button>
              </div>

              {/* Beneficii */}
              <div className="offer-benefits-section">
                <h4>Beneficiile Ofertei</h4>
                <div className="form-group">
                  <label>Tip Beneficiu: *</label>
                  <select value={formData.benefit_type} onChange={function (e) { return handleBenefitTypeChange(e.target.value); }} required title="Tip beneficiu">
                    <option value="category">Categorie</option>
                    <option value="specific">Produse specifice</option>
                  </select>
                </div>

                {formData.benefit_type === 'category' ? (<div id="categoryBenefit">
                    <div className="form-group">
                      <label>Categorie Beneficiu: *</label>
                      <select value={formData.benefit_category || ''} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { benefit_category: e.target.value })); }} required title="Categorie beneficiu">
                        <option value="">Selectează categoria</option>
                        {categories.map(function (cat) { return (<option key={cat} value={cat}>{cat}</option>); })}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Cantitate: *</label>
                      <input type="number" min="1" value={formData.benefit_quantity || 1} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { benefit_quantity: parseInt(e.target.value, 10) || 1 })); }} required title="Cantitate beneficiu"/>
                    </div>
                  </div>) : (<div id="specificBenefit">
                    <div className="form-group">
                      <label>Produse Gratuite (selectează până la 5):</label>
                      {[1, 2, 3, 4, 5].map(function (num) {
                    var _a;
                    return (<div key={num} className="form-group">
                          <label>Produs Gratuit {num}:</label>
                          <select value={((_a = formData.benefit_products) === null || _a === void 0 ? void 0 : _a[num - 1]) || ''} onChange={function (e) { return handleBenefitProductChange(num - 1, e.target.value); }} title={"Produs gratuit ".concat(num)}>
                            <option value="">-- Selectează produsul gratuit --</option>
                            {products.map(function (product) { return (<option key={product.id} value={product.id}>
                                {product.name} - {product.price.toFixed(2)} RON
                              </option>); })}
                          </select>
                        </div>);
                })}
                    </div>
                  </div>)}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Anulează</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Se salvează...' : '💾 Salvează Oferta'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
exports.DailyOfferPage = DailyOfferPage;
