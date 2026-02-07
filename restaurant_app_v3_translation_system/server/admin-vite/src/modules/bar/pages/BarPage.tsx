// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Bar Page
 * 
 * React implementation replacing "comenzi bar.html".
 * Displays orders with bar items in real-time.
 */

import React, { useEffect, useState } from 'react';
import { useBarStore } from '../barStore';
import { useBarEvents } from '../hooks/useBarEvents';
import { markOrderReady } from '@/core/api/ordersApi';
import type { CanonicalOrder } from '@/types/order';
import './BarPage.css';

/**
 * Format time as MM:SS
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Get time class based on elapsed time
 */
function getTimeClass(elapsed: number): string {
  if (elapsed > 15 * 60) return 'urgent';      // > 15 min
  if (elapsed > 8 * 60) return 'warning';       // > 8 min
  return 'normal';
}

/**
 * Bar Page Component
 */
export function BarPage() {
  //   const { t } = useTranslation();
  // Access store methods using selector (same pattern as KdsPage)
  // CRITICAL: Add defensive checks to prevent "Cannot read properties of undefined"
  const getBarOrders = useBarStore((state) => state?.getBarOrders);
  const getElapsedSeconds = useBarStore((state) => state?.getElapsedSeconds);
  const getPendingCount = useBarStore((state) => state?.getPendingCount);
  const getPreparingCount = useBarStore((state) => state?.getPreparingCount);
  const getReadyCount = useBarStore((state) => state?.getReadyCount);

  // Sync with order events
  useBarEvents();

  // Get orders with defensive check
  const orders = getBarOrders?.() || [];

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
      console.log(`'Bar' Order ${orderId} marked as ready`);
    } catch (error) {
      console.error(`'Bar' Error marking order ${orderId} as ready:`, error);
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
    <div className="bar-page">
      <header className="bar-header">
        <h1 className="bar-title">Bar – Comenzi Active</h1>
        <div className="bar-stats">
          <span className="bar-stat-item">
            <span className="bar-stat-label">Pending:</span>
            <span className="bar-stat-value">{getPendingCount?.() || 0}</span>
          </span>
          <span className="bar-stat-item">
            <span className="bar-stat-label">Preparing:</span>
            <span className="bar-stat-value">{getPreparingCount?.() || 0}</span>
          </span>
          <span className="bar-stat-item">
            <span className="bar-stat-label">Ready:</span>
            <span className="bar-stat-value">{getReadyCount?.() || 0}</span>
          </span>
          <span className="bar-stat-item">
            <span className="bar-stat-label">Total:</span>
            <span className="bar-stat-value">{sortedOrders.length}</span>
          </span>
        </div>
      </header>



      <div className="bar-orders-grid">
        {sortedOrders.map((order) => {
          const elapsed = getElapsedSeconds?.(order) || 0;
          const timeClass = getTimeClass(elapsed);

          // Filter bar items only
          const barItems = order.items.filter((item) => item.station === 'bar');

          if (barItems.length === 0) return null;

          return (
            <div key={order.id} className={`bar-order-card ${timeClass}`}>
              <div className="bar-order-header">
                <div className="bar-order-id">#{order.id}</div>
                {order.table && (
                  <div className="bar-order-table">Masa {order.table}</div>
                )}
                {order.type === "Delivery" && (
                  <div className="bar-badge bar-badge-delivery">Delivery</div>
                )}
                {order.type === 'takeout' && (
                  <div className="bar-badge bar-badge-takeout">Takeout</div>
                )}
              </div>

              <div className="bar-order-items">
                {barItems.map((item) => (
                  <div key={item.id || `${item.product_id}-${item.name}`} className="bar-item-row">
                    <div className="bar-item-main">
                      <span className="bar-item-qty">{item.qty}×</span>
                      <span className="bar-item-name">{item.name}</span>
                    </div>

                    {item.options && item.options.length > 0 && (
                      <div className="bar-item-options">
                        {item.options.map((opt, idx) => (
                          <span key={idx} className="bar-item-option">
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <div className="bar-item-notes">
                        <strong>Note:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {order.notes?.bar && (
                <div className="bar-order-notes">
                  <strong>Note bar:</strong> {order.notes.bar}
                </div>
              )}

              <div className="bar-order-footer">
                <div className={`bar-timer ${timeClass}`}>
                  {formatTime(elapsed)}
                </div>

                {order.status !== 'ready' && (
                  <button
                    className="bar-ready-btn"
                    onClick={() => handleReady(order.id)}
                  >
                    Gata
                  </button>
                )}

                {order.status === 'ready' && (
                  <div className="bar-status-ready">✓ Gata</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sortedOrders.length === 0 && (
        <div className="bar-empty">
          <p>Nu există comenzi active pentru bar</p>
        </div>
      )}
    </div>
  );
}
