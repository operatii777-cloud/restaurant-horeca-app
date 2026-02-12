"use strict";
/**
 * 🚚 DISPATCH PAGE - Dispecerat Livrări
 * Inspirat din HorecaAI DeliveryManager
 * 3 coloane: Pregătite / În Livrare / Livrate Recent
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
exports.DispatchPage = void 0;
var react_1 = require("react");
var PageHeader_1 = require("@/shared/components/PageHeader");
var lucide_react_1 = require("lucide-react");
var DispatchMap_1 = require("./components/DispatchMap");
require("./DispatchPage.css");
var DispatchPage = function () {
    var _a = (0, react_1.useState)([]), allOrders = _a[0], setAllOrders = _a[1];
    var _b = (0, react_1.useState)([]), availableCouriers = _b[0], setAvailableCouriers = _b[1];
    var _c = (0, react_1.useState)([]), liveCouriers = _c[0], setLiveCouriers = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)('list'), viewMode = _e[0], setViewMode = _e[1];
    var _f = (0, react_1.useState)(null), assigningOrderId = _f[0], setAssigningOrderId = _f[1];
    // Filtrare comenzi pe categorii
    var pendingOrders = allOrders.filter(function (o) {
        return !o.courier_id && (o.status === 'ready' || o.status === 'pending' || o.status === 'completed');
    });
    var inTransitOrders = allOrders.filter(function (o) {
        return o.status === 'picked_up' || o.status === 'in_transit';
    });
    var deliveredOrders = allOrders.filter(function (o) {
        return o.status === 'delivered';
    }).slice(0, 15); // Ultimele 15
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ordersRes, couriersRes, liveRes, ordersData, couriersData, liveData, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    return [4 /*yield*/, Promise.all([
                            fetch('/api/couriers/dispatch/pending'),
                            fetch('/api/couriers/dispatch/available'),
                            fetch('/api/couriers/tracking/live'),
                        ])];
                case 1:
                    _a = _b.sent(), ordersRes = _a[0], couriersRes = _a[1], liveRes = _a[2];
                    return [4 /*yield*/, ordersRes.json()];
                case 2:
                    ordersData = _b.sent();
                    return [4 /*yield*/, couriersRes.json()];
                case 3:
                    couriersData = _b.sent();
                    return [4 /*yield*/, liveRes.json()];
                case 4:
                    liveData = _b.sent();
                    if (ordersData.success)
                        setAllOrders(ordersData.orders || []);
                    if (couriersData.success)
                        setAvailableCouriers(couriersData.couriers || []);
                    if (liveData.success)
                        setLiveCouriers(liveData.couriers || []);
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _b.sent();
                    console.error('Error loading dispatch data:', err_1);
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        loadData();
        var interval = setInterval(loadData, 15000); // Refresh every 15s
        return function () { return clearInterval(interval); };
    }, [loadData]);
    var handleAssign = function (orderId, courierId) { return __awaiter(void 0, void 0, void 0, function () {
        var res, errorData, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!courierId)
                        return [2 /*return*/];
                    setAssigningOrderId(orderId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch('/api/couriers/dispatch/assign', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_id: orderId,
                                courier_id: parseInt(courierId),
                                delivery_fee: 10,
                            }),
                        })];
                case 2:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.json().catch(function () { return ({ error: 'Eroare necunoscută' }); })];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "HTTP ".concat(res.status));
                case 4: return [4 /*yield*/, res.json()];
                case 5:
                    data = _a.sent();
                    if (data.success) {
                        loadData();
                    }
                    else {
                        alert("\u274C ".concat(data.error || 'Eroare la atribuire'));
                    }
                    return [3 /*break*/, 8];
                case 6:
                    err_2 = _a.sent();
                    console.error('Error assigning courier:', err_2);
                    alert("\u274C ".concat(err_2.message || 'Eroare la atribuire curier'));
                    return [3 /*break*/, 8];
                case 7:
                    setAssigningOrderId(null);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleFinishDelivery = function (orderId) { return __awaiter(void 0, void 0, void 0, function () {
        var res, errorData, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/couriers/delivery/".concat(orderId, "/status"), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'delivered' }),
                        })];
                case 1:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json().catch(function () { return ({ error: 'Eroare necunoscută' }); })];
                case 2:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "HTTP ".concat(res.status));
                case 3: return [4 /*yield*/, res.json()];
                case 4:
                    data = _a.sent();
                    if (data.success) {
                        loadData();
                    }
                    else {
                        alert("\u274C ".concat(data.error || 'Eroare la finalizare livrare'));
                    }
                    return [3 /*break*/, 6];
                case 5:
                    err_3 = _a.sent();
                    console.error('Error finishing delivery:', err_3);
                    alert("\u274C ".concat(err_3.message || 'Eroare la finalizare livrare'));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var getVehicleIcon = function (type) {
        var icons = {
            scooter: '🛵', car: '🚗', bicycle: '🚴', motorcycle: '🏍️', walk: '🚶',
        };
        return icons[type] || '🚗';
    };
    var getPlatformIcon = function (platform) {
        var icons = {
            glovo: '🛵',
            wolt: '🔵',
            bolt_food: '🍏',
            uber_eats: '🚗',
            friendsride: '🟣',
            tazz: '⚡',
            phone: '📞',
            online: '🌐',
        };
        return icons[platform || 'phone'] || '📞';
    };
    var openNavigation = function (address, app) {
        if (app === void 0) { app = 'google'; }
        if (!address)
            return;
        if (app === 'waze') {
            window.open("https://www.waze.com/ul?q=".concat(encodeURIComponent(address)), '_blank');
        }
        else {
            window.open("https://www.google.com/maps/dir/?api=1&destination=".concat(encodeURIComponent(address)), '_blank');
        }
    };
    var callCustomer = function (phone) {
        if (phone)
            window.open("tel:".concat(phone), '_self');
    };
    var formatTime = function (dateStr) {
        var date = new Date(dateStr);
        var now = new Date();
        var diffMs = now.getTime() - date.getTime();
        var diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1)
            return 'Acum';
        if (diffMins < 60)
            return "".concat(diffMins, " min");
        return "".concat(Math.floor(diffMins / 60), "h ").concat(diffMins % 60, "m");
    };
    if (loading) {
        return (<div className="dispatch-page">
        <PageHeader_1.PageHeader title="🚚 Dispatch" description="Se încarcă..."/>
        <div className="dispatch-loading">⏳ Se încarcă datele...</div>
      </div>);
    }
    return (<div className="dispatch-page" data-page-ready="true">
      {/* Header */}
      <div className="dispatch-header">
        <div className="dispatch-header-left">
          <h1><lucide_react_1.Bike size={28}/> Dispecerat Livrări</h1>
          <p>Gestionează flota și statusul comenzilor</p>
        </div>
        <div className="dispatch-header-right">
          <div className="view-toggle">
            <button onClick={function () { return setViewMode('list'); }} className={"view-toggle-btn ".concat(viewMode === 'list' ? 'active' : '')}>
              <lucide_react_1.List size={16}/> Lista
            </button>
            <button onClick={function () { return setViewMode('map'); }} className={"view-toggle-btn ".concat(viewMode === 'map' ? 'active' : '')}>
              <lucide_react_1.Map size={16}/> Harta Live
            </button>
          </div>
          <div className="couriers-online-badge">
            <span className="online-dot"></span>
            <span>{availableCouriers.filter(function (c) { return c.status === 'online'; }).length} Șoferi Activi</span>
          </div>
          <button onClick={loadData} className="btn-refresh" title="Reîncarcă datele">
            <lucide_react_1.RefreshCw size={18}/>
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* === LIST VIEW - 4 COLOANE (3 comenzi + 1 curieri) === */
        <div className="dispatch-columns">
          
          {/* COLOANA 0: Curieri Activi cu Locații */}
          <div className="dispatch-column column-couriers">
            <div className="column-header couriers">
              <h3><lucide_react_1.Bike size={16}/> Curieri Activi</h3>
              <span className="column-count">{availableCouriers.filter(function (c) { return c.status === 'online'; }).length}</span>
            </div>
            <div className="column-content">
              {availableCouriers.filter(function (c) { return c.status === 'online'; }).length === 0 ? (<div className="column-empty">Niciun curier activ</div>) : (availableCouriers
                .filter(function (c) { return c.status === 'online'; })
                .map(function (courier) { return (<div key={courier.id} className="courier-card">
                      <div className="courier-card-header">
                        <span className="courier-vehicle">{getVehicleIcon(courier.vehicle_type)}</span>
                        <span className="courier-name">{courier.name}</span>
                        <span className={"courier-status-badge ".concat(courier.status)}>
                          {courier.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                        </span>
                      </div>
                      
                      <div className="courier-card-body">
                        <div className="courier-row">
                          <lucide_react_1.Phone size={14}/>
                          <span>{courier.phone || '-'}</span>
                        </div>
                        
                        {courier.current_lat && courier.current_lng ? (<>
                            <div className="courier-row">
                              <lucide_react_1.MapPin size={14}/>
                              <span className="courier-location">
                                📍 {courier.current_lat.toFixed(6)}, {courier.current_lng.toFixed(6)}
                              </span>
                            </div>
                            <div className="courier-nav-buttons">
                              <button onClick={function () { return window.open("https://www.google.com/maps?q=".concat(courier.current_lat, ",").concat(courier.current_lng), '_blank'); }} className="btn-nav btn-maps" title="Vezi pe hartă">
                                <lucide_react_1.Map size={12}/> Vezi pe hartă
                              </button>
                            </div>
                          </>) : (<div className="courier-row">
                            <lucide_react_1.MapPin size={14}/>
                            <span className="courier-location-missing">📍 Locație indisponibilă</span>
                          </div>)}
                        
                        {courier.active_count > 0 && (<div className="courier-active-orders">
                            <span className="active-orders-badge">
                              {courier.active_count} {courier.active_count === 1 ? 'comandă activă' : 'comenzi active'}
                            </span>
                          </div>)}
                      </div>
                    </div>); }))}
            </div>
          </div>
          
          {/* COLOANA 1: Pregătite / În Așteptare */}
          <div className="dispatch-column column-pending">
            <div className="column-header pending">
              <h3><lucide_react_1.Clock size={16}/> Pregătite / În Așteptare</h3>
              <span className="column-count">{pendingOrders.length}</span>
            </div>
            <div className="column-content">
              {pendingOrders.length === 0 ? (<div className="column-empty">Nicio comandă în așteptare</div>) : (pendingOrders.map(function (order) {
                var _a;
                return (<div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-platform">{getPlatformIcon(order.platform)}</span>
                      <span className="order-number">#{order.order_number || order.id}</span>
                      <span className="order-time">{formatTime(order.created_at)}</span>
                    </div>
                    
                    <div className="order-card-body">
                      <div className="order-row">
                        <lucide_react_1.UserCircle size={14}/>
                        <strong>{order.customer_name || 'Client'}</strong>
                      </div>
                      <div className="order-row">
                        <lucide_react_1.MapPin size={14}/>
                        <span className="order-address">{order.delivery_address || 'Adresă nespecificată'}</span>
                      </div>
                      <div className="order-row">
                        <lucide_react_1.Phone size={14}/>
                        <span>{order.customer_phone || '-'}</span>
                        {order.customer_phone && (<button onClick={function () { return callCustomer(order.customer_phone); }} className="btn-icon btn-call" title="Sună clientul">
                            <lucide_react_1.Phone size={12}/>
                          </button>)}
                      </div>
                      
                      {/* Butoane navigație */}
                      <div className="order-nav-buttons">
                        <button onClick={function () { return openNavigation(order.delivery_address, 'google'); }} className="btn-nav btn-maps" title="Google Maps">
                          <lucide_react_1.Navigation size={12}/> Maps
                        </button>
                        <button onClick={function () { return openNavigation(order.delivery_address, 'waze'); }} className="btn-nav btn-waze" title="Waze">
                          <lucide_react_1.Navigation size={12}/> Waze
                        </button>
                      </div>
                    </div>
                    
                    <div className="order-card-footer">
                      <span className="order-total">{(_a = order.total) === null || _a === void 0 ? void 0 : _a.toFixed(2)} RON</span>
                      <span className={"payment-badge ".concat(order.payment_method)}>
                        {order.payment_method === 'cash' ? '💵 Cash' : order.payment_method === 'protocol' ? '📋 Protocol' : order.payment_method === 'degustare' ? '🍷 Degustare' : '💳 Card'}
                      </span>
                    </div>
                    
                    {/* Dropdown Alocare Șofer */}
                    <div className="order-assign">
                      <label htmlFor={"assign-".concat(order.id)}>Alocă Șofer:</label>
                      <select id={"assign-".concat(order.id)} onChange={function (e) { return handleAssign(order.id, e.target.value); }} defaultValue="" disabled={assigningOrderId === order.id} title="Selectează un curier pentru această comandă">
                        <option value="" disabled>-- Selectează --</option>
                        {availableCouriers.map(function (c) { return (<option key={c.id} value={c.id}>
                            {getVehicleIcon(c.vehicle_type)} {c.name}
                          </option>); })}
                      </select>
                    </div>
                  </div>);
            }))}
            </div>
          </div>

          {/* COLOANA 2: În Livrare */}
          <div className="dispatch-column column-transit">
            <div className="column-header transit">
              <h3><lucide_react_1.Navigation size={16}/> În Livrare</h3>
              <span className="column-count">{inTransitOrders.length}</span>
            </div>
            <div className="column-content">
              {inTransitOrders.length === 0 ? (<div className="column-empty">Nicio livrare activă</div>) : (inTransitOrders.map(function (order) { return (<div key={order.id} className="order-card in-transit">
                    <div className="order-card-header">
                      <span className="order-platform">{getPlatformIcon(order.platform)}</span>
                      <span className="order-number">#{order.order_number || order.id}</span>
                      {order.courier_name && (<span className="courier-badge">
                          <lucide_react_1.Bike size={12}/> {order.courier_name}
                        </span>)}
                    </div>
                    
                    <div className="order-card-body">
                      <div className="order-row">
                        <lucide_react_1.MapPin size={14}/>
                        <span className="order-address">{order.delivery_address}</span>
                      </div>
                      
                      {/* Butoane acțiuni */}
                      <div className="order-nav-buttons">
                        <button onClick={function () { return callCustomer(order.customer_phone); }} className="btn-nav btn-call-full">
                          <lucide_react_1.Phone size={12}/> Sună
                        </button>
                        <button onClick={function () { return openNavigation(order.delivery_address, 'google'); }} className="btn-nav btn-maps">
                          <lucide_react_1.Navigation size={12}/> Maps
                        </button>
                        <button onClick={function () { return openNavigation(order.delivery_address, 'waze'); }} className="btn-nav btn-waze">
                          <lucide_react_1.Navigation size={12}/> Waze
                        </button>
                      </div>
                    </div>
                    
                    <button onClick={function () { return handleFinishDelivery(order.id); }} className="btn-finish-delivery">
                      <lucide_react_1.CheckCircle size={16}/> Finalizează Livrarea
                    </button>
                  </div>); }))}
            </div>
          </div>

          {/* COLOANA 3: Livrate Recent */}
          <div className="dispatch-column column-delivered">
            <div className="column-header delivered">
              <h3><lucide_react_1.CheckCircle size={16}/> Livrate Recent</h3>
              <span className="column-count">{deliveredOrders.length}</span>
            </div>
            <div className="column-content">
              {deliveredOrders.length === 0 ? (<div className="column-empty">Nicio livrare finalizată</div>) : (deliveredOrders.map(function (order) { return (<div key={order.id} className="order-card delivered">
                    <div className="delivered-row">
                      <div className="delivered-info">
                        <span className="order-platform">{getPlatformIcon(order.platform)}</span>
                        <span className="order-number strikethrough">#{order.order_number || order.id}</span>
                      </div>
                      <div className="delivered-courier">
                        Livrat de {order.courier_name || 'Curier'}
                      </div>
                    </div>
                    <div className="delivered-status">
                      <lucide_react_1.CheckCircle size={14}/> OK
                    </div>
                  </div>); }))}
            </div>
          </div>
        </div>) : (
        /* === MAP VIEW === */
        <div className="dispatch-map-view">
          <div className="map-container">
            <DispatchMap_1.DispatchMap couriers={liveCouriers} pendingOrders={pendingOrders} inTransitOrders={inTransitOrders} restaurantLat={parseFloat(import.meta.env.VITE_RESTAURANT_LAT || '44.40535')} restaurantLng={parseFloat(import.meta.env.VITE_RESTAURANT_LNG || '25.99008')}/>
            
            <div className="map-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#10B981' }}></span> Curieri ({liveCouriers.length})
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#3B82F6' }}></span> Pregătite ({pendingOrders.length})
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#F59E0B' }}></span> În Livrare ({inTransitOrders.length})
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#FF6B35' }}></span> Restaurant (HQ)
              </div>
            </div>
          </div>
        </div>)}
    </div>);
};
exports.DispatchPage = DispatchPage;
exports.default = exports.DispatchPage;
