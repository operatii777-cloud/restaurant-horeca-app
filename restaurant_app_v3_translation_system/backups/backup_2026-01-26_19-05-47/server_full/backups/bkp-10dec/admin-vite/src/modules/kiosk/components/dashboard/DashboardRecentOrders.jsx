import React, { useState, useEffect } from 'react';
import { Eye, Check, Clock } from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import './DashboardRecentOrders.css';

/**
 * Tabel Comenzi Recente - ultimele 30 din ziua curentă
 * Sortate descrescător (ultima comandă primă)
 */
export const DashboardRecentOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadRecentOrders();
    // Refresh la fiecare 15 secunde
    const interval = setInterval(loadRecentOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadRecentOrders = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/api/orders');
      
      if (response.data && Array.isArray(response.data)) {
        // Filtrează comenzile din ziua curentă
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = response.data.filter(order => {
          const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
          return orderDate === today;
        });

        // Sortează descrescător (ultima comandă primă)
        const sorted = todayOrders.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Ia primele 30
        setOrders(sorted.slice(0, 30));
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'În așteptare', class: 'status--pending' },
      'preparing': { label: 'În pregătire', class: 'status--preparing' },
      'ready': { label: 'Gata', class: 'status--ready' },
      'delivered': { label: 'În livrare', class: 'status--delivered' },
      'completed': { label: 'Finalizat', class: 'status--completed' },
      'cancelled': { label: 'Anulat', class: 'status--cancelled' },
    };

    const config = statusConfig[status] || { label: status, class: 'status--default' };
    
    return (
      <span className={`order-status ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getLocation = (order) => {
    if (order.table_number) {
      return `Masa ${order.table_number}`;
    }
    if (order.delivery_type === 'delivery') {
      return 'Delivery';
    }
    if (order.delivery_type === 'drive_thru') {
      return 'Drive-Thru';
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="recent-orders">
        <div className="recent-orders__header">
          <h2 className="recent-orders__title">
            <Clock size={20} />
            Comenzi Recente
          </h2>
        </div>
        <div className="recent-orders__loading">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="recent-orders">
      <div className="recent-orders__header">
        <h2 className="recent-orders__title">
          <Clock size={20} />
          Comenzi Recente
        </h2>
        <button className="recent-orders__new-order" onClick={() => window.location.href = '/kiosk/tables'}>
          + Comandă Nouă
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="recent-orders__empty">
          Nu există comenzi astăzi
        </div>
      ) : (
        <div className="recent-orders__table-wrapper">
          <table className="recent-orders__table">
            <thead>
              <tr>
                <th>COMANDĂ</th>
                <th>LOCAȚIE</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>ACȚIUNI</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{getLocation(order)}</td>
                  <td className="recent-orders__total">{order.total.toFixed(2)} RON</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div className="recent-orders__actions">
                      <button 
                        className="action-btn action-btn--view" 
                        title="Vezi detalii"
                        onClick={() => console.log('View order:', order.id)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="action-btn action-btn--complete" 
                        title="Marchează complet"
                        onClick={() => console.log('Complete order:', order.id)}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

