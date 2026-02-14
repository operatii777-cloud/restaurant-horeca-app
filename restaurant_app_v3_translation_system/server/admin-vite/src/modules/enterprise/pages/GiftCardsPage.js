"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🎁 GIFT CARDS PAGE - Gestionare carduri cadou
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
exports.GiftCardsPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./GiftCardsPage.css");
var GiftCardsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), cards = _b[0], setCards = _b[1];
    var _c = (0, react_1.useState)(false), showCreateModal = _c[0], setShowCreateModal = _c[1];
    var _d = (0, react_1.useState)({
        initial_value: '',
        recipient_name: '',
        recipient_email: '',
        purchaser_name: '',
        purchaser_email: '',
        message: '',
        expiry_days: '365'
    }), formData = _d[0], setFormData = _d[1];
    var loadCards = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/gift-cards')];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setCards(data.giftCards || []);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error('Error loading gift cards:', err_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadCards();
    }, []);
    var handleCreate = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/gift-cards', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, formData), { initial_value: parseFloat(formData.initial_value), expiry_days: parseInt(formData.expiry_days) }))
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowCreateModal(false);
                        setFormData({
                            initial_value: '',
                            recipient_name: '',
                            recipient_email: '',
                            purchaser_name: '',
                            purchaser_email: '',
                            message: '',
                            expiry_days: '365'
                        });
                        loadCards();
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error('Error creating gift card:', err_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        switch (status) {
            case 'active': return '#22c55e';
            case 'used': return '#6b7280';
            case 'expired': return '#ef4444';
            case 'cancelled': return '#f59e0b';
            default: return '#6b7280';
        }
    };
    if (loading && cards.length === 0) {
        return (<div className="gift-cards-page">
        <PageHeader_1.PageHeader title="🎁 Gift Cards" description="Se încarcă cardurile..."/>
        <div className="loading">⏳ Se încarcă...</div>
      </div>);
    }
    return (<div className="gift-cards-page">
      <PageHeader_1.PageHeader title="🎁 Gift Cards" description="Gestionare carduri cadou"/>

      <div className="gift-cards-header">
        <button className="btn-create" onClick={function () { return setShowCreateModal(true); }}>
          ➕ Creează Card Cadou
        </button>
        <button onClick={loadCards} className="btn-refresh">
          🔄 Actualizează
        </button>
      </div>

      {/* Cards Grid */}
      <div className="gift-cards-grid">
        {cards.map(function (card) { return (<div key={card.id} className="gift-card-item">
            <div className="card-header">
              <h3>{card.code}</h3>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(card.status) }}>
                {card.status.toUpperCase()}
              </span>
            </div>
            <div className="card-body">
              <div className="card-stat">
                <span className="stat-label">"valoare initiala"</span>
                <span className="stat-value">{card.initial_value.toFixed(2)} RON</span>
              </div>
              <div className="card-stat">
                <span className="stat-label">"sold curent"</span>
                <span className="stat-value balance">{card.current_balance.toFixed(2)} RON</span>
              </div>
              {card.recipient_name && (<div className="card-stat">
                  <span className="stat-label">"Destinatar:"</span>
                  <span className="stat-value">{card.recipient_name}</span>
                </div>)}
              {card.expiry_date && (<div className="card-stat">
                  <span className="stat-label">"Expiră:"</span>
                  <span className="stat-value">
                    {new Date(card.expiry_date).toLocaleDateString('ro-RO')}
                  </span>
                </div>)}
            </div>
          </div>); })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (<div className="modal-overlay" onClick={function () { return setShowCreateModal(false); }}>
          <div className="modal-content" onClick={function (e) { return e.stopPropagation(); }}>
            <h2>➕ Creează Card Cadou</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Valoare Inițială (RON):</label>
                <input type="number" step="0.01" required value={formData.initial_value} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { initial_value: e.target.value })); }}/>
              </div>
              <div className="form-group">
                <label>"nume destinatar"</label>
                <input type="text" value={formData.recipient_name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { recipient_name: e.target.value })); }}/>
              </div>
              <div className="form-group">
                <label>"email destinatar"</label>
                <input type="email" value={formData.recipient_email} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { recipient_email: e.target.value })); }}/>
              </div>
              <div className="form-group">
                <label>"nume cumparator"</label>
                <input type="text" value={formData.purchaser_name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { purchaser_name: e.target.value })); }}/>
              </div>
              <div className="form-group">
                <label>"zile valabilitate"</label>
                <input type="number" value={formData.expiry_days} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { expiry_days: e.target.value })); }}/>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">"Creează"</button>
                <button type="button" className="btn-cancel" onClick={function () { return setShowCreateModal(false); }}>"Anulează"</button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
exports.GiftCardsPage = GiftCardsPage;
