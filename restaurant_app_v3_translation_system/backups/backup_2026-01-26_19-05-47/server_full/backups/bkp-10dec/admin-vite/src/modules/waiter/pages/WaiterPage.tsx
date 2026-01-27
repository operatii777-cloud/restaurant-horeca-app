/**
 * PHASE S10 - Waiter Page
 * 
 * React implementation replacing comanda-supervisor1-11.html.
 * Displays unpaid orders for tables (waiter/supervisor interface).
 * Supports multiple waiter views (1-11).
 * 
 * Note: comanda-supervisor11.html also functions as KIOSK interface,
 * but for supervisor functionality (unpaid orders), this component covers it.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWaiterStore } from '../waiterStore';
import { useWaiterEvents } from '../hooks/useWaiterEvents';
import { markOrderPaid } from '../../../core/api/ordersApi';
import type { CanonicalOrder } from '../../../types/order';
import './WaiterPage.css';

/**
 * Format time as MM:SS
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Waiter Page Component
 * Supports /waiter/:waiterId (1-11)
 * - waiterId 1-10: Regular waiter views
 * - waiterId 11: Supervisor 11 (Trattoria theme variant)
 */
export function WaiterPage() {
  const { waiterId } = useParams<{ waiterId?: string }>();
  const waiterNumber = waiterId ? parseInt(waiterId, 10) : null;
  
  const getUnpaidOrders = useWaiterStore((state) => state.getUnpaidOrders);
  const getOrdersByTable = useWaiterStore((state) => state.getOrdersByTable);
  const getOrdersByWaiter = useWaiterStore((state) => state.getOrdersByWaiter);
  const getElapsedSeconds = useWaiterStore((state) => state.getElapsedSeconds);
  const getUnpaidCount = useWaiterStore((state) => state.getUnpaidCount);
  const getTotalUnpaid = useWaiterStore((state) => state.getTotalUnpaid);
  
  // Sync with order events
  useWaiterEvents();
  
  // Filter state
  const [selectedTable, setSelectedTable] = useState<string | number | 'all'>('all');
  
  // Get orders
  const allOrders = waiterNumber
    ? getOrdersByWaiter(waiterNumber)
    : getUnpaidOrders();
  
  const filteredOrders = selectedTable === 'all'
    ? allOrders
    : getOrdersByTable(selectedTable);
  
  // Group by table
  const ordersByTable = filteredOrders.reduce((acc, order) => {
    const table = String(order.table || 'N/A');
    if (!acc[table]) acc[table] = [];
    acc[table].push(order);
    return acc;
  }, {} as Record<string, CanonicalOrder[]>);
  
  // Get unique tables
  const tables = Array.from(new Set(
    allOrders.map((o) => String(o.table || 'N/A'))
  )).sort();
  
  // Handle mark as paid
  const handleMarkPaid = async (orderId: number | string) => {
    try {
      await markOrderPaid(orderId);
      console.log(`[Waiter] Order ${orderId} marked as paid`);
    } catch (error) {
      console.error(`[Waiter] Error marking order ${orderId} as paid:`, error);
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
    <div className="waiter-page">
      <header className="waiter-header">
        <h1 className="waiter-title">
          {waiterNumber === 11 
            ? 'Supervisor 11 (Trattoria)' 
            : waiterNumber 
            ? `Ospătar ${waiterNumber}` 
            : 'Supervisor'} – Comenzi Neachitate
        </h1>
        <div className="waiter-stats">
          <span className="waiter-stat-item">
            <span className="waiter-stat-label">Comenzi:</span>
            <span className="waiter-stat-value">{getUnpaidCount()}</span>
          </span>
          <span className="waiter-stat-item">
            <span className="waiter-stat-label">Total:</span>
            <span className="waiter-stat-value">{getTotalUnpaid().toFixed(2)} RON</span>
          </span>
        </div>
      </header>
      
      {tables.length > 0 && (
        <div className="waiter-table-filters">
          <button
            className={`waiter-table-btn ${selectedTable === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTable('all')}
          >
            Toate Mesele
          </button>
          {tables.map((table) => (
            <button
              key={table}
              className={`waiter-table-btn ${selectedTable === table ? 'active' : ''}`}
              onClick={() => setSelectedTable(table)}
            >
              Masa {table}
            </button>
          ))}
        </div>
      )}
      
      <div className="waiter-orders-grid">
        {Object.entries(ordersByTable).map(([table, orders]) => (
          <div key={table} className="waiter-table-section">
            <h2 className="waiter-table-title">Masa {table}</h2>
            
            {orders.map((order) => {
              const elapsed = getElapsedSeconds(order);
              const tableTotal = orders.reduce((sum, o) => sum + o.totals.total, 0);
              
              return (
                <div key={order.id} className="waiter-order-card">
                  <div className="waiter-order-header">
                    <div className="waiter-order-id">#{order.id}</div>
                    <div className="waiter-order-total">
                      {order.totals.total.toFixed(2)} {order.totals.currency}
                    </div>
                  </div>
                  
                  <div className="waiter-order-items">
                    {order.items.map((item) => (
                      <div key={item.id || `${item.product_id}-${item.name}`} className="waiter-item-row">
                        <span className="waiter-item-qty">{item.qty}×</span>
                        <span className="waiter-item-name">{item.name}</span>
                        <span className="waiter-item-price">
                          {(item.unit_price * item.qty).toFixed(2)} {order.totals.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {order.notes?.general && (
                    <div className="waiter-order-notes">
                      <strong>Note:</strong> {order.notes.general}
                    </div>
                  )}
                  
                  <div className="waiter-order-footer">
                    <div className="waiter-timer">
                      {formatTime(elapsed)}
                    </div>
                    
                    <button
                      className="waiter-btn waiter-btn-paid"
                      onClick={() => handleMarkPaid(order.id)}
                    >
                      Marchează Achitat
                    </button>
                  </div>
                </div>
              );
            })}
            
            {orders.length > 1 && (
              <div className="waiter-table-total">
                <strong>Total Masă {table}: {orders.reduce((sum, o) => sum + o.totals.total, 0).toFixed(2)} RON</strong>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredOrders.length === 0 && (
        <div className="waiter-empty">
          <p>Nu există comenzi neachitate {selectedTable !== 'all' ? `pentru masa ${selectedTable}` : ''}</p>
        </div>
      )}
    </div>
  );
}

