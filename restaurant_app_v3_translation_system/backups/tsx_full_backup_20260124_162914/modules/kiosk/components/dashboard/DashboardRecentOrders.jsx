import React, { useState, useEffect } from 'react';
import { Eye, Check, Clock, X, Package, CreditCard, MapPin, Phone, User } from 'lucide-react';
import { Modal, Button, Badge, Card, Table } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { formatTimestamp } from '@/modules/orders/utils/orderHelpers';
import './DashboardRecentOrders.css';

/**
 * Tabel Comenzi Recente - ultimele 30 din ziua curentă
 * Sortate descrescător (ultima comandă primă)
 */
export const DashboardRecentOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      
      // Verifică dacă răspunsul conține orders array
      let ordersData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        }
      }
      
      if (ordersData.length > 0) {
        // Filtrează comenzile din ziua curentă
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = ordersData.filter(order => {
          // Verifică dacă order.timestamp există și este valid
          if (!order.timestamp) return false;
          try {
            // Suport pentru multiple formate de date
            const orderDate = new Date(order.timestamp);
            if (isNaN(orderDate.getTime())) return false;
            const orderDateStr = orderDate.toISOString().split('T')[0];
            return orderDateStr === today;
          } catch (e) {
            return false;
          }
        });

        // Parse items JSON dacă este necesar
        const parsedOrders = todayOrders.map(order => {
          if (order.items && typeof order.items === 'string') {
            try {
              order.items = JSON.parse(order.items);
            } catch (e) {
              console.warn('Error parsing order items:', e);
              order.items = [];
            }
          }
          return order;
        });

        // Sortează descrescător (ultima comandă primă)
        const sorted = parsedOrders.sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return dateB - dateA;
        });

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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔍 Click pe Vezi detalii pentru comanda:', order.id);
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                          console.log('✅ Modal setat la true, selectedOrder:', order.id);
                        }}
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

      {/* Modal Detalii Comandă - Edge to Edge */}
      <Modal
        show={showDetailsModal}
        onHide={() => {
          console.log('🔒 Modal onHide apelat');
          setShowDetailsModal(false);
        }}
        onShow={() => {
          console.log('🔓 Modal onShow apelat');
        }}
        size="xl"
        centered
        scrollable
        className="dashboard-order-details-modal"
        backdrop="static"
        keyboard={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Detalii Comandă #{selectedOrder?.id}
            {selectedOrder?.order_number && ` (${selectedOrder.order_number})`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div className="order-details-content-wrapper">
              {/* Status și Tip Badges */}
              <div className="mb-3">
                <Badge bg={getStatusBadgeColor(selectedOrder.status)} className="me-2">
                  {selectedOrder.status?.toUpperCase() || 'N/A'}
                </Badge>
                <Badge bg="light" text="dark">
                  <Clock size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                  {formatTimestamp(selectedOrder.timestamp)}
                </Badge>
              </div>

              {/* Informații Client */}
              {(selectedOrder.customer_name || selectedOrder.customer_phone || selectedOrder.delivery_address || selectedOrder.table_number) && (
                <Card className="mb-3">
                  <Card.Header>
                    <strong>
                      <User size={16} className="me-2" style={{ verticalAlign: 'middle' }} />
                      Informații Client
                    </strong>
                  </Card.Header>
                  <Card.Body>
                    {selectedOrder.customer_name && (
                      <p className="mb-2">
                        <User size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }} />
                        <strong>Nume:</strong> {selectedOrder.customer_name}
                      </p>
                    )}
                    {selectedOrder.customer_phone && (
                      <p className="mb-2">
                        <Phone size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }} />
                        <strong>Telefon:</strong> {selectedOrder.customer_phone}
                      </p>
                    )}
                    {selectedOrder.delivery_address && (
                      <p className="mb-2">
                        <MapPin size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }} />
                        <strong>Adresă:</strong> {selectedOrder.delivery_address}
                      </p>
                    )}
                    {selectedOrder.table_number && (
                      <p className="mb-0">
                        <MapPin size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }} />
                        <strong>Masă:</strong> {selectedOrder.table_number}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              )}

              {/* Produse */}
              <Card className="mb-3">
                <Card.Header>
                  <strong>
                    <Package size={16} className="me-2" style={{ verticalAlign: 'middle' }} />
                    Produse
                  </strong>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table striped bordered hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Produs</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Preț</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Parse items dacă este necesar
                        let items = selectedOrder.items || [];
                        if (typeof items === 'string') {
                          try {
                            items = JSON.parse(items);
                          } catch (e) {
                            console.warn('Error parsing items in modal:', e);
                            items = [];
                          }
                        }
                        if (!Array.isArray(items)) {
                          items = [];
                        }
                        return items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name || item.product_name || 'N/A'}</td>
                            <td className="text-center">{item.quantity || 1}</td>
                            <td className="text-end">{(item.price || item.unit_price || 0).toFixed(2)} RON</td>
                            <td className="text-end">
                              <strong>{((item.quantity || 1) * (item.price || item.unit_price || 0)).toFixed(2)} RON</strong>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Plată */}
              <Card>
                <Card.Header>
                  <strong>
                    <CreditCard size={16} className="me-2" style={{ verticalAlign: 'middle' }} />
                    Plată
                  </strong>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span><strong>Metodă:</strong></span>
                    <span>{selectedOrder.payment_method || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span><strong>Status:</strong></span>
                    <span>
                      {selectedOrder.is_paid ? (
                        <Badge bg="success">✅ Plătit</Badge>
                      ) : (
                        <Badge bg="danger">❌ Neplătit</Badge>
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span><strong>Total:</strong></span>
                    <span className="fs-5"><strong>{selectedOrder.total?.toFixed(2) || '0.00'} RON</strong></span>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Închide
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const getStatusBadgeColor = (status) => {
  const statusColors = {
    'pending': 'warning',
    'preparing': 'info',
    'ready': 'success',
    'completed': 'success',
    'delivered': 'success',
    'cancelled': 'danger',
    'paid': 'success'
  };
  return statusColors[status] || 'secondary';
};

