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

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const createCustomIcon = (color: string, iconChar: string) => {
  //   const { t } = useTranslation();
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
      font-weight: bold;
    ">${iconChar}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface Courier {
  id: number;
  code: string;
  name: string;
  status: string;
  current_lat: number;
  current_lng: number;
  delivery_id: number | null;
  delivery_address: string | null;
  delivery_status: string | null;
  order_number: string | null;
  customer_name: string | null;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total: number;
  status: string;
  courier_id: number | null;
  courier_name: string | null;
  delivery_lat?: number;
  delivery_lng?: number;
}

interface DispatchMapProps {
  couriers: Courier[];
  pendingOrders: Order[];
  inTransitOrders: Order[];
  restaurantLat?: number;
  restaurantLng?: number;
}

// Component to auto-fit map bounds
function MapBounds({ couriers, orders, restaurantLat, restaurantLng }: {
  couriers: Courier[];
  orders: Order[];
  restaurantLat?: number;
  restaurantLng?: number;
}) {
  //   const { t } = useTranslation();
  const map = useMap();

  useEffect(() => {
    const bounds: L.LatLngExpression[] = [];

    // Add restaurant
    if (restaurantLat && restaurantLng) {
      bounds.push([restaurantLat, restaurantLng]);
    }

    // Add couriers
    couriers.forEach(courier => {
      if (courier.current_lat && courier.current_lng) {
        bounds.push([courier.current_lat, courier.current_lng]);
      }
    });

    // Add orders with coordinates
    orders.forEach(order => {
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

export function DispatchMap({
  couriers,
  pendingOrders,
  inTransitOrders,
  restaurantLat = 44.40535, // Prelungirea Ghencea 45, Bragadiru
  restaurantLng = 25.99008,
}: DispatchMapProps) {
  //   const { t } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);

  // Combine all orders
  const allOrders = [...pendingOrders, ...inTransitOrders];

  return (
    <div className="dispatch-map-container" style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={[restaurantLat, restaurantLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">"OpenStreetMap"</a> contributors`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit bounds */}
        <MapBounds
          couriers={couriers}
          orders={allOrders}
          restaurantLat={restaurantLat}
          restaurantLng={restaurantLng}
        />

        {/* Restaurant HQ Marker */}
        <Marker
          position={[restaurantLat, restaurantLng]}
          icon={createCustomIcon('#FF6B35', '🏪')}
        >
          <Popup>
            <div>
              <strong>"restaurant hq"</strong>
              <br />
              <small>Prelungirea Ghencea 45, Bragadiru</small>
            </div>
          </Popup>
        </Marker>

        {/* Courier Markers */}
        {couriers
          .filter(c => c.current_lat && c.current_lng)
          .map((courier) => (
            <Marker
              key={courier.id}
              position={[courier.current_lat, courier.current_lng]}
              icon={createCustomIcon('#10B981', '🚴')}
            >
              <Popup>
                <div>
                  <strong>{courier.name}</strong> ({courier.code})
                  <br />
                  <small>Status: {courier.status}</small>
                  {courier.order_number && (
                    <>
                      <br />
                      <small>Comandă: #{courier.order_number}</small>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Order Markers - Pending */}
        {pendingOrders
          .filter(o => o.delivery_lat && o.delivery_lng)
          .map((order) => (
            <Marker
              key={`pending-${order.id}`}
              position={[order.delivery_lat!, order.delivery_lng!]}
              icon={createCustomIcon('#3B82F6', '📦')}
            >
              <Popup>
                <div>
                  <strong>Comandă #{order.order_number || order.id}</strong>
                  <br />
                  <small>{order.customer_name}</small>
                  <br />
                  <small>{order.delivery_address}</small>
                  <br />
                  <small className="text-blue-600">"status pregatita"</small>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Order Markers - In Transit */}
        {inTransitOrders
          .filter(o => o.delivery_lat && o.delivery_lng)
          .map((order) => (
            <Marker
              key={`transit-${order.id}`}
              position={[order.delivery_lat!, order.delivery_lng!]}
              icon={createCustomIcon('#F59E0B', '🚚')}
            >
              <Popup>
                <div>
                  <strong>Comandă #{order.order_number || order.id}</strong>
                  <br />
                  <small>{order.customer_name}</small>
                  <br />
                  <small>{order.delivery_address}</small>
                  <br />
                  <small className="text-orange-600">"status in livrare"</small>
                  {order.courier_name && (
                    <>
                      <br />
                      <small>Curier: {order.courier_name}</small>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Route Preview - Restaurant to Order (for pending orders) */}
        {pendingOrders
          .filter(o => o.delivery_lat && o.delivery_lng)
          .map((order) => (
            <Polyline
              key={`route-pending-${order.id}`}
              positions={[
                [restaurantLat, restaurantLng],
                [order.delivery_lat!, order.delivery_lng!],
              ]}
              color="#3B82F6"
              weight={2}
              opacity={0.5}
              dashArray="5, 5"
            />
          ))}

        {/* Route Preview - Restaurant to Order (for in-transit orders) */}
        {inTransitOrders
          .filter(o => o.delivery_lat && o.delivery_lng)
          .map((order) => (
            <Polyline
              key={`route-transit-${order.id}`}
              positions={[
                [restaurantLat, restaurantLng],
                [order.delivery_lat!, order.delivery_lng!],
              ]}
              color="#F59E0B"
              weight={3}
              opacity={0.7}
            />
          ))}
      </MapContainer>
    </div>
  );
}




