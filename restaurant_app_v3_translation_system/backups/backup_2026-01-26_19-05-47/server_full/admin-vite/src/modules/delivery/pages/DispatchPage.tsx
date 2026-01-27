// import { useTranslation } from '@/i18n/I18nContext';
/**
 * 🚚 DISPATCH PAGE - Dispecerat Livrări
 * Inspirat din HorecaAI DeliveryManager
 * 3 coloane: Pregătite / În Livrare / Livrate Recent
 */

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { 
  List, Map, MapPin, Bike, Phone, Navigation, 
  Clock, CheckCircle, UserCircle, RefreshCw 
} from 'lucide-react';
import { DispatchMap } from './components/DispatchMap';
import './DispatchPage.css';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total: number;
  payment_method: string;
  created_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  courier_id: number | null;
  courier_name: string | null;
  status: string;
  platform?: string;
}

interface Courier {
  id: number;
  code: string;
  name: string;
  phone: string;
  vehicle_type: string;
  status: string;
  current_lat: number | null;
  current_lng: number | null;
  last_location_update?: string | null;
  active_count: number;
  rating: number;
}

interface LiveCourier {
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

export const DispatchPage = () => {
//   const { t } = useTranslation();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [availableCouriers, setAvailableCouriers] = useState<Courier[]>([]);
  const [liveCouriers, setLiveCouriers] = useState<LiveCourier[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [assigningOrderId, setAssigningOrderId] = useState<number | null>(null);

  // Filtrare comenzi pe categorii
  const pendingOrders = allOrders.filter(o => 
    !o.courier_id && (o.status === 'ready' || o.status === "Pending:" || o.status === 'completed')
  );
  const inTransitOrders = allOrders.filter(o => 
    o.status === 'picked_up' || o.status === "În Transit"
  );
  const deliveredOrders = allOrders.filter(o => 
    o.status === 'delivered'
  ).slice(0, 15); // Ultimele 15

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, couriersRes, liveRes] = await Promise.all([
        fetch('/api/couriers/dispatch/pending'),
        fetch('/api/couriers/dispatch/available'),
        fetch('/api/couriers/tracking/live'),
      ]);
      
      const ordersData = await ordersRes.json();
      const couriersData = await couriersRes.json();
      const liveData = await liveRes.json();
      
      if (ordersData.success) setAllOrders(ordersData.orders || []);
      if (couriersData.success) setAvailableCouriers(couriersData.couriers || []);
      if (liveData.success) setLiveCouriers(liveData.couriers || []);
    } catch (err) {
      console.error('Error loading dispatch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAssign = async (orderId: number, courierId: string) => {
    if (!courierId) return;
    
    setAssigningOrderId(orderId);
    try {
      const res = await fetch('/api/couriers/dispatch/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          courier_id: parseInt(courierId),
          delivery_fee: 10,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Eroare necunoscută' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(`❌ ${data.error || 'Eroare la atribuire'}`);
      }
    } catch (err: any) {
      console.error('Error assigning courier:', err);
      alert(`❌ ${err.message || 'Eroare la atribuire curier'}`);
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleFinishDelivery = async (orderId: number) => {
    try {
      const res = await fetch(`/api/couriers/delivery/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Eroare necunoscută' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(`❌ ${data.error || 'Eroare la finalizare livrare'}`);
      }
    } catch (err: any) {
      console.error('Error finishing delivery:', err);
      alert(`❌ ${err.message || 'Eroare la finalizare livrare'}`);
    }
  };

  const getVehicleIcon = (type: string) => {
    const icons: Record<string, string> = {
      scooter: '🛵', car: '🚗', bicycle: '🚴', motorcycle: '🏍️', walk: '🚶',
    };
    return icons[type] || '🚗';
  };

  const getPlatformIcon = (platform?: string) => {
    const icons: Record<string, string> = {
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

  const openNavigation = (address: string, app: 'google' | 'waze' = 'google') => {
    if (!address) return;
    if (app === 'waze') {
      window.open(`https://www.waze.com/ul?q=${encodeURIComponent(address)}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const callCustomer = (phone: string) => {
    if (phone) window.open(`tel:"Phone"`, '_self');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `${diffMins} min`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  if (loading) {
    return (
      <div className="dispatch-page">
        <PageHeader title="🚚 Dispatch" description="se incarca" />
        <div className="dispatch-loading">⏳ Se încarcă datele...</div>
      </div>
    );
  }

  return (
    <div className="dispatch-page" data-page-ready="true">
      {/* Header */}
      <div className="dispatch-header">
        <div className="dispatch-header-left">
          <h1><Bike size={28} />"dispecerat livrari"</h1>
          <p>"gestioneaza flota si statusul comenzilor"</p>
        </div>
        <div className="dispatch-header-right">
          <div className="view-toggle">
            <button 
              onClick={() => setViewMode('list')} 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={16} /> Lista
            </button>
            <button 
              onClick={() => setViewMode('map')} 
              className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            >
              <Map size={16} /> Harta Live
            </button>
          </div>
          <div className="couriers-online-badge">
            <span className="online-dot"></span>
            <span>{availableCouriers.filter(c => c.status === 'online').length} Șoferi Activi</span>
          </div>
          <button onClick={loadData} className="btn-refresh" title="reincarca datele">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* === LIST VIEW - 4 COLOANE (3 comenzi + 1 curieri) === */
        <div className="dispatch-columns">
          
          {/* COLOANA 0: Curieri Activi cu Locații */}
          <div className="dispatch-column column-couriers">
            <div className="column-header couriers">
              <h3><Bike size={16} />"curieri activi"</h3>
              <span className="column-count">{availableCouriers.filter(c => c.status === 'online').length}</span>
            </div>
            <div className="column-content">
              {availableCouriers.filter(c => c.status === 'online').length === 0 ? (
                <div className="column-empty">"niciun curier activ"</div>
              ) : (
                availableCouriers
                  .filter(c => c.status === 'online')
                  .map(courier => (
                    <div key={courier.id} className="courier-card">
                      <div className="courier-card-header">
                        <span className="courier-vehicle">{getVehicleIcon(courier.vehicle_type)}</span>
                        <span className="courier-name">{courier.name}</span>
                        <span className={`courier-status-badge ${courier.status}`}>
                          {courier.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                        </span>
                      </div>
                      
                      <div className="courier-card-body">
                        <div className="courier-row">
                          <Phone size={14} />
                          <span>{courier.phone || '-'}</span>
                        </div>
                        
                        {courier.current_lat && courier.current_lng ? (
                          <>
                            <div className="courier-row">
                              <MapPin size={14} />
                              <span className="courier-location">
                                📍 {courier.current_lat.toFixed(6)}, {courier.current_lng.toFixed(6)}
                              </span>
                            </div>
                            <div className="courier-nav-buttons">
                              <button 
                                onClick={() => window.open(`https://www.google.com/maps?q=${courier.current_lat},${courier.current_lng}`, '_blank')}
                                className="btn-nav btn-maps"
                                title="vezi pe harta"
                              >
                                <Map size={12} />"vezi pe harta"</button>
                            </div>
                          </>
                        ) : (
                          <div className="courier-row">
                            <MapPin size={14} />
                            <span className="courier-location-missing">📍 Locație indisponibilă</span>
                          </div>
                        )}
                        
                        {courier.active_count > 0 && (
                          <div className="courier-active-orders">
                            <span className="active-orders-badge">
                              {courier.active_count} {courier.active_count === 1 ? 'comandă activă' : 'comenzi active'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
          
          {/* COLOANA 1: Pregătite / În Așteptare */}
          <div className="dispatch-column column-pending">
            <div className="column-header pending">
              <h3><Clock size={16} /> Pregătite / În Așteptare</h3>
              <span className="column-count">{pendingOrders.length}</span>
            </div>
            <div className="column-content">
              {pendingOrders.length === 0 ? (
                <div className="column-empty">"nicio comanda in asteptare"</div>
              ) : (
                pendingOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-platform">{getPlatformIcon(order.platform)}</span>
                      <span className="order-number">#{order.order_number || order.id}</span>
                      <span className="order-time">{formatTime(order.created_at)}</span>
                    </div>
                    
                    <div className="order-card-body">
                      <div className="order-row">
                        <UserCircle size={14} />
                        <strong>{order.customer_name || 'Client'}</strong>
                      </div>
                      <div className="order-row">
                        <MapPin size={14} />
                        <span className="order-address">{order.delivery_address || 'Adresă nespecificată'}</span>
                      </div>
                      <div className="order-row">
                        <Phone size={14} />
                        <span>{order.customer_phone || '-'}</span>
                        {order.customer_phone && (
                          <button 
                            onClick={() => callCustomer(order.customer_phone)}
                            className="btn-icon btn-call"
                            title="suna clientul"
                          >
                            <Phone size={12} />
                          </button>
                        )}
                      </div>
                      
                      {/* Butoane navigație */}
                      <div className="order-nav-buttons">
                        <button 
                          onClick={() => openNavigation(order.delivery_address, 'google')}
                          className="btn-nav btn-maps"
                          title="Google Maps"
                        >
                          <Navigation size={12} /> Maps
                        </button>
                        <button 
                          onClick={() => openNavigation(order.delivery_address, 'waze')}
                          className="btn-nav btn-waze"
                          title="Waze"
                        >
                          <Navigation size={12} /> Waze
                        </button>
                      </div>
                    </div>
                    
                    <div className="order-card-footer">
                      <span className="order-total">{order.total?.toFixed(2)} RON</span>
                      <span className={`payment-badge ${order.payment_method}`}>
                        {order.payment_method === 'cash' ? '💵 Cash' : '💳 Card'}
                      </span>
                    </div>
                    
                    {/* Dropdown Alocare Șofer */}
                    <div className="order-assign">
                      <label htmlFor={`assign-${order.id}`}>"aloca sofer"</label>
                      <select 
                        id={`assign-${order.id}`}
                        onChange={(e) => handleAssign(order.id, e.target.value)}
                        defaultValue=""
                        disabled={assigningOrderId === order.id}
                        title="selecteaza un curier pentru aceasta comanda"
                      >
                        <option value="" disabled>-- Selectează --</option>
                        {availableCouriers.map(c => (
                          <option key={c.id} value={c.id}>
                            {getVehicleIcon(c.vehicle_type)} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLOANA 2: În Livrare */}
          <div className="dispatch-column column-transit">
            <div className="column-header transit">
              <h3><Navigation size={16} />"in livrare"</h3>
              <span className="column-count">{inTransitOrders.length}</span>
            </div>
            <div className="column-content">
              {inTransitOrders.length === 0 ? (
                <div className="column-empty">"nicio livrare activa"</div>
              ) : (
                inTransitOrders.map(order => (
                  <div key={order.id} className="order-card in-transit">
                    <div className="order-card-header">
                      <span className="order-platform">{getPlatformIcon(order.platform)}</span>
                      <span className="order-number">#{order.order_number || order.id}</span>
                      {order.courier_name && (
                        <span className="courier-badge">
                          <Bike size={12} /> {order.courier_name}
                        </span>
                      )}
                    </div>
                    
                    <div className="order-card-body">
                      <div className="order-row">
                        <MapPin size={14} />
                        <span className="order-address">{order.delivery_address}</span>
                      </div>
                      
                      {/* Butoane acțiuni */}
                      <div className="order-nav-buttons">
                        <button 
                          onClick={() => callCustomer(order.customer_phone)}
                          className="btn-nav btn-call-full"
                        >
                          <Phone size={12} />"Sună"</button>
                        <button 
                          onClick={() => openNavigation(order.delivery_address, 'google')}
                          className="btn-nav btn-maps"
                        >
                          <Navigation size={12} /> Maps
                        </button>
                        <button 
                          onClick={() => openNavigation(order.delivery_address, 'waze')}
                          className="btn-nav btn-waze"
                        >
                          <Navigation size={12} /> Waze
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleFinishDelivery(order.id)}
                      className="btn-finish-delivery"
                    >
                      <CheckCircle size={16} />"finalizeaza livrarea"</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLOANA 3: Livrate Recent */}
          <div className="dispatch-column column-delivered">
            <div className="column-header delivered">
              <h3><CheckCircle size={16} /> Livrate Recent</h3>
              <span className="column-count">{deliveredOrders.length}</span>
            </div>
            <div className="column-content">
              {deliveredOrders.length === 0 ? (
                <div className="column-empty">"nicio livrare finalizata"</div>
              ) : (
                deliveredOrders.map(order => (
                  <div key={order.id} className="order-card delivered">
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
                      <CheckCircle size={14} /> OK
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* === MAP VIEW === */
        <div className="dispatch-map-view">
          <div className="map-container">
            <DispatchMap
              couriers={liveCouriers}
              pendingOrders={pendingOrders}
              inTransitOrders={inTransitOrders}
              restaurantLat={parseFloat(import.meta.env.VITE_RESTAURANT_LAT || '44.40535')}
              restaurantLng={parseFloat(import.meta.env.VITE_RESTAURANT_LNG || '25.99008')}
            />
            
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
        </div>
      )}
    </div>
  );
};

export default DispatchPage;



