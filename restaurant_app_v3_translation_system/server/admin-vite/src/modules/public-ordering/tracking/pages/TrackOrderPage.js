"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Track Order Page
 * Public page for tracking delivery orders
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
exports.TrackOrderPage = TrackOrderPage;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var httpClient_1 = require("@/shared/api/httpClient");
var TrackOrderMap_1 = require("../components/TrackOrderMap");
function TrackOrderPage() {
    var _this = this;
    //   const { t } = useTranslation();
    var _a = (0, react_router_dom_1.useSearchParams)(), searchParams = _a[0], setSearchParams = _a[1];
    var _b = (0, react_1.useState)(searchParams.ge[orderId] || ''), orderId = _b[0], setOrderId = _b[1];
    var _c = (0, react_1.useState)(null), order = _c[0], setOrder = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    (0, react_1.useEffect)(function () {
        if (orderId) {
            loadOrder(orderId);
        }
    }, [orderId]);
    var loadOrder = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!id || !/^\d+$/.test(id)) {
                        setError('ID comandă invalid');
                        setOrder(null);
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/orders/\"Id\"")];
                case 2:
                    response = _a.sent();
                    if (response.data && response.data.id) {
                        setOrder(response.data);
                        setSearchParams({ orderId: id });
                    }
                    else {
                        setError('Comandă negăsită');
                        setOrder(null);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error loading order:', err_1);
                    setError('Eroare la încărcarea comenzii. Verifică ID-ul și încearcă din nou.');
                    setOrder(null);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSearch = function (e) {
        e.preventDefault();
        if (orderId) {
            loadOrder(orderId);
        }
    };
    var handleDownloadPDF = function () {
        if (order) {
            window.open("/api/orders/".concat(order.id, "/receipt?lang=ro"), '_blank');
        }
    };
    var getStatusLabel = function (status) {
        var statusMap = {
            'PENDING': 'În așteptare',
            'CONFIRMED': 'Confirmată',
            'PREPARING': 'În pregătire',
            'READY': 'Gata pentru livrare',
            'ASSIGNED': 'Preluată de curier',
            'IN_TRANSIT': 'Curier în drum',
            'DELIVERED': 'Livrată',
            'CANCELLED': 'Anulată'
        };
        return statusMap[status] || status;
    };
    var getStatusIcon = function (status) {
        var iconMap = {
            'PENDING': '⏳',
            'CONFIRMED': '✅',
            'PREPARING': '👨‍🍳',
            'READY': '📦',
            'ASSIGNED': '🚴',
            'IN_TRANSIT': '🚚',
            'DELIVERED': '✓',
            'CANCELLED': '❌'
        };
        return iconMap[status] || '❓';
    };
    var getStatusColor = function (status) {
        var colorMap = {
            'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-300',
            'PREPARING': 'bg-orange-100 text-orange-800 border-orange-300',
            'READY': 'bg-purple-100 text-purple-800 border-purple-300',
            'ASSIGNED': 'bg-indigo-100 text-indigo-800 border-indigo-300',
            'IN_TRANSIT': 'bg-cyan-100 text-cyan-800 border-cyan-300',
            'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
            'CANCELLED': 'bg-red-100 text-red-800 border-red-300'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };
    return (<div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9] py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <i className="fas fa-search-location mr-2 text-[#FF6B35]"></i>"urmareste comanda ta"</h1>
          <p className="text-gray-600">"introdu numarul comenzii pentru a vedea statusul"</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-[15px] p-6 shadow-lg mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input type="text" value={orderId} onChange={function (e) { return setOrderId(e.target.value); }} placeholder="Introdu ID-ul comenzii (ex: 123)" className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"/>
            <button type="submit" disabled={loading || !orderId} className={"px-6 py-3 rounded-lg font-semibold transition-all ".concat(loading || !orderId
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]')}>
              {loading ? (<>
                  <i className="fas fa-spinner fa-spin mr-2"></i>"Caută..."</>) : (<>
                  <i className="fas fa-search mr-2"></i>
                  Caută
                </>)}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (<div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-800">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
          </div>)}

        {/* Order Details */}
        {order && (<div className="bg-white rounded-[15px] p-6 shadow-lg space-y-6">
            {/* Order Header */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  Comandă #{order.id}
                </h2>
                <span className={"px-4 py-2 rounded-full border-2 font-semibold ".concat(getStatusColor(order.status))}>
                  {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                </span>
              </div>
              {order.order_number && (<p className="text-sm text-gray-600">Număr comandă: {order.order_number}</p>)}
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Total</label>
                <div className="text-xl font-bold text-[#FF6B35]">{order.total.toFixed(2)} RON</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">"metoda plata"</label>
                <div className="text-lg font-semibold text-gray-800">
                  {order.payment_method === 'cash' ? (<>
                      <i className="fas fa-money-bill-wave mr-1"></i>
                      Cash {order.is_paid ? '(Achitată)' : '(Se achită la livrare)'}
                    </>) : (<>
                      <i className="fas fa-credit-card mr-1"></i>
                      Card {order.is_paid ? '(Achitată)' : '(Neachitată)'}
                    </>)}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Data comandă</label>
                <div className="text-gray-800">
                  {new Date(order.created_at).toLocaleString('ro-RO')}
                </div>
              </div>
              {order.paid_timestamp && (<div>
                  <label className="text-sm font-semibold text-gray-600">"achitata la"</label>
                  <div className="text-gray-800">
                    {new Date(order.paid_timestamp).toLocaleString('ro-RO')}
                  </div>
                </div>)}
            </div>

            {/* Customer Info */}
            {order.customer_name && (<div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Date client</h3>
                <div className="space-y-1 text-gray-700">
                  <div><i className="fas fa-user mr-2"></i>{order.customer_name}</div>
                  {order.customer_phone && (<div><i className="fas fa-phone mr-2"></i>{order.customer_phone}</div>)}
                  {order.delivery_address && (<div><i className="fas fa-map-marker-alt mr-2"></i>{order.delivery_address}</div>)}
                </div>
              </div>)}

            {/* FAZA 2.B - Live Tracking Map */}
            {order.type === "Delivery" && (order.delivery_lat && order.delivery_lng || order.delivery_address) && (<div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">"urmarire live"</h3>
                <TrackOrderMap_1.TrackOrderMap orderId={order.id} deliveryAddress={order.delivery_address} deliveryLat={order.delivery_lat} deliveryLng={order.delivery_lng} courierId={order.courier_id}/>
              </div>)}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-4 flex gap-3">
              <button onClick={handleDownloadPDF} className="flex-1 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition-all">
                <i className="fas fa-file-pdf mr-2"></i>"descarca dovada pdf"</button>
            </div>
          </div>)}

        {/* Empty State */}
        {!order && !loading && !error && (<div className="bg-white rounded-[15px] p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600">"introdu id ul comenzii pentru a vedea statusul"</p>
          </div>)}
      </div>
    </div>);
}
