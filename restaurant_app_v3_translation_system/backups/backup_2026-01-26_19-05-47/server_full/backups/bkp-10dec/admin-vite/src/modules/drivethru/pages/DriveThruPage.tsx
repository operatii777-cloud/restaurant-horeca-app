/**
 * PHASE S10 - Drive-Thru Page
 * 
 * React implementation for Drive-Thru interface.
 * Displays drive-thru orders with lane management.
 */

import React, { useEffect, useState } from 'react';
import { useDriveThruStore } from '../driveThruStore';
import { useDriveThruEvents } from '../hooks/useDriveThruEvents';
import { updateOrderStatus } from '../../../core/api/ordersApi';
import type { CanonicalOrder } from '../../../types/order';
import './DriveThruPage.css';

/**
 * Format time as MM:SS
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Drive-Thru Page Component
 */
export function DriveThruPage() {
  const getDriveThruOrders = useDriveThruStore((state) => state.getDriveThruOrders);
  const getOrdersByLane = useDriveThruStore((state) => state.getOrdersByLane);
  const getElapsedSeconds = useDriveThruStore((state) => state.getElapsedSeconds);
  const getPendingCount = useDriveThruStore((state) => state.getPendingCount);
  const getReadyCount = useDriveThruStore((state) => state.getReadyCount);
  const getServedCount = useDriveThruStore((state) => state.getServedCount);
  
  // Sync with order events
  useDriveThruEvents();
  
  // Filter state
  const [selectedLane, setSelectedLane] = useState<string | number | 'all'>('all');
  
  // Get orders
  const allOrders = getDriveThruOrders();
  const filteredOrders = selectedLane === 'all'
    ? allOrders
    : getOrdersByLane(selectedLane);
  
  // Sort by creation time (oldest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const tA = a.timestamps?.created_at ? new Date(a.timestamps.created_at).getTime() : 0;
    const tB = b.timestamps?.created_at ? new Date(b.timestamps.created_at).getTime() : 0;
    return tA - tB;
  });
  
  // Get unique lanes
  const lanes = Array.from(new Set(
    allOrders
      .map((o) => o.drive_thru?.lane_number)
      .filter((l): l is string => !!l)
  )).sort();
  
  // Handle status updates
  const handleMarkReady = async (orderId: number | string) => {
    try {
      await updateOrderStatus(orderId, 'ready_for_pickup');
      console.log(`[Drive-Thru] Order ${orderId} marked as ready`);
    } catch (error) {
      console.error(`[Drive-Thru] Error marking order ${orderId} as ready:`, error);
      alert('Eroare la marcarea comenzii ca gata');
    }
  };
  
  const handleMarkServed = async (orderId: number | string) => {
    try {
      await updateOrderStatus(orderId, 'served');
      console.log(`[Drive-Thru] Order ${orderId} marked as served`);
    } catch (error) {
      console.error(`[Drive-Thru] Error marking order ${orderId} as served:`, error);
      alert('Eroare la marcarea comenzii ca servită');
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
    <div className="drivethru-page">
      <header className="drivethru-header">
        <h1 className="drivethru-title">Drive-Thru – Comenzi Active</h1>
        <div className="drivethru-stats">
          <span className="drivethru-stat-item">
            <span className="drivethru-stat-label">Pending:</span>
            <span className="drivethru-stat-value">{getPendingCount()}</span>
          </span>
          <span className="drivethru-stat-item">
            <span className="drivethru-stat-label">Ready:</span>
            <span className="drivethru-stat-value">{getReadyCount()}</span>
          </span>
          <span className="drivethru-stat-item">
            <span className="drivethru-stat-label">Served:</span>
            <span className="drivethru-stat-value">{getServedCount()}</span>
          </span>
        </div>
      </header>
      
      {lanes.length > 0 && (
        <div className="drivethru-lane-filters">
          <button
            className={`drivethru-lane-btn ${selectedLane === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedLane('all')}
          >
            Toate Liniile
          </button>
          {lanes.map((lane) => (
            <button
              key={lane}
              className={`drivethru-lane-btn ${selectedLane === lane ? 'active' : ''}`}
              onClick={() => setSelectedLane(lane)}
            >
              Linia {lane}
            </button>
          ))}
        </div>
      )}
      
      <div className="drivethru-orders-grid">
        {sortedOrders.map((order) => {
          const elapsed = getElapsedSeconds(order);
          
          return (
            <div key={order.id} className="drivethru-order-card">
              <div className="drivethru-order-header">
                <div className="drivethru-order-id">#{order.id}</div>
                {order.drive_thru?.lane_number && (
                  <div className="drivethru-lane-badge">
                    Linia {order.drive_thru.lane_number}
                  </div>
                )}
                {order.drive_thru?.car_plate && (
                  <div className="drivethru-car-plate">
                    🚗 {order.drive_thru.car_plate}
                  </div>
                )}
              </div>
              
              <div className="drivethru-order-items">
                {order.items.map((item) => (
                  <div key={item.id || `${item.product_id}-${item.name}`} className="drivethru-item-row">
                    <span className="drivethru-item-qty">{item.qty}×</span>
                    <span className="drivethru-item-name">{item.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="drivethru-order-total">
                <strong>Total: {order.totals.total.toFixed(2)} {order.totals.currency}</strong>
              </div>
              
              {order.notes?.general && (
                <div className="drivethru-order-notes">
                  <strong>Note:</strong> {order.notes.general}
                </div>
              )}
              
              <div className="drivethru-order-footer">
                <div className="drivethru-timer">
                  {formatTime(elapsed)}
                </div>
                
                <div className="drivethru-actions">
                  {order.status === 'pending' || order.status === 'preparing' ? (
                    <button
                      className="drivethru-btn drivethru-btn-ready"
                      onClick={() => handleMarkReady(order.id)}
                    >
                      Gata
                    </button>
                  ) : order.status === 'ready_for_pickup' ? (
                    <button
                      className="drivethru-btn drivethru-btn-served"
                      onClick={() => handleMarkServed(order.id)}
                    >
                      Servit
                    </button>
                  ) : order.status === 'served' ? (
                    <div className="drivethru-status-served">✓ Servit</div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedOrders.length === 0 && (
        <div className="drivethru-empty">
          <p>Nu există comenzi drive-thru {selectedLane !== 'all' ? `pentru linia ${selectedLane}` : ''}</p>
        </div>
      )}
    </div>
  );
}

