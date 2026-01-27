import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Form, Modal, Table, Row, Col, InputGroup } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { StatCard } from '@/shared/components/StatCard';
import './TakeawayOrdersPage.css';

interface TakeawayOrder {
  id: number;
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method: string;
  total: number;
  status: string;
  timestamp: string;
  items: any[];
  is_paid?: boolean;
  fiscal_receipt_printed?: boolean;
}

export const TakeawayOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<TakeawayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<TakeawayOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      params.append('limit', '1000');
      
      const response = await httpClient.get<{ data: any[] }>(
        `/api/orders-delivery?${params.toString()}`
      );
      
      if (response.data && response.data.data) {
        // Filtrează doar comenzi takeaway
        const takeawayOrders = response.data.data.filter(
          (o: any) => 
            (o.type === 'takeaway' || o.type === 'takeout') &&
            o.order_source !== 'DELIVERY' &&
            o.order_source !== 'DRIVE_THRU'
        );
        setOrders(takeawayOrders);
      }
    } catch (err) {
      console.error('Error fetching takeaway orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.customer_name?.toLowerCase().includes(query) ||
        o.customer_phone?.includes(query) ||
        o.id.toString().includes(query) ||
        o.order_number?.includes(query)
      );
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filtered;
  }, [orders, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const completed = orders.filter(o => o.status === 'completed' || o.status === 'ready').length;
    const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Calculează timp mediu preparare (dacă există completed_timestamp)
    const ordersWithTime = orders.filter(o => o.status === 'completed' && o.timestamp);
    const avgPrepTime = ordersWithTime.length > 0
      ? ordersWithTime.reduce((sum, o) => {
          const created = new Date(o.timestamp).getTime();
          const now = Date.now();
          return sum + (now - created) / 60000; // minute (aproximativ)
        }, 0) / ordersWithTime.length
      : 0;

    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.timestamp).toDateString() === today);

    return { total, pending, completed, totalValue, avgPrepTime, todayOrders: todayOrders.length };
  }, [orders]);

  const openDetails = (order: TakeawayOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  return (
    <div className="takeaway-orders-page">
      <div className="page-header">
        <h1><i className="fas fa-shopping-bag me-2"></i>Comenzi Takeaway</h1>
        <div className="header-actions">
          <Button variant="primary" onClick={fetchOrders} disabled={loading}>
            <i className="fas fa-sync-alt me-1"></i>Reîmprospătează
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <StatCard
            title="Total Comenzi"
            value={stats.total.toString()}
            helper={`Valoare: ${stats.totalValue.toFixed(2)} RON`}
            icon={<span>📦</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Astăzi"
            value={stats.todayOrders.toString()}
            helper="Comenzi zilnice"
            icon={<span>📅</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="În Așteptare"
            value={stats.pending.toString()}
            helper="Comenzi active"
            icon={<span>⏳</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Timp Mediu"
            value={stats.avgPrepTime > 0 ? `${stats.avgPrepTime.toFixed(1)} min` : 'N/A'}
            helper="Timp preparare"
            icon={<span>⏱️</span>}
          />
        </Col>
      </Row>

      {/* Filtre */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Toate</option>
                <option value="pending">În așteptare</option>
                <option value="preparing">În preparare</option>
                <option value="ready">Gata</option>
                <option value="completed">Finalizat</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>De la</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Până la</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={12}>
              <InputGroup>
                <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Caută după nume, telefon, ID comandă..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabel */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      ) : (
        <Card>
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dată/Ora</th>
                    <th>Client</th>
                    <th>Telefon</th>
                    <th>Produse</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">Nu există comenzi takeaway.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.timestamp).toLocaleString('ro-RO')}</td>
                        <td>{order.customer_name || 'N/A'}</td>
                        <td>{order.customer_phone || 'N/A'}</td>
                        <td>{order.items?.length || 0} produs(e)</td>
                        <td><strong>{order.total.toFixed(2)} RON</strong></td>
                        <td>
                          <Badge bg={order.status === 'completed' ? 'success' : 'warning'}>
                            {order.status}
                          </Badge>
                          {order.is_paid && <Badge bg="success" className="ms-1">Plătit</Badge>}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openDetails(order)}
                          >
                            <i className="fas fa-eye"></i> Detalii
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal Detalii */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalii Comandă Takeaway #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong>{' '}
                  <Badge bg={selectedOrder.status === 'completed' ? 'success' : 'warning'}>
                    {selectedOrder.status}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Tip:</strong> <Badge bg="success">📦 TAKEAWAY</Badge>
                </Col>
              </Row>

              <h6 className="mt-4">Informații Client</h6>
              {selectedOrder.customer_name && (
                <p><strong>Nume:</strong> {selectedOrder.customer_name}</p>
              )}
              {selectedOrder.customer_phone && (
                <p><strong>Telefon:</strong> {selectedOrder.customer_phone}</p>
              )}

              <h6 className="mt-4">Produse</h6>
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Cantitate</th>
                    <th>Preț</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td>{item.name || item.product_name || 'N/A'}</td>
                      <td>{item.quantity || 1}</td>
                      <td>{(item.price || item.unit_price || 0).toFixed(2)} RON</td>
                      <td>{((item.quantity || 1) * (item.price || item.unit_price || 0)).toFixed(2)} RON</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3}>Total</th>
                    <th>{selectedOrder.total.toFixed(2)} RON</th>
                  </tr>
                </tfoot>
              </Table>

              <h6 className="mt-4">Plată</h6>
              <p><strong>Metodă:</strong> {selectedOrder.payment_method}</p>
              <p><strong>Status:</strong> {selectedOrder.is_paid ? '✅ Plătit' : '❌ Neplătit'}</p>
              {selectedOrder.fiscal_receipt_printed && (
                <p><strong>Bon fiscal:</strong> ✅ Printat</p>
              )}
            </>
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

