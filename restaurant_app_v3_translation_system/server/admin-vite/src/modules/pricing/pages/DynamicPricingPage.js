"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * DYNAMIC PRICING PAGE - UI pentru prețuri dinamice (Happy Hour, Peak Hours)
 * Data: 03 Decembrie 2025
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
exports.default = DynamicPricingPage;
var react_1 = require("react");
var axios_1 = require("axios");
require("./DynamicPricingPage.css");
function DynamicPricingPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)(null), selectedProductId = _b[0], setSelectedProductId = _b[1];
    var _c = (0, react_1.useState)(new Date().getHours()), currentHour = _c[0], setCurrentHour = _c[1];
    var _d = (0, react_1.useState)(null), dynamicPrice = _d[0], setDynamicPrice = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    (0, react_1.useEffect)(function () {
        loadProducts();
        // Update hour every minute
        var interval = setInterval(function () {
            setCurrentHour(new Date().getHours());
        }, 60000);
        return function () { return clearInterval(interval); };
    }, []);
    var loadProducts = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('/api/products')];
                case 1:
                    res = _a.sent();
                    setProducts(res.data.data || []);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error('Failed to load products:', err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleCalculate = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedProductId) {
                        alert('Selectează un produs!');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, axios_1.default.post('/api/pricing/dynamic', {
                            productId: selectedProductId,
                            hour: currentHour
                        })];
                case 2:
                    res = _c.sent();
                    setDynamicPrice(res.data.data);
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _c.sent();
                    alert('Eroare: ' + (((_b = (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || err_2.message));
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getRuleDescription = function (rule) {
        var rules = {
            'happy_hour': '🍹 Happy Hour (14:00-17:00) - Reducere 20%',
            "Peak Hours": '🔥 Peak Hours (19:00-22:00) - Majorare 10%',
            "Lunch Special": '🍽️ Lunch Special (12:00-14:00) - Reducere 15%',
            'base': '📌 Preț de bază (fără modificări)'
        };
        return rules[rule] || rule;
    };
    var getCurrentRule = function () {
        if (currentHour >= 14 && currentHour < 17)
            return 'happy_hour';
        if (currentHour >= 19 && currentHour < 22)
            return "Peak Hours";
        if (currentHour >= 12 && currentHour < 14)
            return "Lunch Special";
        return 'base';
    };
    return (<div className="dynamic-pricing-page">
      <h1 className="page-title">💰 Prețuri Dinamice (Happy Hour / Peak Hours)</h1>

      <div className="card">
        <h3>"calculeaza pret dinamic"</h3>
        
        <div className="current-time-box">
          <span className="label">"ora curenta"</span>
          <span className="value">{currentHour}:00</span>
          <span className="rule-badge">{getRuleDescription(getCurrentRule())}</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Produs</label>
            <select value={selectedProductId || ''} onChange={function (e) { return setSelectedProductId(parseInt(e.target.value)); }} title="Produs">
              <option value="">-- Alege produs --</option>
              {products.map(function (p) { return (<option key={p.id} value={p.id}>
                  {p.name} ({p.category}) - {p.price} RON
                </option>); })}
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculez...' : '💰 Calculează Preț Dinamic'}
        </button>
      </div>

      {dynamicPrice && (<div className="card result-card">
          <h3>✅ Preț Calculat: {dynamicPrice.product_name}</h3>
          
          <div className="pricing-summary">
            <div className="price-item base">
              <span className="label">"pret de baza"</span>
              <span className="value">{dynamicPrice.base_price.toFixed(2)} RON</span>
            </div>
            
            <div className="arrow">→</div>
            
            <div className="price-item dynamic">
              <span className="label">"pret dinamic"</span>
              <span className="value">{dynamicPrice.dynamic_price.toFixed(2)} RON</span>
            </div>
          </div>

          <div className="rule-info">
            <div className="rule-badge-large">
              {getRuleDescription(dynamicPrice.rule_applied)}
            </div>
            
            {dynamicPrice.discount_percent !== 0 && (<div className={"discount-badge ".concat(dynamicPrice.discount_percent > 0 ? 'positive' : 'negative')}>
                {dynamicPrice.discount_percent > 0 ? '+' : ''}{dynamicPrice.discount_percent}%
              </div>)}
          </div>

          <div className="info-box">
            <strong>ℹ️ Regulile de pricing:</strong>
            <ul>
              <li>🍹 <strong>Happy Hour</strong> (14:00-17:00): -20% reducere</li>
              <li>🍽️ <strong>"lunch special"</strong> (12:00-14:00): -15% reducere</li>
              <li>🔥 <strong>"peak hours"</strong> (19:00-22:00): +10% majorare</li>
              <li>📌 <strong>Restul zilei</strong>: Preț de bază</li>
            </ul>
          </div>
        </div>)}
    </div>);
}
