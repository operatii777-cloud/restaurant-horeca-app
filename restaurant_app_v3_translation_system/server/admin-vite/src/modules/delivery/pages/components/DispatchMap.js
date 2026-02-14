"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.A - Dispatch Map Component
 *
 * Leaflet map showing:
 * - Restaurant HQ marker
 * - Courier markers (live positions)
 * - Order markers (pending/in-transit)
 * - Route previews (optional)
 */
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
exports.DispatchMap = DispatchMap;
var react_1 = require("react");
var react_leaflet_1 = require("react-leaflet");
var leaflet_1 = require("leaflet");
require("leaflet/dist/leaflet.css");
// Fix for default markers in react-leaflet
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
        html: "<div style=\"\n      background-color: ".concat(color, ";\n      width: 32px;\n      height: 32px;\n      border-radius: 50%;\n      border: 3px solid white;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-size: 16px;\n      color: white;\n      font-weight: bold;\n    \">").concat(iconChar, "</div>"),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};
// Component to auto-fit map bounds
function MapBounds(_a) {
    var couriers = _a.couriers, orders = _a.orders, restaurantLat = _a.restaurantLat, restaurantLng = _a.restaurantLng;
    //   const { t } = useTranslation();
    var map = (0, react_leaflet_1.useMap)();
    (0, react_1.useEffect)(function () {
        var bounds = [];
        // Add restaurant
        if (restaurantLat && restaurantLng) {
            bounds.push([restaurantLat, restaurantLng]);
        }
        // Add couriers
        couriers.forEach(function (courier) {
            if (courier.current_lat && courier.current_lng) {
                bounds.push([courier.current_lat, courier.current_lng]);
            }
        });
        // Add orders with coordinates
        orders.forEach(function (order) {
            if (order.delivery_lat && order.delivery_lng) {
                bounds.push([order.delivery_lat, order.delivery_lng]);
            }
        });
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, couriers, orders, restaurantLat, restaurantLng]);
    return null;
}
function DispatchMap(_a) {
    var couriers = _a.couriers, pendingOrders = _a.pendingOrders, inTransitOrders = _a.inTransitOrders, _b = _a.restaurantLat, restaurantLat = _b === void 0 ? 44.40535 : _b, // Prelungirea Ghencea 45, Bragadiru
    _c = _a.restaurantLng, // Prelungirea Ghencea 45, Bragadiru
    restaurantLng = _c === void 0 ? 25.99008 : _c;
    //   const { t } = useTranslation();
    var mapRef = (0, react_1.useRef)(null);
    // Combine all orders
    var allOrders = __spreadArray(__spreadArray([], pendingOrders, true), inTransitOrders, true);
    return (<div className="dispatch-map-container" style={{ height: '600px', width: '100%' }}>
      <react_leaflet_1.MapContainer center={[restaurantLat, restaurantLng]} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
        <react_leaflet_1.TileLayer attribution={"&copy; <a href=\"https://www.openstreetmap.org/copyright\">\"OpenStreetMap\"</a> contributors"} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

        {/* Auto-fit bounds */}
        <MapBounds couriers={couriers} orders={allOrders} restaurantLat={restaurantLat} restaurantLng={restaurantLng}/>

        {/* Restaurant HQ Marker */}
        <react_leaflet_1.Marker position={[restaurantLat, restaurantLng]} icon={createCustomIcon('#FF6B35', '🏪')}>
          <react_leaflet_1.Popup>
            <div>
              <strong>"restaurant hq"</strong>
              <br />
              <small>Prelungirea Ghencea 45, Bragadiru</small>
            </div>
          </react_leaflet_1.Popup>
        </react_leaflet_1.Marker>

        {/* Courier Markers */}
        {couriers
            .filter(function (c) { return c.current_lat && c.current_lng; })
            .map(function (courier) { return (<react_leaflet_1.Marker key={courier.id} position={[courier.current_lat, courier.current_lng]} icon={createCustomIcon('#10B981', '🚴')}>
              <react_leaflet_1.Popup>
                <div>
                  <strong>{courier.name}</strong> ({courier.code})
                  <br />
                  <small>Status: {courier.status}</small>
                  {courier.order_number && (<>
                      <br />
                      <small>Comandă: #{courier.order_number}</small>
                    </>)}
                </div>
              </react_leaflet_1.Popup>
            </react_leaflet_1.Marker>); })}

        {/* Order Markers - Pending */}
        {pendingOrders
            .filter(function (o) { return o.delivery_lat && o.delivery_lng; })
            .map(function (order) { return (<react_leaflet_1.Marker key={"pending-".concat(order.id)} position={[order.delivery_lat, order.delivery_lng]} icon={createCustomIcon('#3B82F6', '📦')}>
              <react_leaflet_1.Popup>
                <div>
                  <strong>Comandă #{order.order_number || order.id}</strong>
                  <br />
                  <small>{order.customer_name}</small>
                  <br />
                  <small>{order.delivery_address}</small>
                  <br />
                  <small className="text-blue-600">"status pregatita"</small>
                </div>
              </react_leaflet_1.Popup>
            </react_leaflet_1.Marker>); })}

        {/* Order Markers - In Transit */}
        {inTransitOrders
            .filter(function (o) { return o.delivery_lat && o.delivery_lng; })
            .map(function (order) { return (<react_leaflet_1.Marker key={"transit-".concat(order.id)} position={[order.delivery_lat, order.delivery_lng]} icon={createCustomIcon('#F59E0B', '🚚')}>
              <react_leaflet_1.Popup>
                <div>
                  <strong>Comandă #{order.order_number || order.id}</strong>
                  <br />
                  <small>{order.customer_name}</small>
                  <br />
                  <small>{order.delivery_address}</small>
                  <br />
                  <small className="text-orange-600">"status in livrare"</small>
                  {order.courier_name && (<>
                      <br />
                      <small>Curier: {order.courier_name}</small>
                    </>)}
                </div>
              </react_leaflet_1.Popup>
            </react_leaflet_1.Marker>); })}

        {/* Route Preview - Restaurant to Order (for pending orders) */}
        {pendingOrders
            .filter(function (o) { return o.delivery_lat && o.delivery_lng; })
            .map(function (order) { return (<react_leaflet_1.Polyline key={"route-pending-".concat(order.id)} positions={[
                [restaurantLat, restaurantLng],
                [order.delivery_lat, order.delivery_lng],
            ]} color="#3B82F6" weight={2} opacity={0.5} dashArray="5, 5"/>); })}

        {/* Route Preview - Restaurant to Order (for in-transit orders) */}
        {inTransitOrders
            .filter(function (o) { return o.delivery_lat && o.delivery_lng; })
            .map(function (order) { return (<react_leaflet_1.Polyline key={"route-transit-".concat(order.id)} positions={[
                [restaurantLat, restaurantLng],
                [order.delivery_lat, order.delivery_lng],
            ]} color="#F59E0B" weight={3} opacity={0.7}/>); })}
      </react_leaflet_1.MapContainer>
    </div>);
}
