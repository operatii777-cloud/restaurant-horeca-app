"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🚚 COURIERS MANAGEMENT PAGE
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
exports.CouriersPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./CouriersPage.css");
var CouriersPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), couriers = _a[0], setCouriers = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), showAddModal = _c[0], setShowAddModal = _c[1];
    var _d = (0, react_1.useState)({
        name: '', phone: '', email: '', vehicle_type: 'scooter', vehicle_number: '', commission_rate: 0,
    }), newCourier = _d[0], setNewCourier = _d[1];
    var loadCouriers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/couriers')];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success)
                        setCouriers(data.couriers);
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error('Error:', err_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () { loadCouriers(); }, []);
    var handleAddCourier = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newCourier.name || !newCourier.phone) {
                        alert('Nume și telefon obligatorii!');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/couriers', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newCourier),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setShowAddModal(false);
                        setNewCourier({ name: '', phone: '', email: '', vehicle_type: 'scooter', vehicle_number: '', commission_rate: 0 });
                        loadCouriers();
                        alert("\u2705 Curier creat! Cod: ".concat(data.code));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    alert("\u274C ".concat(err_2.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleStatus = function (courier) { return __awaiter(void 0, void 0, void 0, function () {
        var newStatus, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newStatus = courier.status === 'offline' ? 'online' : 'offline';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/couriers/".concat(courier.id, "/status"), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus }),
                        })];
                case 2:
                    _a.sent();
                    loadCouriers();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error(err_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEndShift = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Încheie tura și decontează?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/couriers/\"Id\"/shift/end", { method: 'POST' })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        alert("\u2705 Tur\u0103 \u00EEncheiat\u0103! Cash: ".concat(data.cash_collected, " RON"));
                        loadCouriers();
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    alert("\u274C ".concat(err_4.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteCourier = function (id, name) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("\u274C \u0218tergi curierul \"\"Name\"\"?\n\nAceast\u0103 ac\u021Biune este DEFINITIV\u0102!"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/couriers/\"Id\"", { method: 'DELETE' })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        alert("\u2705 Curier \u0219ters cu succes!");
                        loadCouriers();
                    }
                    else {
                        alert("\u274C ".concat(data.error));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_5 = _a.sent();
                    alert("\u274C ".concat(err_5.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getVehicleIcon = function (type) {
        var icons = { scooter: '🛵', car: '🚗', bicycle: '🚴', motorcycle: '🏍️', walk: '🚶' };
        return icons[type] || '🚗';
    };
    var getStatusBadge = function (status) {
        var badges = {
            online: { class: 'online', label: '🟢 Online' },
            offline: { class: 'offline', label: '⚫ Offline' },
            busy: { class: 'busy', label: '🔴 În livrare' },
            break: { class: 'break', label: '🟡 Pauză' },
        };
        return badges[status] || badges.offline;
    };
    return (<div className="couriers-page" data-page-ready="true">
      <PageHeader_1.PageHeader title='🚚 gestiune curieri' description="Administrează curierii proprii" actions={[
            { label: '➕ Adaugă Curier', variant: 'primary', onClick: function () { return setShowAddModal(true); } },
            { label: '🔄 Refresh', variant: 'secondary', onClick: loadCouriers },
        ]}/>

      <div className="couriers-summary">
        <div className="summary-item"><span className="summary-value">{couriers.length}</span><span className="summary-label">Total</span></div>
        <div className="summary-item online"><span className="summary-value">{couriers.filter(function (c) { return c.status === 'online'; }).length}</span><span className="summary-label">Online</span></div>
        <div className="summary-item busy"><span className="summary-value">{couriers.filter(function (c) { return c.status === 'busy'; }).length}</span><span className="summary-label">"in livrare"</span></div>
        <div className="summary-item"><span className="summary-value">{couriers.reduce(function (sum, c) { return sum + (c.today_deliveries || 0); }, 0)}</span><span className="summary-label">"livrari azi"</span></div>
      </div>

      {loading ? (<div className="loading">⏳ Se încarcă...</div>) : (<div className="couriers-grid">
          {couriers.map(function (courier) {
                var _a;
                var badge = getStatusBadge(courier.status);
                return (<div key={courier.id} className="courier-card">
                <div className="courier-header">
                  <span className="courier-vehicle">{getVehicleIcon(courier.vehicle_type)}</span>
                  <div className="courier-info">
                    <h3>{courier.name}</h3>
                    <span className="courier-code">{courier.code} • ID: {courier.id}</span>
                  </div>
                  <span className={"status-badge ".concat(badge.class)}>{badge.label}</span>
                </div>
                <div className="courier-contact">📞 {courier.phone}</div>
                <div className="courier-stats">
                  <div className="stat"><span className="stat-value">{courier.today_deliveries || 0}</span><span className="stat-label">Azi</span></div>
                  <div className="stat"><span className="stat-value">{courier.active_deliveries || 0}</span><span className="stat-label">Active</span></div>
                  <div className="stat"><span className="stat-value">⭐ {((_a = courier.rating) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || '5.0'}</span><span className="stat-label">Rating</span></div>
                </div>
                <div className="courier-actions">
                  <button className={"btn-status ".concat(courier.status === 'offline' ? 'btn-online' : 'btn-offline')} onClick={function () { return handleToggleStatus(courier); }}>
                    {courier.status === 'offline' ? '▶️ Start' : '⏹️ Stop'}
                  </button>
                  {courier.status !== 'offline' && (<button className="btn-end-shift" onClick={function () { return handleEndShift(courier.id); }}>💰 Decontează</button>)}
                  {courier.status === 'offline' && (<button className="btn-delete" onClick={function () { return handleDeleteCourier(courier.id, courier.name); }}>🗑️ Șterge</button>)}
                </div>
              </div>);
            })}
        </div>)}

      {showAddModal && (<div className="modal-overlay" onClick={function () { return setShowAddModal(false); }}>
          <div className="modal" onClick={function (e) { return e.stopPropagation(); }}>
            <h3>➕ Adaugă Curier</h3>
            
            <form onSubmit={function (e) { e.preventDefault(); handleAddCourier(); }}>
              <div className="form-group">
                <label>Nume *</label>
                <input type="text" value={newCourier.name} onChange={function (e) { return setNewCourier(__assign(__assign({}, newCourier), { name: e.target.value })); }} placeholder="ion popescu"/>
              </div>

              <div className="form-group">
                <label>Telefon *</label>
                <input type="tel" value={newCourier.phone} onChange={function (e) { return setNewCourier(__assign(__assign({}, newCourier), { phone: e.target.value })); }} placeholder="0722123456"/>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newCourier.email} onChange={function (e) { return setNewCourier(__assign(__assign({}, newCourier), { email: e.target.value })); }} placeholder='[ion@emailcom]'/>
              </div>

              <div className="form-group">
                <label>"Vehicul"</label>
                <select value={newCourier.vehicle_type} onChange={function (e) { return setNewCourier(__assign(__assign({}, newCourier), { vehicle_type: e.target.value })); }} title="Vehicul">
                  <option value="scooter">🛵 Scooter</option>
                  <option value="motorcycle">🏍️ Motocicletă</option>
                  <option value="car">🚗 Mașină</option>
                  <option value="bicycle">🚴 Bicicletă</option>
                </select>
              </div>

              <div className="form-group">
                <label>"nr vehicul"</label>
                <input type="text" value={newCourier.vehicle_number} onChange={function (e) { return setNewCourier(__assign(__assign({}, newCourier), { vehicle_number: e.target.value })); }} placeholder="B-123-ABC"/>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={function () { return setShowAddModal(false); }}>"Anulează"</button>
                <button type="submit" className="btn-save">💾 Salvează</button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
exports.CouriersPage = CouriersPage;
exports.default = exports.CouriersPage;
