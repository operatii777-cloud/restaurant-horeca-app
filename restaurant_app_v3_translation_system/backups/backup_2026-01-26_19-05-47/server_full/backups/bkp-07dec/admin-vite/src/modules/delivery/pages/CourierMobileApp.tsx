/**
 * 📱 COURIER MOBILE APP - PWA optimizat pentru telefon
 * Inspirat din HorecaAI DriverView
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Phone, CheckCircle, Package, MapPin, RefreshCw, 
  Bike, X, History, ArrowLeft, Clock, DollarSign 
} from 'lucide-react';
import { getApiUrl } from '@/utils/serverConfig';
import './CourierMobileApp.css';

interface DeliveryOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total: number;
  status: string;
  created_at: string;
  picked_up_at?: string;
  delivered_at?: string;
}

export const CourierMobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [myOrders, setMyOrders] = useState<DeliveryOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [courierId, setCourierId] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Get courier ID from localStorage or URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('courier_id') || localStorage.getItem('courier_id');
    if (id) {
      setCourierId(parseInt(id));
      localStorage.setItem('courier_id', id);
    }
  }, []);

  const refreshOrders = async () => {
    if (!courierId) return;
    
    setIsRefreshing(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/couriers/${courierId}/deliveries?status=assigned,picked_up`);
      const data = await res.json();
      if (data.success) {
        setMyOrders(data.deliveries || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    refreshOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshOrders, 30000);
    return () => clearInterval(interval);
  }, [courierId]);

  const activeDeliveries = myOrders.filter(o => o.status === 'assigned' || o.status === 'picked_up');
  const historyDeliveries = myOrders.filter(o => o.status === 'delivered');

  const calculateEarnings = () => {
    const deliveryFee = 15; // RON per delivery
    return historyDeliveries.length * deliveryFee;
  };

  const handleAction = async (order: DeliveryOrder) => {
    if (order.status === 'assigned') {
      // Preia comanda
      if (confirm('Preiei comanda și pleci spre client?')) {
        await updateDeliveryStatus(order.id, 'picked_up');
      }
    } else if (order.status === 'picked_up') {
      // Confirmă livrare cu semnătură
      setSelectedOrder(order);
      setShowSignaturePad(true);
    }
  };

  const updateDeliveryStatus = async (deliveryId: number, status: string) => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/couriers/delivery/${deliveryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        refreshOrders();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const confirmDelivery = async () => {
    if (!selectedOrder) return;
    
    const canvas = canvasRef.current;
    const signature = canvas ? canvas.toDataURL() : '';
    
    try {
      await updateDeliveryStatus(selectedOrder.id, 'delivered');
      setShowSignaturePad(false);
      setSelectedOrder(null);
      // Clear canvas
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openNavigation = (address: string, app: 'google' | 'waze' = 'google') => {
    if (app === 'waze') {
      const wazeUrl = `https://www.waze.com/ul?q=${encodeURIComponent(address)}`;
      window.open(wazeUrl, '_blank');
    } else {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!courierId) {
    return (
      <div className="courier-mobile-login">
        <div className="courier-mobile-login__card">
          <Bike size={48} className="courier-mobile-login__icon" />
          <h2>Mod Curier</h2>
          <p>Introdu ID-ul tău de curier pentru a continua</p>
          <input
            type="number"
            placeholder="ID Curier"
            className="courier-mobile-login__input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                if (value) {
                  setCourierId(parseInt(value));
                  localStorage.setItem('courier_id', value);
                }
              }
            }}
          />
          <button 
            onClick={() => window.location.href = '/couriers'}
            className="courier-mobile-login__link"
          >
            Vezi lista curieri →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="courier-mobile-app">
      {/* Header */}
      <div className="courier-mobile-header">
        <div className="courier-mobile-header__user">
          <div className="courier-mobile-header__avatar">
            <Bike size={24} />
          </div>
          <div className="courier-mobile-header__info">
            <h2 className="courier-mobile-header__name">Curier #{courierId}</h2>
            <span className="courier-mobile-header__status">
              <span className="status-dot"></span> Online
            </span>
          </div>
        </div>
        <div className="courier-mobile-header__actions">
          <button 
            onClick={refreshOrders} 
            className={`btn-refresh ${isRefreshing ? 'rotating' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} />
          </button>
          <div className="courier-mobile-header__earnings">
            <span className="earnings-label">Câștig Azi</span>
            <span className="earnings-value">{calculateEarnings()} RON</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="courier-mobile-tabs">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`courier-mobile-tab ${activeTab === 'active' ? 'active' : ''}`}
        >
          <Bike size={16} /> Active ({activeDeliveries.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`courier-mobile-tab ${activeTab === 'history' ? 'active' : ''}`}
        >
          <History size={16} /> Istoric ({historyDeliveries.length})
        </button>
      </div>

      {/* Content */}
      <div className="courier-mobile-content">
        {activeTab === 'active' ? (
          activeDeliveries.length === 0 ? (
            <div className="courier-mobile-empty">
              <Package size={48} />
              <p>Nicio livrare activă</p>
            </div>
          ) : (
            <div className="courier-mobile-orders">
              {activeDeliveries.map(order => (
                <div key={order.id} className="courier-order-card">
                  <div className="courier-order-header">
                    <div>
                      <span className="courier-order-id">#{order.order_number || order.id}</span>
                      <h3 className="courier-order-customer">{order.customer_name}</h3>
                    </div>
                    <div className="courier-order-total">
                      <div className="total-value">{order.total} RON</div>
                      <div className="total-status">
                        {order.status === 'picked_up' ? 'În Transit' : 'Pregătit'}
                      </div>
                    </div>
                  </div>

                  <div className="courier-order-details">
                    <div className="detail-row">
                      <MapPin size={16} />
                      <span>{order.delivery_address}</span>
                    </div>
                    <div className="courier-order-actions">
                      <button 
                        onClick={() => window.open(`tel:${order.customer_phone}`, '_self')}
                        className="action-btn action-btn--call"
                      >
                        <Phone size={14} /> Sună
                      </button>
                      <button 
                        onClick={() => openNavigation(order.delivery_address, 'google')}
                        className="action-btn action-btn--maps"
                      >
                        <Navigation size={14} /> Maps
                      </button>
                      <button 
                        onClick={() => openNavigation(order.delivery_address, 'waze')}
                        className="action-btn action-btn--waze"
                      >
                        <Navigation size={14} /> Waze
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAction(order)}
                    className={`courier-order-action ${order.status === 'picked_up' ? 'action--confirm' : 'action--pickup'}`}
                  >
                    {order.status === 'picked_up' ? (
                      <><CheckCircle size={20} /> CONFIRMĂ LIVRAREA (POD)</>
                    ) : (
                      <><Package size={20} /> PREIA COMANDA</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="courier-mobile-history">
            {historyDeliveries.slice(0, 20).map(order => (
              <div key={order.id} className="courier-history-item">
                <div>
                  <div className="history-id">Livrare #{order.order_number || order.id}</div>
                  <div className="history-time">{new Date(order.delivered_at!).toLocaleTimeString('ro-RO')}</div>
                </div>
                <div className="history-earnings">
                  <DollarSign size={14} />
                  +15 RON
                </div>
              </div>
            ))}
            {historyDeliveries.length === 0 && (
              <div className="courier-mobile-empty">
                <History size={48} />
                <p>Nicio livrare finalizată azi</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && selectedOrder && (
        <div className="signature-modal">
          <div className="signature-modal__content">
            <div className="signature-modal__header">
              <h3>📝 Semnătură Client</h3>
              <button onClick={() => setShowSignaturePad(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>
            
            <div className="signature-pad">
              <canvas 
                ref={canvasRef}
                className="signature-canvas"
                width={300}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="signature-modal__actions">
              <button onClick={clearSignature} className="btn-clear">
                Șterge
              </button>
              <button onClick={confirmDelivery} className="btn-confirm">
                Confirmă Livrarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Admin Button */}
      <button 
        onClick={() => window.location.href = '/dispatch'}
        className="courier-mobile-back"
        title="Înapoi la Dispecerat"
      >
        <ArrowLeft size={18} />
      </button>
    </div>
  );
};

