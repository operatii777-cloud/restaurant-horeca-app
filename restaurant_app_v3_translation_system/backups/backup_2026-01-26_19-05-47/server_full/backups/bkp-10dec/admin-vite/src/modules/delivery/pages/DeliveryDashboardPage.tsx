// =====================================================================
// DELIVERY DASHBOARD PAGE
// Interfață completă pentru gestionarea comenzilor delivery
// =====================================================================

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Form, Modal, Table, Tabs, Tab } from 'react-bootstrap';
import './DeliveryDashboardPage.css';

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
  items: any[];
  courier_name?: string;
  courier_phone?: string;
  delivery_status?: string;
  is_paid?: boolean;
}

const PLATFORM_ICONS: Record<string, string> = {
  glovo: '🛵',
  wolt: '🔵',
  bolt_food: '🍏',
  friendsride: '🟣',
  tazz: '⚡',
  phone: '📞',
  online: '🌐'
};

export const DeliveryDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterStatus, filterPlatform]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/delivery/active');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }
    
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(o => o.platform === filterPlatform);
    }
    
    setFilteredOrders(filtered);
  };

  const openDetails = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const openCancelModal = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const openMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  const openWaze = (address: string) => {
    window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`);
  };

  const printFiscalReceipt = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/pos/fiscalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Bon fiscal printat cu succes!');
      } else {
        alert('Eroare: ' + data.error);
      }
    } catch (err) {
      alert('Eroare la printare bon fiscal');
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder || !cancelReason) {
      alert('Selectează un motiv de anulare');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: cancelReason,
          cancelled_by: 'admin'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowCancelModal(false);
        setCancelReason('');
        fetchOrders();
        alert('Comandă anulată cu succes');
      } else {
        alert('Eroare: ' + data.error);
      }
    } catch (err) {
      alert('Eroare la anulare comandă');
    }
  };

  const getWaitTime = (timestamp: string) => {
    const orderTime = new Date(timestamp);
    const now = new Date();
    return Math.floor((now.getTime() - orderTime.getTime()) / 60000);
  };

  const getPlatformIcon = (platform: string) => {
    return PLATFORM_ICONS[platform] || '📦';
  };

  return (
    <div className="delivery-dashboard-page">
      <div className="dashboard-header">
        <h2>📦 Delivery Dashboard</h2>
        <div className="dashboard-stats">
          <Badge bg="primary">Total: {orders.length}</Badge>
          <Badge bg="warning">Pending: {orders.filter(o => o.status === 'pending').length}</Badge>
          <Badge bg="success">Gata: {orders.filter(o => o.status === 'completed').length}</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <div className="filters-row">
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Toate</option>
                <option value="pending">Pending</option>
                <option value="preparing">În Preparare</option>
                <option value="completed">Gata</option>
                <option value="assigned">Alocată</option>
                <option value="picked_up">Preluată</option>
                <option value="in_transit">În Livrare</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Platformă</Form.Label>
              <Form.Select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
                <option value="all">Toate</option>
                <option value="glovo">🛵 Glovo</option>
                <option value="wolt">🔵 Wolt</option>
                <option value="bolt_food">🍏 Bolt Food</option>
                <option value="friendsride">🟣 FriendsRide</option>
                <option value="tazz">⚡ Tazz</option>
                <option value="phone">📞 Telefonic</option>
                <option value="online">🌐 Online</option>
              </Form.Select>
            </Form.Group>

            <Button variant="outline-primary" onClick={fetchOrders}>
              🔄 Refresh
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Adresă</th>
                <th>Platformă</th>
                <th>Status</th>
                <th>Curier</th>
                <th>Timp</th>
                <th>Total</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className={getWaitTime(order.timestamp) > 30 ? 'table-warning' : ''}>
                  <td><strong>#{order.id}</strong></td>
                  <td>
                    <div>{order.customer_name}</div>
                    <small className="text-muted">{order.customer_phone}</small>
                  </td>
                  <td>
                    <small>{order.delivery_address}</small>
                  </td>
                  <td>
                    <span style={{fontSize: '20px'}}>{getPlatformIcon(order.platform)}</span>
                  </td>
                  <td>
                    <Badge bg={
                      order.status === 'completed' ? 'success' :
                      order.status === 'preparing' ? 'warning' :
                      order.delivery_status === 'in_transit' ? 'info' :
                      'secondary'
                    }>
                      {order.delivery_status || order.status}
                    </Badge>
                  </td>
                  <td>
                    {order.courier_name ? (
                      <div>
                        <div>{order.courier_name}</div>
                        {order.courier_phone && <small className="text-muted">{order.courier_phone}</small>}
                      </div>
                    ) : (
                      <Badge bg="secondary">Nealocat</Badge>
                    )}
                  </td>
                  <td>
                    <span className={getWaitTime(order.timestamp) > 30 ? 'text-danger fw-bold' : ''}>
                      {getWaitTime(order.timestamp)} min
                    </span>
                  </td>
                  <td><strong>{order.total.toFixed(2)} RON</strong></td>
                  <td>
                    <div className="action-buttons">
                      <Button size="sm" variant="info" onClick={() => openDetails(order)} title="Detalii">
                        👁️
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => callCustomer(order.customer_phone)} title="Sună">
                        📞
                      </Button>
                      <Button size="sm" variant="success" onClick={() => openMaps(order.delivery_address)} title="Maps">
                        🗺️
                      </Button>
                      <Button size="sm" variant="warning" onClick={() => printFiscalReceipt(order.id)} title="Print Bon">
                        🖨️
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openCancelModal(order)} title="Anulează">
                        ❌
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center text-muted py-5">
              <h5>Nicio comandă delivery activă</h5>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Detalii */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalii Comandă #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <h5>Client</h5>
              <p>
                <strong>{selectedOrder.customer_name}</strong><br />
                📞 {selectedOrder.customer_phone}<br />
                📍 {selectedOrder.delivery_address}
              </p>

              <h5>Produse</h5>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Cant.</th>
                    <th>Preț</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toFixed(2)} RON</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <h5>Informații Livrare</h5>
              <p>
                <strong>Platformă:</strong> {getPlatformIcon(selectedOrder.platform)} {selectedOrder.platform}<br />
                <strong>Plată:</strong> {selectedOrder.payment_method}<br />
                <strong>Status:</strong> <Badge bg="info">{selectedOrder.status}</Badge><br />
                {selectedOrder.courier_name && (
                  <>
                    <strong>Curier:</strong> {selectedOrder.courier_name} ({selectedOrder.courier_phone})<br />
                  </>
                )}
                <strong>Total:</strong> <span className="text-success fw-bold">{selectedOrder.total.toFixed(2)} RON</span>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Închide
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Anulare */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Anulare Comandă #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Motiv Anulare</Form.Label>
            <Form.Select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
              <option value="">Selectează motiv...</option>
              <option value="CUSTOMER_REQUEST">Cerere client</option>
              <option value="CUSTOMER_UNREACHABLE">Client indisponibil</option>
              <option value="WRONG_ADDRESS">Adresă greșită</option>
              <option value="PRODUCT_UNAVAILABLE">Produs indisponibil</option>
              <option value="PAYMENT_ISSUE">Problemă plată</option>
              <option value="COURIER_UNAVAILABLE">Curier indisponibil</option>
              <option value="OUTSIDE_DELIVERY_ZONE">În afara zonei</option>
              <option value="OTHER">Altul</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Renunță
          </Button>
          <Button variant="danger" onClick={cancelOrder} disabled={!cancelReason}>
            Confirmă Anulare
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeliveryDashboardPage;

