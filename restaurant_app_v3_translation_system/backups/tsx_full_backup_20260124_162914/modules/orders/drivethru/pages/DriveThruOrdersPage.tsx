// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Form, Modal, Table, Row, Col, InputGroup } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { StatCard } from '@/shared/components/StatCard';
import './DriveThruOrdersPage.css';

interface DriveThruOrder {
  id: number;
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  car_plate?: string;
  lane_number?: string;
  payment_method: string;
  total: number;
  status: string;
  timestamp: string;
  items: any[];
  arrived_at?: string;
  ordered_at?: string;
  paid_at?: string;
  served_at?: string;
  is_paid?: boolean;
  fiscal_receipt_printed?: boolean;
}

export const DriveThruOrdersPage: React.FC = () => {
//   const { t } = useTranslation();
  const [orders, setOrders] = useState<DriveThruOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLane, setFilterLane] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<DriveThruOrder | null>(null);
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
        // Filtrează doar comenzi drive-thru
        const driveThruOrders = response.data.data.filter(
          (o: any) => o.order_source === 'DRIVE_THRU' || o.type === 'drive_thru' || o.type === 'drive-thru'
        );
        setOrders(driveThruOrders);
      }
    } catch (err) {
      console.error('Error fetching drive-thru orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    if (filterLane !== 'all') {
      filtered = filtered.filter(o => o.lane_number === filterLane);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.car_plate?.toLowerCase().includes(query) ||
        o.lane_number?.toLowerCase().includes(query) ||
        o.id.toString().includes(query) ||
        o.order_number?.includes(query) ||
        o.customer_phone?.includes(query)
      );
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filtered;
  }, [orders, filterStatus, filterLane, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === "Pending:" || o.status === 'preparing').length;
    const completed = orders.filter(o => o.status === 'completed' || o.status === 'served').length;
    const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Calculează timp mediu (dacă există date)
    const ordersWithTime = orders.filter(o => o.arrived_at && o.served_at);
    const avgTime = ordersWithTime.length > 0
      ? ordersWithTime.reduce((sum, o) => {
          const arrived = new Date(o.arrived_at!).getTime();
          const served = new Date(o.served_at!).getTime();
          return sum + (served - arrived) / 60000; // minute
        }, 0) / ordersWithTime.length
      : 0;

    const under3Min = ordersWithTime.filter(o => {
      const arrived = new Date(o.arrived_at!).getTime();
      const served = new Date(o.served_at!).getTime();
      return (served - arrived) / 60000 < 3;
    }).length;

    const over5Min = ordersWithTime.filter(o => {
      const arrived = new Date(o.arrived_at!).getTime();
      const served = new Date(o.served_at!).getTime();
      return (served - arrived) / 60000 > 5;
    }).length;

    return { total, pending, completed, totalValue, avgTime, under3Min, over5Min, ordersWithTime: ordersWithTime.length };
  }, [orders]);

  const lanes = useMemo(() => {
    const unique = Array.from(new Set(orders.map(o => o.lane_number).filter(Boolean)));
    return unique.sort();
  }, [orders]);

  const openDetails = (order: DriveThruOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const calculateTime = (order: DriveThruOrder) => {
    if (!order.arrived_at || !order.served_at) return 'N/A';
    const arrived = new Date(order.arrived_at).getTime();
    const served = new Date(order.served_at).getTime();
    const minutes = Math.round((served - arrived) / 60000);
    return `${minutes} min`;
  };

  return (
    <div className="drivethru-orders-page">
      <div className="page-header">
        <h1><i className="fas fa-car me-2"></i>Comenzi Drive-Thru</h1>
        <div className="header-actions">
          <Button variant="primary" onClick={fetchOrders} disabled={loading}>
            <i className="fas fa-sync-alt me-1"></i>Reîmprospătează</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <StatCard
            title="Total Comenzi"
            value={stats.total.toString()}
            helper={`Valoare: ${stats.totalValue.toFixed(2)} RON`}
            icon={<span>🚗</span>}
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
            value={stats.avgTime > 0 ? `${stats.avgTime.toFixed(1)} min` : 'N/A'}
            helper={`${stats.ordersWithTime} comenzi măsurate`}
            icon={<span>⏱️</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Sub 3 min"
            value={stats.ordersWithTime > 0 ? `${((stats.under3Min / stats.ordersWithTime) * 100).toFixed(1)}%` : 'N/A'}
            helper={`${stats.under3Min} din ${stats.ordersWithTime}`}
            icon={<span>✅</span>}
          />
        </Col>
      </Row>

      {/* Filtre */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Toate</option>
                <option value="pending">în așteptare</option>
                <option value="preparing">în preparare</option>
                <option value="ready">Gata</option>
                <option value="completed">Finalizat</option>
                <option value="served">Servit</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Bandă</Form.Label>
              <Form.Select value={filterLane} onChange={(e) => setFilterLane(e.target.value)}>
                <option value="all">Toate</option>
                {lanes.map(lane => (
                  <option key={lane} value={lane}>{lane}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>De la</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Col>
            <Col md={3}>
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
                  placeholder="cauta dupa numar masina banda id comanda"
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
                    <th>Bandă</th>
                    <th>Număr Mașină</th>
                    <th>Produse</th>
                    <th>Total</th>
                    <th>Timp Total</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">"nu exista comenzi drive thru"</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.timestamp).toLocaleString('ro-RO')}</td>
                        <td><Badge bg="warning">{order.lane_number || 'N/A'}</Badge></td>
                        <td>{order.car_plate || 'N/A'}</td>
                        <td>{order.items?.length || 0} produs(e)</td>
                        <td><strong>{order.total.toFixed(2)} RON</strong></td>
                        <td>{calculateTime(order)}</td>
                        <td>
                          <Badge bg={order.status === 'completed' || order.status === 'served' ? 'success' : 'warning'}>
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
                            <i className="fas fa-eye"></i>"Detalii"</Button>
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
          <Modal.Title>Detalii Comandă Drive-Thru #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong>' '
                  <Badge bg={selectedOrder.status === 'completed' ? 'success' : 'warning'}>
                    {selectedOrder.status}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>"Bandă:"</strong> <Badge bg="warning">{selectedOrder.lane_number || 'N/A'}</Badge>
                </Col>
              </Row>

              <h6 className="mt-4">"informatii masina"</h6>
              <p><strong>"numar masina"</strong> {selectedOrder.car_plate || 'N/A'}</p>
              {selectedOrder.customer_phone && (
                <p><strong>Telefon:</strong> {selectedOrder.customer_phone}</p>
              )}

              {selectedOrder.arrived_at && selectedOrder.served_at && (
                <>
                  <h6 className="mt-4">Timpi</h6>
                  <p><strong>Sosit:</strong> {new Date(selectedOrder.arrived_at).toLocaleString('ro-RO')}</p>
                  <p><strong>Servit:</strong> {new Date(selectedOrder.served_at).toLocaleString('ro-RO')}</p>
                  <p><strong>Timp total:</strong> {calculateTime(selectedOrder)}</p>
                </>
              )}

              <h6 className="mt-4">Produse</h6>
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Cantitate</th>
                    <th>"Preț"</th>
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
              <p><strong>"Metodă:"</strong> {selectedOrder.payment_method}</p>
              <p><strong>Status:</strong> {selectedOrder.is_paid ? '✅ Plătit' : '❌ Neplătit'}</p>
              {selectedOrder.fiscal_receipt_printed && (
                <p><strong>Bon fiscal:</strong> ✅ Printat</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>"Închide"</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};




