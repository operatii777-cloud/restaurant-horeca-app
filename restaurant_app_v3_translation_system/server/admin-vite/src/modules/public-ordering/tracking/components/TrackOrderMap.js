"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.B - Track Order Map Component
 *
 * Leaflet map showing:
 * - Order delivery address marker
 * - Courier live position (if assigned)
 * - ETA display
 * - Real-time updates
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
exports.TrackOrderMap = TrackOrderMap;
var react_1 = require("react");
var react_leaflet_1 = require("react-leaflet");
var leaflet_1 = require("leaflet");
require("leaflet/dist/leaflet.css");
// Fix for default markers
var marker_icon_png_1 = require("leaflet/dist/images/marker-icon.png");
var marker_shadow_png_1 = require("leaflet/dist/images/marker-shadow.png");
var marker_icon_2x_png_1 = require("leaflet/dist/images/marker-icon-2x.png");
var DefaultIcon = leaflet_1.default.icon({
    iconUrl: marker_icon_png_1.default,
    shadowUrl: marker_shadow_png_1.default,
    iconRetinaUrl: marker_icon_2x_png_1.default,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
leaflet_1.default.Marker.prototype.options.icon = DefaultIcon;
// Custom icons
var createCustomIcon = function (color, iconChar) {
    //   const { t } = useTranslation();
    return leaflet_1.default.divIcon({
        className: 'custom-marker',
        html: "<div style=\"\n      background-color: ".concat(color, ";\n      width: 36px;\n      height: 36px;\n      border-radius: 50%;\n      border: 3px solid white;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-size: 18px;\n      color: white;\n      font-weight: bold;\n    \">").concat(iconChar, "</div>"),
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};
// Component to auto-fit map bounds
function MapBounds(_a) {
    var deliveryLat = _a.deliveryLat, deliveryLng = _a.deliveryLng, courierLat = _a.courierLat, courierLng = _a.courierLng, restaurantLat = _a.restaurantLat, restaurantLng = _a.restaurantLng;
    //   const { t } = useTranslation();
    var map = (0, react_leaflet_1.useMap)();
    (0, react_1.useEffect)(function () {
        var bounds = [];
        if (deliveryLat && deliveryLng) {
            bounds.push([deliveryLat, deliveryLng]);
        }
        if (courierLat && courierLng) {
            bounds.push([courierLat, courierLng]);
        }
        if (restaurantLat && restaurantLng) {
            bounds.push([restaurantLat, restaurantLng]);
        }
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, deliveryLat, deliveryLng, courierLat, courierLng, restaurantLat, restaurantLng]);
    return null;
}
function TrackOrderMap(_a) {
    var _this = this;
    var orderId = _a.orderId, deliveryAddress = _a.deliveryAddress, deliveryLat = _a.deliveryLat, deliveryLng = _a.deliveryLng, courierId = _a.courierId, _b = _a.restaurantLat, restaurantLat = _b === void 0 ? 44.40535 : _b, _c = _a.restaurantLng, restaurantLng = _c === void 0 ? 25.99008 : _c;
    //   const { t } = useTranslation();
    var _d = (0, react_1.useState)(null), courierLocation = _d[0], setCourierLocation = _d[1];
    var _e = (0, react_1.useState)(null), eta = _e[0], setEta = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    // Load courier location and ETA
    (0, react_1.useEffect)(function () {
        if (!courierId || !deliveryLat || !deliveryLng)
            return;
        var fetchCourierLocation = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, trackingResponse, trackingData, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, 7, 8]);
                        setLoading(true);
                        return [4 /*yield*/, fetch("/api/couriers/".concat(courierId, "/location"))];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        if (!(data.success && data.lat && data.lng)) return [3 /*break*/, 5];
                        setCourierLocation({ lat: data.lat, lng: data.lng });
                        return [4 /*yield*/, fetch("/api/orders/".concat(orderId, "/tracking"))];
                    case 3:
                        trackingResponse = _b.sent();
                        return [4 /*yield*/, trackingResponse.json()];
                    case 4:
                        trackingData = _b.sent();
                        if (trackingData.success && ((_a = trackingData.data) === null || _a === void 0 ? void 0 : _a.etaMinutes)) {
                            setEta(trackingData.data.etaMinutes);
                        }
                        _b.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        err_1 = _b.sent();
                        console.error('Error fetching courier location:', err_1);
                        return [3 /*break*/, 8];
                    case 7:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        fetchCourierLocation();
        var interval = setInterval(fetchCourierLocation, 20000); // Refresh every 20 seconds
        return function () { return clearInterval(interval); };
    }, [courierId, deliveryLat, deliveryLng, orderId]);
    // Center map on delivery address or restaurant
    var centerLat = deliveryLat || restaurantLat;
    var centerLng = deliveryLng || restaurantLng;
    if (!centerLat || !centerLng) {
        return (<div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">"adresa de livrare nu are coordonate"</p>
      </div>);
    }
    return (<div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300">
      <react_leaflet_1.MapContainer center={[centerLat, centerLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <react_leaflet_1.TileLayer attribution={"&copy; <a href=\"https://www.openstreetmap.org/copyright\">\"OpenStreetMap\"</a> contributors"} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

        <MapBounds deliveryLat={deliveryLat} deliveryLng={deliveryLng} courierLat={courierLocation === null || courierLocation === void 0 ? void 0 : courierLocation.lat} courierLng={courierLocation === null || courierLocation === void 0 ? void 0 : courierLocation.lng} restaurantLat={restaurantLat} restaurantLng={restaurantLng}/>

        {/* Restaurant Marker */}
        <react_leaflet_1.Marker position={[restaurantLat, restaurantLng]} icon={createCustomIcon('#FF6B35', '🏪')}>
          <react_leaflet_1.Popup>
            <div>
              <strong>"Restaurant"</strong>
              <br />
              <small>Prelungirea Ghencea 45, Bragadiru</small>
            </div>
          </react_leaflet_1.Popup>
        </react_leaflet_1.Marker>

        {/* Delivery Address Marker */}
        {deliveryLat && deliveryLng && (<react_leaflet_1.Marker position={[deliveryLat, deliveryLng]} icon={createCustomIcon('#3B82F6', '📍')}>
            <react_leaflet_1.Popup>
              <div>
                <strong>"adresa livrare"</strong>
                <br />
                <small>{deliveryAddress || 'Adresă necunoscută'}</small>
              </div>
            </react_leaflet_1.Popup>
          </react_leaflet_1.Marker>)}

        {/* Courier Live Position */}
        {courierLocation && (<react_leaflet_1.Marker position={[courierLocation.lat, courierLocation.lng]} icon={createCustomIcon('#10B981', '🚴')}>
            <react_leaflet_1.Popup>
              <div>
                <strong>Curier</strong>
                <br />
                {eta && (<>
                    <small>ETA: ~{eta} minute</small>
                    <br />
                  </>)}
                <small>"pozitie live"</small>
              </div>
            </react_leaflet_1.Popup>
          </react_leaflet_1.Marker>)}

        {/* Route from Restaurant to Delivery */}
        {deliveryLat && deliveryLng && (<react_leaflet_1.Polyline positions={[
                [restaurantLat, restaurantLng],
                [deliveryLat, deliveryLng],
            ]} color="#3B82F6" weight={3} opacity={0.6} dashArray="10, 5"/>)}

        {/* Route from Courier to Delivery (if courier is assigned) */}
        {courierLocation && deliveryLat && deliveryLng && (<react_leaflet_1.Polyline positions={[
                [courierLocation.lat, courierLocation.lng],
                [deliveryLat, deliveryLng],
            ]} color="#10B981" weight={4} opacity={0.8}/>)}
      </react_leaflet_1.MapContainer>

      {/* ETA Display */}
      {eta !== null && (<div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border-2 border-[#10B981]">
          <div className="text-sm font-semibold text-gray-700">Timp estimat</div>
          <div className="text-2xl font-bold text-[#10B981]">~{eta} min</div>
        </div>)}
    </div>);
}
