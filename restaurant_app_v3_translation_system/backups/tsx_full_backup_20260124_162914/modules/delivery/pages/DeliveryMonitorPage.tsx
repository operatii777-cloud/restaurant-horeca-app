// import { useTranslation } from '@/i18n/I18nContext';
// =====================================================================
// DELIVERY MONITOR PAGE (TV Display)
// Ecran dedicat pentru zona de livrări - afișează doar comenzi delivery
// =====================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import './DeliveryMonitorPage.css';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  status?: string;
}

interface DeliveryOrder {
  id: number;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  platform: string;
  payment_method: string;
  total: number;
  status: string;
  timestamp: string;
  items: OrderItem[];
  courier_name?: string;
  delivery_status?: string;
  delivery_pickup_code?: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  glovo: '🚚',
  wolt: '📱',
  bolt_food: '🍴',
  friendsride: '🚗',
  tazz: '⚡',
  phone: '📞',
  online: '🌐',
  pos: '💰'
};

export const DeliveryMonitorPage: React.FC = () => {
//   const { t } = useTranslation();
  const [inPreparation, setInPreparation] = useState<DeliveryOrder[]>([]);
  const [ready, setReady] = useState<DeliveryOrder[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000); // Refresh la 10s
    
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/delivery/monitor');
      const data = await response.json();
      
      if (data.success) {
        const currentCount = data.in_preparation.length + data.ready.length;
        
        // Sunet + flash la comandă nouă
        if (currentCount > previousCount) {
          playNotificationSound();
          flashScreen();
        }
        
        setInPreparation(data.in_preparation);
        setReady(data.ready);
        setPreviousCount(currentCount);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const flashScreen = () => {
    document.body.classList.add('flash-animation');
    setTimeout(() => {
      document.body.classList.remove('flash-animation');
    }, 500);
  };

  const markAsDelivered = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered', delivered_timestamp: new Date().toISOString() })
      });
      
      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Error marking as delivered:', err);
    }
  };

  const markAsPaid = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paid: true, paid_timestamp: new Date().toISOString() })
      });
      
      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  const getWaitTime = (timestamp: string) => {
    const orderTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / 60000);
    return diffMinutes;
  };

  const getProgressPercent = (order: DeliveryOrder) => {
    const items = order.items || [];
    if (items.length === 0) return 0;
    
    const completedItems = items.filter(item => item.status === 'completed' || item.status === 'ready').length;
    return Math.round((completedItems / items.length) * 100);
  };

  const getPlatformIcon = (platform: string) => {
    return PLATFORM_icons[platform] || '📦';
  };

  const renderOrderCard = (order: DeliveryOrder, isReady: boolean) => {
    const waitTime = getWaitTime(order.timestamp);
    const progress = getProgressPercent(order);
    
    return (
      <Card key={order.id} className={`delivery-order-card ${isReady ? 'ready' : 'preparing'} ${waitTime > 30 ? 'urgent' : ''}`}>
        <Card.Header>
          <div className="order-header">
            <div>
              <h4>#{order.id}</h4>
              {order.delivery_pickup_code && (
                <Badge bg="warning" className="pickup-code">
                  Cod: {order.delivery_pickup_code}
                </Badge>
              )}
            </div>
            <div className="order-meta">
              <span className="platform-badge">{getPlatformIcon(order.platform)}</span>
              <Badge bg={order.payment_method === 'cash' ? 'success' : 'info'}>
                {order.payment_method === 'cash' ? '💵 NUMERAR' : '💳 CARD'}
              </Badge>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          <div className="customer-info">
            <div><strong>{order.customer_name}</strong></div>
            <div className="text-muted">{order.customer_phone}</div>
            <div className="delivery-address">{order.delivery_address}</div>
          </div>

          {order.courier_name && (
            <div className="courier-info">
              <Badge bg="primary">🚴 {order.courier_name}</Badge>
            </div>
          )}

          <div className="order-items">
            {order.items.map((item, idx) => (
              <div key={idx} className="order-item">
                <span>{item.quantity}x {item.name}</span>
                {item.status && (
                  <Badge bg={item.status === 'completed' ? 'success' : 'warning'}>
                    {item.status === 'completed' ? '✅' : '🍳'}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {!isReady && progress > 0 && (
            <div className="progress-section">
              <small>Progres preparare:</small>
              <ProgressBar now={progress} label={`"Progress"%`} variant={progress === 100 ? 'success' : 'info'} />
            </div>
          )}

          <div className="order-footer">
            <div className="wait-time">
              <span className={waitTime > 30 ? 'text-danger' : waitTime > 20 ? 'text-warning' : ''}>
                â±ï¸ {waitTime} min
              </span>
            </div>
            <div className="order-total">
              <strong>{order.total.toFixed(2)} RON</strong>
            </div>
          </div>

          {isReady && (
            <div className="order-actions">
              <Button 
                variant="success" 
                size="sm" 
                onClick={() => markAsDelivered(order.id)}
                className="w-100 mb-2"
              >
                ✅ Livrat
              </Button>
              {order.payment_method === 'cash' && !order.is_paid && (
                <Button 
                  variant="warning" 
                  size="sm" 
                  onClick={() => markAsPaid(order.id)}
                  className="w-100"
                >
                  💰 Achitat
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="delivery-monitor-page">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      
      <div className="monitor-header">
        <h1>📦 Monitor Delivery</h1>
        <div className="monitor-stats">
          <Badge bg="primary" className="stat-badge">
            În preparare: {inPreparation.length}
          </Badge>
          <Badge bg="success" className="stat-badge">
            Gata: {ready.length}
          </Badge>
          <small className="text-muted">
            Actualizat: {lastUpdate.toLocaleTimeString('ro-RO')}
          </small>
        </div>
      </div>

      <div className="monitor-content">
        {/* În Preparare */}
        <div className="monitor-column">
          <div className="column-header preparing">
            <h3>🍳 În Preparare</h3>
            <Badge bg="warning">{inPreparation.length}</Badge>
          </div>
          <div className="orders-list">
            {inPreparation.map(order => renderOrderCard(order, false))}
            {inPreparation.length === 0 && (
              <div className="empty-state">
                <p>"Nicio comandă în pregătire"</p>
              </div>
            )}
          </div>
        </div>

        {/* Gata de Livrare */}
        <div className="monitor-column">
          <div className="column-header ready">
            <h3>✅ Gata de Livrare</h3>
            <Badge bg="success">{ready.length}</Badge>
          </div>
          <div className="orders-list">
            {ready.map(order => renderOrderCard(order, true))}
            {ready.length === 0 && (
              <div className="empty-state">
                <p>"Nicio comandă gata"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMonitorPage;





