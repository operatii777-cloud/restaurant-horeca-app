/**
 * FAZA 2.B - POS Table Selector Component
 * 
 * Selects table for dine-in orders.
 * - Loads tables from /api/hostess/tables
 * - Handles statuses: FREE, OCCUPIED, HAS_OPEN_ORDER
 * - On click: if has open order → load order, if empty → create new order
 */

import React, { useEffect, useState } from 'react';
import { usePosStore } from '../store/posStore';
import { usePosOrder } from '../hooks/usePosOrder';
import { httpClient } from '@/shared/api/httpClient';
import './PosTableSelector.css';

interface Table {
  id: number;
  table_number: string | number;
  location?: string;
  capacity?: number;
  status: 'FREE' | 'OCCUPIED' | 'HAS_OPEN_ORDER';
  session_id?: number;
  order_id?: number; // If table has open order
}

export function PosTableSelector() {
  const { selectedTableId, setTable, currentOrderId, loadOrderFromServer, resetDraft } = usePosStore();
  const { loadOrder, createOrder } = usePosOrder();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTable, setProcessingTable] = useState<number | null>(null);

  useEffect(() => {
    loadTables();
    // Refresh tables periodically
    const interval = setInterval(loadTables, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTables = async () => {
    try {
      const response = await httpClient.get('/api/hostess/tables');
      const tablesData = response.data?.data || [];
      
      // Map tables and check for open orders
      const mappedTables: Table[] = await Promise.all(
        tablesData.map(async (table: any) => {
          let status: 'FREE' | 'OCCUPIED' | 'HAS_OPEN_ORDER' = table.status === 'OCCUPIED' ? 'OCCUPIED' : 'FREE';
          let orderId: number | undefined;
          
          // Check if table has open order
          if (table.session_id) {
            try {
              // Try to find open order for this table
              const ordersResponse = await httpClient.get('/api/orders/active', {
                params: { table_id: table.id },
              });
              const orders = ordersResponse.data?.data || ordersResponse.data || [];
              const openOrder = orders.find((o: any) => 
                o.status === 'pending' || o.status === 'in_progress' || o.status === 'open'
              );
              if (openOrder) {
                status = 'HAS_OPEN_ORDER';
                orderId = openOrder.id;
              }
            } catch (err) {
              // Ignore errors when checking for orders
            }
          }
          
          return {
            id: table.id,
            table_number: table.table_number || table.number || table.id,
            location: table.location,
            capacity: table.capacity,
            status,
            session_id: table.session_id,
            order_id: orderId,
          };
        })
      );
      
      setTables(mappedTables);
      setError(null);
    } catch (err: any) {
      console.error('[PosTableSelector] Error loading tables:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea meselor');
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = async (table: Table) => {
    if (processingTable === table.id) return;
    
    setProcessingTable(table.id);
    
    try {
      // If table has open order, load it
      if (table.status === 'HAS_OPEN_ORDER' && table.order_id) {
        const order = await loadOrder(table.order_id);
        if (order) {
          // Convert order items to draftItems
          const draftItems = (order.items || []).map((item: any) => ({
            productId: item.product_id || item.productId,
            name: item.name || item.product_name || 'Produs',
            qty: item.quantity || item.qty || 1,
            unitPrice: item.price || item.unit_price || 0,
            total: (item.quantity || item.qty || 1) * (item.price || item.unit_price || 0),
            notes: item.notes,
            options: item.options,
          }));
          
          // Update store
          usePosStore.setState({
            currentOrderId: order.id,
            selectedTableId: table.id,
            draftItems,
          });
        }
      } else {
        // Create new order for this table
        setTable(table.id);
        resetDraft();
      }
    } catch (err: any) {
      console.error('[PosTableSelector] Error handling table click:', err);
      alert(err.response?.data?.error || 'Eroare la procesarea mesei');
    } finally {
      setProcessingTable(null);
    }
  };

  if (loading) {
    return (
      <div className="pos-table-selector-loading">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Se încarcă mesele...</span>
        </div>
        <p className="text-muted mt-2">Se încarcă mesele...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pos-table-selector-error">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadTables}>
          <i className="fas fa-redo me-1"></i>
          Reîncearcă
        </button>
      </div>
    );
  }

  const getStatusLabel = (status: Table['status']) => {
    switch (status) {
      case 'FREE':
        return 'Liberă';
      case 'OCCUPIED':
        return 'Ocupată';
      case 'HAS_OPEN_ORDER':
        return 'Comandă deschisă';
      default:
        return status;
    }
  };

  const getStatusClass = (status: Table['status']) => {
    switch (status) {
      case 'FREE':
        return 'status-free';
      case 'OCCUPIED':
        return 'status-occupied';
      case 'HAS_OPEN_ORDER':
        return 'status-open-order';
      default:
        return '';
    }
  };

  return (
    <div className="pos-table-selector">
      <div className="pos-table-selector-header">
        <h4 className="pos-table-selector-title">Selectează Masa</h4>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={loadTables}
          title="Reîncarcă mesele"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      <div className="pos-table-grid">
        {tables.length === 0 ? (
          <div className="pos-table-empty">
            <p className="text-muted">Nu există mese disponibile</p>
          </div>
        ) : (
          tables.map((table) => {
            const isProcessing = processingTable === table.id;
            const isSelected = selectedTableId === table.id;
            
            return (
              <button
                key={table.id}
                className={`pos-table-btn ${isSelected ? 'selected' : ''} ${getStatusClass(table.status)}`}
                onClick={() => handleTableClick(table)}
                disabled={isProcessing}
                title={`Masa ${table.table_number} - ${getStatusLabel(table.status)}`}
              >
                {isProcessing ? (
                  <div className="pos-table-processing">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Se procesează...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="pos-table-number">{table.table_number}</span>
                    {table.capacity && (
                      <span className="pos-table-capacity">
                        <i className="fas fa-users"></i> {table.capacity}
                      </span>
                    )}
                    <span className={`pos-table-status ${getStatusClass(table.status)}`}>
                      {getStatusLabel(table.status)}
                    </span>
                    {table.status === 'HAS_OPEN_ORDER' && (
                      <span className="pos-table-order-badge">
                        <i className="fas fa-receipt"></i>
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })
        )}
      </div>
      
      {selectedTableId && (
        <div className="pos-table-actions">
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              setTable(null);
              resetDraft();
            }}
          >
            <i className="fas fa-times me-1"></i>
            Șterge selecția
          </button>
        </div>
      )}
    </div>
  );
}

