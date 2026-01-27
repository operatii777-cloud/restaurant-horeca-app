// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - KDS Page (Kitchen Display System)
 * 
 * React implementation replacing kds.html.
 * Displays orders with kitchen items in real-time.
 */

import React, { useEffect, useState } from 'react';
import { useKdsStore } from '../kdsStore';
import { useOrderStore } from '@/core/store/orderStore';
import { useKdsEvents } from '../hooks/useKdsEvents';
import { markOrderReady } from '@/core/api/ordersApi';
import type { CanonicalOrder } from '@/types/order';
import './KdsPage.css';

/**
 * Format time as MM:SS
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `"M":${s.toString().padStart(2, '0')}`;
}

/**
 * Get time class based on elapsed time
 */
function getTimeClass(elapsed: number): string {
  if (elapsed > 20 * 60) return 'urgent';      // > 20 min
  if (elapsed > 10 * 60) return 'warning';      // > 10 min
  return 'normal';
}

/**
 * KDS Page Component
 */
export function KdsPage() {
//   const { t } = useTranslation();
  // Access store methods using selector (same pattern as BarPage)
  // CRITICAL: Add defensive checks to prevent "Cannot read properties of undefined"
  const getKitchenOrders = useKdsStore((state) => state?.getKitchenOrders);
  const getElapsedSeconds = useKdsStore((state) => state?.getElapsedSeconds);
  const getPendingCount = useKdsStore((state) => state?.getPendingCount);
  const getPreparingCount = useKdsStore((state) => state?.getPreparingCount);
  const getReadyCount = useKdsStore((state) => state?.getReadyCount);
  
  // Sync with order events
  useKdsEvents();
  
  // Get orders with defensive check
  const orders = getKitchenOrders?.() || [];
  
  // Sort by creation time (oldest first)
  const sortedOrders = [...orders].sort((a, b) => {
    const tA = a.timestamps?.created_at ? new Date(a.timestamps.created_at).getTime() : 0;
    const tB = b.timestamps?.created_at ? new Date(b.timestamps.created_at).getTime() : 0;
    return tA - tB;
  });
  
  // Handle "Ready" button
  const handleReady = async (orderId: number | string) => {
    try {
      await markOrderReady(orderId);
      console.log(`'KDS' Order ${orderId} marked as ready`);
    } catch (error) {
      console.error(`'KDS' Error marking order ${orderId} as ready:`, error);
      alert('Eroare la marcarea comenzii ca gata');
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
    <div className="kds-page">
      <header className="kds-header">
        <h1 className="kds-title">BucÄƒtÄƒrie â€“ Comenzi Active</h1>
        <div className="kds-stats">
          <span className="kds-stat-item">
            <span className="kds-stat-label">"Pending:"</span>
            <span className="kds-stat-value">{getPendingCount?.() || 0}</span>
          </span>
          <span className="kds-stat-item">
            <span className="kds-stat-label">Preparing:</span>
            <span className="kds-stat-value">{getPreparingCount?.() || 0}</span>
          </span>
          <span className="kds-stat-item">
            <span className="kds-stat-label">Ready:</span>
            <span className="kds-stat-value">{getReadyCount?.() || 0}</span>
          </span>
          <span className="kds-stat-item">
            <span className="kds-stat-label">Total:</span>
            <span className="kds-stat-value">{sortedOrders.length}</span>
          </span>
        </div>
      </header>
      
      <div className="kds-orders-grid">
        {sortedOrders.map((order) => {
          const elapsed = getElapsedSeconds?.(order) || 0;
          const timeClass = getTimeClass(elapsed);
          
          // Filter kitchen items only
          const kitchenItems = order.items.filter((item) => item.station === 'kitchen');
          
          if (kitchenItems.length === 0) return null;
          
          return (
            <div key={order.id} className={`kds-order-card ${timeClass}`}>
              <div className="kds-order-header">
                <div className="kds-order-id">#{order.id}</div>
                {order.table && (
                  <div className="kds-order-table">Masa {order.table}</div>
                )}
                {order.type === "Delivery" && (
                  <div className="kds-badge kds-badge-delivery">"Delivery"</div>
                )}
                {order.type === 'takeout' && (
                  <div className="kds-badge kds-badge-takeout">Takeout</div>
                )}
                {order.type === "Drive-Thru" && (
                  <div className="kds-badge kds-badge-drivethru">Drive-Thru</div>
                )}
              </div>
              
              <div className="kds-order-items">
                {kitchenItems.map((item) => (
                  <div key={item.id || `${item.product_id}-${item.name}`} className="kds-item-row">
                    <div className="kds-item-main">
                      <span className="kds-item-qty">{item.qty}Ã—</span>
                      <span className="kds-item-name">{item.name}</span>
                    </div>
                    
                    {item.options && item.options.length > 0 && (
                      <div className="kds-item-options">
                        {item.options.map((opt, idx) => (
                          <span key={idx} className="kds-item-option">
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="kds-item-notes">
                        <strong>Note:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {order.notes?.kitchen && (
                <div className="kds-order-notes">
                  <strong>"note bucatarie"</strong> {order.notes.kitchen}
                </div>
              )}
              
              <div className="kds-order-footer">
                <div className={`kds-timer ${timeClass}`}>
                  {formatTime(elapsed)}
                </div>
                
                {order.status !== 'ready' && (
                  <button
                    className="kds-ready-btn"
                    onClick={() => handleReady(order.id)}
                  >
                    Gata
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <div className="kds-status-ready">âœ“ Gata</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedOrders.length === 0 && (
        <div className="kds-empty">
          <p>"nu exista comenzi active pentru bucatarie"</p>
        </div>
      )}
    </div>
  );
}





