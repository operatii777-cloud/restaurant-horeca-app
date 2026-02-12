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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var QueueMonitorPage_1 = require("@/modules/queue-monitor/pages/QueueMonitorPage");
var MonitoringPage = function () {
    var _a, _b, _c;
    //   const { t } = useTranslation();
    var location = (0, react_router_dom_1.useLocation)();
    var _d = (0, react_1.useState)(null), systemMetrics = _d[0], setSystemMetrics = _d[1];
    var _e = (0, react_1.useState)(null), orderMetrics = _e[0], setOrderMetrics = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    // Detectează tab-ul din URL
    var getInitialTab = function () {
        if (location.pathname.includes('/performance'))
            return 'performance';
        if (location.pathname.includes('/queue'))
            return 'queue';
        return 'overview';
    };
    var _g = (0, react_1.useState)(getInitialTab()), activeTab = _g[0], setActiveTab = _g[1];
    (0, react_1.useEffect)(function () {
        loadMetrics();
        var interval = setInterval(loadMetrics, 5000); // Update every 5 seconds
        return function () { return clearInterval(interval); };
    }, []);
    var loadMetrics = function () { return __awaiter(void 0, void 0, void 0, function () {
        var systemResponse, systemData, rawSystem, memory, ordersResponse, ordersData, orders, completedOrders, avgPrepTime, delayed, kitchenOrders, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, 8, 9]);
                    return [4 /*yield*/, fetch('/api/dashboard/metrics')];
                case 1:
                    systemResponse = _a.sent();
                    if (!systemResponse.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, systemResponse.json()];
                case 2:
                    systemData = _a.sent();
                    rawSystem = systemData.system || {};
                    memory = rawSystem.memory || { heapUsed: 0, heapTotal: 0, external: 0 };
                    setSystemMetrics({
                        response_time: rawSystem.response_time || 0, // Not available from backend, default to 0
                        active_connections: rawSystem.active_connections || 0, // Not available from backend, default to 0
                        memory: {
                            heapUsed: memory.heapUsed || 0,
                            heapTotal: memory.heapTotal || 0,
                            external: memory.external || 0,
                        },
                    });
                    _a.label = 3;
                case 3: return [4 /*yield*/, fetch('/api/orders?limit=100')];
                case 4:
                    ordersResponse = _a.sent();
                    if (!ordersResponse.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, ordersResponse.json()];
                case 5:
                    ordersData = _a.sent();
                    if (ordersData.success && ordersData.data) {
                        orders = ordersData.data;
                        completedOrders = orders.filter(function (o) { return o.status === 'completed' && o.finished_at; });
                        avgPrepTime = completedOrders.length > 0
                            ? completedOrders.reduce(function (sum, o) {
                                var prepTime = new Date(o.finished_at).getTime() - new Date(o.timestamp).getTime();
                                return sum + (prepTime / 1000 / 60); // Convert to minutes
                            }, 0) / completedOrders.length
                            : 0;
                        delayed = orders.filter(function (o) {
                            if (o.status === 'completed' && o.finished_at) {
                                var prepTime = (new Date(o.finished_at).getTime() - new Date(o.timestamp).getTime()) / 1000 / 60;
                                return prepTime > 30;
                            }
                            return false;
                        }).length;
                        kitchenOrders = orders.filter(function (o) {
                            return o.status === 'pending' || o.status === 'preparing';
                        }).length;
                        setOrderMetrics({
                            avg_preparation_time: avgPrepTime,
                            delayed_orders: delayed,
                            kitchen_load: kitchenOrders,
                            bar_load: 0, // Will be calculated separately
                            tables_long_occupation: 0 // Will be calculated separately
                        });
                    }
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error loading metrics:', error_1);
                    return [3 /*break*/, 9];
                case 8:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="padding-20">
      <div className="page-header margin-bottom-20">
        <h1><i className="fas fa-tachometer-alt me-2"></i>Dashboard Monitorizare și Performanță</h1>
        <button className="btn btn-primary" onClick={loadMetrics}>
          <i className="fas fa-sync me-1"></i>Reîncarcă</button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={"nav-link ".concat(activeTab === 'overview' ? 'active' : '')} onClick={function () { return setActiveTab('overview'); }}>
            Prezentare Generală
          </button>
        </li>
        <li className="nav-item">
          <button className={"nav-link ".concat(activeTab === 'queue' ? 'active' : '')} onClick={function () { return setActiveTab('queue'); }}>
            Monitor Coadă
          </button>
        </li>
        <li className="nav-item">
          <button className={"nav-link ".concat(activeTab === 'performance' ? 'active' : '')} onClick={function () { return setActiveTab('performance'); }}>Performance Metrics</button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (<div>
          <div className="row mb-4">
            {/* System Metrics */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5><i className="fas fa-server me-2"></i>Metrici Sistem</h5>
                </div>
                <div className="card-body">
                  {systemMetrics ? (<>
                      <div className="mb-3">
                        <strong>Timp de Răspuns:</strong> {systemMetrics.response_time || 0}ms
                      </div>
                      <div className="mb-3">
                        <strong>Conexiuni Active:</strong> {systemMetrics.active_connections || 0}
                      </div>
                      <div className="mb-3">
                        <strong>Utilizare Memorie:</strong> {Math.round((((_a = systemMetrics.memory) === null || _a === void 0 ? void 0 : _a.heapUsed) || 0) / 1024 / 1024)}MB
                      </div>
                    </>) : (<p>Se încarcă...</p>)}
                </div>
              </div>
            </div>

            {/* Order Metrics */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5><i className="fas fa-utensils me-2"></i>Metrici Comenzi</h5>
                </div>
                <div className="card-body">
                  {orderMetrics ? (<>
                      <div className="mb-3">
                        <strong>Timp Mediu Preparare:</strong> {orderMetrics.avg_preparation_time.toFixed(1)} min
                      </div>
                      <div className="mb-3">
                        <strong>Comenzi Întârziate</strong> <span className="text-danger">{orderMetrics.delayed_orders}</span>
                      </div>
                      <div className="mb-3">
                        <strong>Încărcare Bucătărie</strong> {orderMetrics.kitchen_load} comenzi
                      </div>
                      <div className="mb-3">
                        <strong>Încărcare Bar</strong> {orderMetrics.bar_load} comenzi
                      </div>
                    </>) : (<p>Se încarcă...</p>)}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-warning text-dark">
                  <h5><i className="fas fa-exclamation-triangle me-2"></i>Alerte</h5>
                </div>
                <div className="card-body">
                  {orderMetrics && orderMetrics.delayed_orders > 0 && (<div className="alert alert-danger">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {orderMetrics.delayed_orders} comenzi întârziate necesită atenție!
                    </div>)}
                  {orderMetrics && orderMetrics.kitchen_load > 10 && (<div className="alert alert-warning">
                      <i className="fas fa-clock me-2"></i>
                      Bucătăria este încărcată ({orderMetrics.kitchen_load} comenzi)
                    </div>)}
                  {!orderMetrics || (orderMetrics.delayed_orders === 0 && orderMetrics.kitchen_load <= 10) && (<div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>Totul funcționează normal</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>)}

      {/* Queue Monitor Tab */}
      {activeTab === 'queue' && (<QueueMonitorPage_1.default />)}

      {/* Performance Metrics Tab */}
      {activeTab === 'performance' && (<div>
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-chart-line me-2"></i>Metrici Performanță</h5>
            </div>
            <div className="card-body">
              {systemMetrics ? (<div className="row">
                  <div className="col-md-6">
                    <h6>Performanță Sistem</h6>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Timp de Răspuns:</span>
                        <strong>{systemMetrics.response_time || 0}ms</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Conexiuni Active:</span>
                        <strong>{systemMetrics.active_connections || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Memorie Heap Utilizată:</span>
                        <strong>{Math.round((((_b = systemMetrics.memory) === null || _b === void 0 ? void 0 : _b.heapUsed) || 0) / 1024 / 1024)}MB</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Memorie Heap Totală:</span>
                        <strong>{Math.round((((_c = systemMetrics.memory) === null || _c === void 0 ? void 0 : _c.heapTotal) || 0) / 1024 / 1024)}MB</strong>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Performanță Comenzi</h6>
                    {orderMetrics ? (<ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Timp Mediu Preparare:</span>
                          <strong>{orderMetrics.avg_preparation_time.toFixed(1)} min</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Comenzi Întârziate</span>
                          <strong className="text-danger">{orderMetrics.delayed_orders}</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Încărcare Bucătărie</span>
                          <strong>{orderMetrics.kitchen_load} comenzi</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <span>Încărcare Bar</span>
                          <strong>{orderMetrics.bar_load} comenzi</strong>
                        </li>
                      </ul>) : (<p>Se încarcă...</p>)}
                  </div>
                </div>) : (<p>Se încarcă metrici...</p>)}
            </div>
          </div>
        </div>)}
    </div>);
};
exports.MonitoringPage = MonitoringPage;
