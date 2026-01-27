// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Delivery Page
 * 
 * React implementation replacing livrare1-10.html.
 * Displays delivery orders with status management.
 * Supports multiple waiter interfaces (1-10).
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDeliveryStore } from '../deliveryStore';
import { useDeliveryEvents } from '../hooks/useDeliveryEvents';
import { markOrderDelivered, markOrderPaid, updateOrderStatus } from '@/core/api/ordersApi';

import './DeliveryPage.css';

/**
 * Format time as MM:SS
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `"M":${s.toString().padStart(2, '0')}`;
}

/**
 * Delivery Page Component
 * Supports /delivery/:waiterId (1-10)
 */
export function DeliveryPage() {
//   const { t } = useTranslation();
  const { waiterId } = useParams<{ waiterId?: string }>();
  const waiterNumber = waiterId ? parseInt(waiterId, 10) : null;
  
  const getDeliveryOrders = useDeliveryStore((state) => state.getDeliveryOrders);
  const getOrdersByStatus = useDeliveryStore((state) => state.getOrdersByStatus);
  const getElapsedSeconds = useDeliveryStore((state) => state.getElapsedSeconds);
  const getReadyCount = useDeliveryStore((state) => state.getReadyCount);
  const getDeliveredCount = useDeliveryStore((state) => state.getDeliveredCount);
  const getPaidCount = useDeliveryStore((state) => state.getPaidCount);
  
  // Sync with order events
  useDeliveryEvents();
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<'ready' | 'delivered' | 'paid' | 'all'>('ready');
  
  // Get orders
  const allOrders = getDeliveryOrders();
  const filteredOrders = filterStatus === 'all' 
    ? allOrders 
    : getOrdersByStatus(filterStatus);
  
  // Sort by creation time (oldest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const tA = a.timestamps?.created_at ? new Date(a.timestamps.created_at).getTime() : 0;
    const tB = b.timestamps?.created_at ? new Date(b.timestamps.created_at).getTime() : 0;
    return tA - tB;
  });
  
  // Handle status updates
  const handleMarkDelivered = async (orderId: number | string) => {
    try {
      await markOrderDelivered(orderId);
      console.log(`'Delivery' Order ${orderId} marked as delivered`);
    } catch (error) {
      console.error(`'Delivery' Error marking order ${orderId} as delivered:`, error);
      alert('Eroare la marcarea comenzii ca livrată');
    }
  };
  
  const handleMarkPaid = async (orderId: number | string) => {
    try {
      await markOrderPaid(orderId);
      console.log(`'Delivery' Order ${orderId} marked as paid`);
    } catch (error) {
      console.error(`'Delivery' Error marking order ${orderId} as paid:`, error);
      alert('Eroare la marcarea comenzii ca achitată');
    }
  };
  
  // Update timer every second
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="delivery-page">
      <header className="delivery-header">
        <h1 className="delivery-title">
          Livrare {waiterNumber ? `- Ospătar ${waiterNumber}` : ''}
        </h1>
        <div className="delivery-stats">
          <span className="delivery-stat-item">
            <span className="delivery-stat-label">Gata:</span>
            <span className="delivery-stat-value">{getReadyCount()}</span>
          </span>
          <span className="delivery-stat-item">
            <span className="delivery-stat-label">Livrate:</span>
            <span className="delivery-stat-value">{getDeliveredCount()}</span>
          </span>
          <span className="delivery-stat-item">
            <span className="delivery-stat-label">Achitate:</span>
            <span className="delivery-stat-value">{getPaidCount()}</span>
          </span>
        </div>
      </header>
      
      <div className="delivery-filters">
        <button
          className={`delivery-filter-btn ${filterStatus === 'ready' ? 'active' : ''}`}
          onClick={() => setFilterStatus('ready')}
        >
          Gata
        </button>
        <button
          className={`delivery-filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilterStatus('delivered')}
        >
          Livrate
        </button>
        <button
          className={`delivery-filter-btn ${filterStatus === 'paid' ? 'active' : ''}`}
          onClick={() => setFilterStatus('paid')}
        >
          Achitate
        </button>
        <button
          className={`delivery-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >"Toate"</button>
      </div>
      
      <div className="delivery-orders-grid">
        {sortedOrders.map((order) => {
          const elapsed = getElapsedSeconds(order);
          
          return (
            <div key={order.id} className="delivery-order-card">
              <div className="delivery-order-header">
                <div className="delivery-order-id">#{order.id}</div>
                {order.customer?.name && (
                  <div className="delivery-customer-name">{order.customer.name}</div>
                )}
                {order.customer?.phone && (
                  <a 
                    href={`tel:${order.customer.phone}`}
                    className="delivery-customer-phone"
                  >
                    📞 {order.customer.phone}
                  </a>
                )}
              </div>
              
              {order.delivery?.address && (
                <div className="delivery-address">
                  <strong>"Adresă:"</strong> {order.delivery.address}
                </div>
              )}
              
              <div className="delivery-order-items">
                {order.items.map((item) => (
                  <div key={item.id || `${item.product_id}-${item.name}`} className="delivery-item-row">
                    <span className="delivery-item-qty">{item.qty}×</span>
                    <span className="delivery-item-name">{item.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="delivery-order-total">
                <strong>Total: {order.totals.total.toFixed(2)} {order.totals.currency}</strong>
              </div>
              
              {order.notes?.general && (
                <div className="delivery-order-notes">
                  <strong>Note:</strong> {order.notes.general}
                </div>
              )}
              
              <div className="delivery-order-footer">
                <div className="delivery-timer">
                  {formatTime(elapsed)}
                </div>
                
                <div className="delivery-actions">
                  {order.status === 'ready' && (
                    <button
                      className="delivery-btn delivery-btn-deliver"
                      onClick={() => handleMarkDelivered(order.id)}
                    >"marcheaza livrat"</button>
                  )}
                  
                  {order.status === 'delivered' && (
                    <button
                      className="delivery-btn delivery-btn-paid"
                      onClick={() => handleMarkPaid(order.id)}
                    >"marcheaza achitat"</button>
                  )}
                  
                  {order.status === 'paid' && (
                    <div className="delivery-status-paid">✓ Achitat</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedOrders.length === 0 && (
        <div className="delivery-empty">
          <p>Nu există comenzi {filterStatus === 'all' ? '' : filterStatus}</p>
        </div>
      )}
    </div>
  );
}




