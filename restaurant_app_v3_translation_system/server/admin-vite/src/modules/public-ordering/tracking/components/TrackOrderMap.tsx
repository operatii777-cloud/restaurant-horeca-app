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

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
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
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      font-weight: bold;
    ">${iconChar}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

interface TrackOrderMapProps {
  orderId: number;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  courierId?: number | null;
  restaurantLat?: number;
  restaurantLng?: number;
}

// Component to auto-fit map bounds
function MapBounds({ deliveryLat, deliveryLng, courierLat, courierLng, restaurantLat, restaurantLng }: {
  deliveryLat?: number;
  deliveryLng?: number;
  courierLat?: number;
  courierLng?: number;
  restaurantLat?: number;
  restaurantLng?: number;
}) {
  //   const { t } = useTranslation();
  const map = useMap();

  useEffect(() => {
    const bounds: L.LatLngExpression[] = [];

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

export function TrackOrderMap({
  orderId,
  deliveryAddress,
  deliveryLat,
  deliveryLng,
  courierId,
  restaurantLat = 44.40535,
  restaurantLng = 25.99008,
}: TrackOrderMapProps) {
  //   const { t } = useTranslation();
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load courier location and ETA
  useEffect(() => {
    if (!courierId || !deliveryLat || !deliveryLng) return;

    const fetchCourierLocation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/couriers/${courierId}/location`);
        const data = await response.json();

        if (data.success && data.lat && data.lng) {
          setCourierLocation({ lat: data.lat, lng: data.lng });

          // Calculate ETA using tracking endpoint
          const trackingResponse = await fetch(`/api/orders/${orderId}/tracking`);
          const trackingData = await trackingResponse.json();
          if (trackingData.success && trackingData.data?.etaMinutes) {
            setEta(trackingData.data.etaMinutes);
          }
        }
      } catch (err) {
        console.error('Error fetching courier location:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourierLocation();
    const interval = setInterval(fetchCourierLocation, 20000); // Refresh every 20 seconds
    return () => clearInterval(interval);
  }, [courierId, deliveryLat, deliveryLng, orderId]);

  // Center map on delivery address or restaurant
  const centerLat = deliveryLat || restaurantLat;
  const centerLng = deliveryLng || restaurantLng;

  if (!centerLat || !centerLng) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">"adresa de livrare nu are coordonate"</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">"OpenStreetMap"</a> contributors`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds
          deliveryLat={deliveryLat}
          deliveryLng={deliveryLng}
          courierLat={courierLocation?.lat}
          courierLng={courierLocation?.lng}
          restaurantLat={restaurantLat}
          restaurantLng={restaurantLng}
        />

        {/* Restaurant Marker */}
        <Marker
          position={[restaurantLat, restaurantLng]}
          icon={createCustomIcon('#FF6B35', '🏪')}
        >
          <Popup>
            <div>
              <strong>"Restaurant"</strong>
              <br />
              <small>Prelungirea Ghencea 45, Bragadiru</small>
            </div>
          </Popup>
        </Marker>

        {/* Delivery Address Marker */}
        {deliveryLat && deliveryLng && (
          <Marker
            position={[deliveryLat, deliveryLng]}
            icon={createCustomIcon('#3B82F6', '📍')}
          >
            <Popup>
              <div>
                <strong>"adresa livrare"</strong>
                <br />
                <small>{deliveryAddress || 'Adresă necunoscută'}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Courier Live Position */}
        {courierLocation && (
          <Marker
            position={[courierLocation.lat, courierLocation.lng]}
            icon={createCustomIcon('#10B981', '🚴')}
          >
            <Popup>
              <div>
                <strong>Curier</strong>
                <br />
                {eta && (
                  <>
                    <small>ETA: ~{eta} minute</small>
                    <br />
                  </>
                )}
                <small>"pozitie live"</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route from Restaurant to Delivery */}
        {deliveryLat && deliveryLng && (
          <Polyline
            positions={[
              [restaurantLat, restaurantLng],
              [deliveryLat, deliveryLng],
            ]}
            color="#3B82F6"
            weight={3}
            opacity={0.6}
            dashArray="10, 5"
          />
        )}

        {/* Route from Courier to Delivery (if courier is assigned) */}
        {courierLocation && deliveryLat && deliveryLng && (
          <Polyline
            positions={[
              [courierLocation.lat, courierLocation.lng],
              [deliveryLat, deliveryLng],
            ]}
            color="#10B981"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>

      {/* ETA Display */}
      {eta !== null && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border-2 border-[#10B981]">
          <div className="text-sm font-semibold text-gray-700">Timp estimat</div>
          <div className="text-2xl font-bold text-[#10B981]">~{eta} min</div>
        </div>
      )}
    </div>
  );
}




