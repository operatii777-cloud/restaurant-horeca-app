// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Form, Modal, Tabs, Tab, Row, Col, InputGroup, Table } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { StatCard } from '@/shared/components/StatCard';
import './DeliveryOrdersPage.css';

interface DeliveryOrder {
  id: number;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  platform: string;
  order_source: string;
  payment_method: string;
  total: number;
  status: string;
  timestamp: string;
  items: any[];
  courier_name?: string;
  courier_phone?: string;
  delivery_status?: string;
  is_paid?: boolean;
  car_plate?: string;
  lane_number?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  fiscal_receipt_printed?: boolean;
  fiscal_receipt_number?: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  glovo: 'ðŸšš',
  wolt: 'ðŸ“±',
  bolt_food: 'ðŸ´',
  friendsride: 'ðŸš—',
  tazz: 'âš¡',
  phone: 'ðŸ“ž',
  online: 'ðŸŒ',
  pos: 'ðŸ’°'
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  DELIVERY: 'Delivery',
  DRIVE_THRU: 'Drive-Thru',
  TAKEOUT: 'Takeaway'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  preparing: 'info',
  ready: 'success',
  completed: 'success',
  in_transit: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  paid: 'success'
};

export const DeliveryOrdersPage: React.FC = () => {
//   const { t } = useTranslation();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | "Delivery" | 'drivethru' | 'takeaway'>('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh la 30 secunde
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await httpClient.get<{ data: DeliveryOrder[] }>(
        `/api/orders-delivery?${params.toString()}`
      );
      
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filtru dupÄƒ tip (delivery, drive-thru, takeaway)
    if (activeTab !== 'all') {
      const sourceMap: Record<string, string> = {
        delivery: 'DELIVERY',
        drivethru: 'DRIVE_THRU',
        takeaway: 'TAKEOUT'
      };
      filtered = filtered.filter(o => o.order_source === sourceMap[activeTab]);
    }

    // Filtru dupÄƒ status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    // Filtru dupÄƒ platform
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(o => o.platform === filterPlatform);
    }

    // CÄƒutare
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.customer_name?.toLowerCase().includes(query) ||
        o.customer_phone?.includes(query) ||
        o.delivery_address?.toLowerCase().includes(query) ||
        o.order_number?.includes(query) ||
        o.id.toString().includes(query)
      );
    }

    return filtered;
  }, [orders, activeTab, filterStatus, filterPlatform, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === "Pending:" || o.status === 'preparing').length;
    const inTransit = orders.filter(o => o.status === "ÃŽn Transit" || o.delivery_status === "ÃŽn Transit").length;
    const delivered = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingValue = orders
      .filter(o => o.status === "Pending:" || o.status === 'preparing')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return { total, pending, inTransit, delivered, totalValue, pendingValue };
  }, [orders]);

  const openDetails = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleMarkDelivered = async (orderId: number) => {
    try {
      await httpClient.put(`/api/orders/${orderId}/deliver`, {});
      await fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      console.error('Error marking as delivered:', err);
      alert('Eroare la marcarea comenzii ca livratÄƒ');
    }
  };

  const handleMarkPaid = async (orderId: number) => {
    try {
      await httpClient.put(`/api/orders/${orderId}/mark-paid`, {});
      await fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert('Eroare la marcarea comenzii ca plÄƒtitÄƒ');
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder || !cancelReason) return;

    try {
      await httpClient.post(`/api/orders/${selectedOrder.id}/cancel`, {
        reason: cancelReason
      });
      await fetchOrders();
      setShowCancelModal(false);
      setShowDetailsModal(false);
      setCancelReason('');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Eroare la anularea comenzii');
    }
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

  const printReceipt = async (orderId: number) => {
    try {
      await httpClient.post(`/api/admin/pos/fiscalize`, { orderId });
      await fetchOrders();
      alert('Bon fiscal trimis la imprimantÄƒ');
    } catch (err) {
      console.error('Error printing receipt:', err);
      alert('Eroare la printarea bonului fiscal');
    }
  };

  const platforms = useMemo(() => {
    const unique = Array.from(new Set(orders.map(o => o.platform).filter(Boolean)));
    return unique;
  }, [orders]);

  const handleCreateOrder = () => {
    // NavigheazÄƒ la POS pentru creare comandÄƒ nouÄƒ delivery
    window.location.href = '/kiosk/pos-split?type=delivery';
  };

  return (
    <div className="delivery-orders-page">
      <div className="page-header">
        <h1><i className="fas fa-truck me-2"></i>"comenzi delivery"</h1>
        <div className="header-actions">
          <Button variant="success" onClick={handleCreateOrder} className="me-2">
            <i className="fas fa-plus me-1"></i>"comanda noua"</Button>
          <Button variant="primary" onClick={fetchOrders} disabled={loading}>
            <i className="fas fa-sync-alt me-1"></i>ReÃ®mprospÄƒteazÄƒ</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <StatCard
            title="Total Comenzi"
            value={stats.total.toString()}
            helper={`Valoare: ${stats.totalValue.toFixed(2)} RON`}
            icon={<span>ðŸ“¦</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="ÃŽn AÈ™teptare"
            value={stats.pending.toString()}
            helper={`Valoare: ${stats.pendingValue.toFixed(2)} RON`}
            icon={<span>Ã¢ÂÂ³</span>}
            trendDirection={stats.pending > 0 ? 'up' : 'flat'}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="ÃŽn Tranzit"
            value={stats.inTransit.toString()}
            helper="Comenzi Ã®n livrare"
            icon={<span>ðŸšš</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Livrate"
            value={stats.delivered.toString()}
            helper="Comenzi finalizate"
            icon={<span>âœ…</span>}
          />
        </Col>
      </Row>

      {/* Filtre È™i CÄƒutare */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Label>Tip ComandÄƒ</Form.Label>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k as any)}
                className="mb-0"
              >
                <Tab eventKey="all" title="Toate" />
                <Tab eventKey="delivery" title='ðŸšš delivery' />
                <Tab eventKey="drivethru" title="ðŸš— Drive-Thru" />
                <Tab eventKey="takeaway" title="ðŸ“¦ Takeaway" />
              </Tabs>
            </Col>
            <Col md={2}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Toate</option>
                <option value="pending">Ã®n aÈ™teptare</option>
                <option value="preparing">Ã®n preparare</option>
                <option value="ready">Gata</option>
                <option value="ÃŽn Tranzit">"in tranzit"</option>
                <option value="delivered">Livrat</option>
                <option value="completed">Finalizat</option>
                <option value="cancelled">Anulat</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>PlatformÄƒ</Form.Label>
              <Form.Select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
                <option value="all">Toate</option>
                {platforms.map(p => (
                  <option key={p} value={p}>
                    {PLATFORM_icons[p] || 'ðŸ“±'} {p}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>De la</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Label>PÃ¢nÄƒ la</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Col>
            <Col md={1}>
              <Form.Label>&nbsp;</Form.Label>
              <Button
                variant="outline-secondary"
                onClick={() => setDateRange({ start: '', end: '' })}
                className="w-100"
              >
                <i className="fas fa-times"></i>
              </Button>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={12}>
              <InputGroup>
                <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="cauta dupa nume telefon adresa numar comanda"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista Comenzi */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se Ã®ncarcÄƒ...</span>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
            <p className="text-muted">"nu exista comenzi care sa corespunda filtrelor sel"</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <Card key={order.id} className="order-card" onClick={() => openDetails(order)}>
              <Card.Body>
                <div className="order-header">
                  <div>
                    <h5 className="mb-1">
                      #{order.id} {order.order_number && `(${order.order_number})`}
                    </h5>
                    <Badge bg={STATUS_COLORS[order.status] || 'secondary'} className="me-2">
                      {order.status}
                    </Badge>
                    <Badge bg="info" className="me-2">
                      {ORDER_TYPE_LABELS[order.order_source] || order.order_source}
                    </Badge>
                    {order.platform && (
                      <Badge bg="light" text="dark">
                        {PLATFORM_ICONS[order.platform] || 'ðŸ“±'} {order.platform}
                      </Badge>
                    )}
                  </div>
                  <div className="order-total">
                    <strong>{order.total.toFixed(2)} RON</strong>
                  </div>
                </div>

                <div className="order-info mt-3">
                  <div className="info-row">
                    <i className="fas fa-user me-2"></i>
                    <span>{order.customer_name || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <i className="fas fa-phone me-2"></i>
                    <span>{order.customer_phone}</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        callCustomer(order.customer_phone);
                      }}
                    >
                      <i className="fas fa-phone"></i>
                    </Button>
                  </div>
                  {order.delivery_address && (
                    <div className="info-row">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      <span className="text-truncate">{order.delivery_address}</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMaps(order.delivery_address!);
                        }}
                      >
                        <i className="fas fa-map"></i>
                      </Button>
                    </div>
                  )}
                  {order.car_plate && (
                    <div className="info-row">
                      <i className="fas fa-car me-2"></i>
                      <span>MaÈ™inÄƒ: {order.car_plate} {order.lane_number && `(Lane ${order.lane_number})`}</span>
                    </div>
                  )}
                  {order.courier_name && (
                    <div className="info-row">
                      <i className="fas fa-motorcycle me-2"></i>
                      <span>Curier: {order.courier_name}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <i className="fas fa-credit-card me-2"></i>
                    <span>PlatÄƒ: {order.payment_method} {order.is_paid && 'âœ…'}</span>
                  </div>
                  <div className="info-row">
                    <i className="fas fa-clock me-2"></i>
                    <span>{new Date(order.timestamp).toLocaleString('ro-RO')}</span>
                  </div>
                </div>

                <div className="order-items mt-3">
                  <small className="text-muted">
                    {order.items?.length || 0} produs(e)
                  </small>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Detalii ComandÄƒ */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Detalii ComandÄƒ #{selectedOrder?.id}
            {selectedOrder?.order_number && ` (${selectedOrder.order_number})`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong>' '
                  <Badge bg={STATUS_COLORS[selectedOrder.status] || 'secondary'}>
                    {selectedOrder.status}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Tip:</strong>' '
                  <Badge bg="info">
                    {ORDER_TYPE_LABELS[selectedOrder.order_source] || selectedOrder.order_source}
                  </Badge>
                </Col>
              </Row>

              <h6 className="mt-4">"informatii client"</h6>
              <p><strong>"Nume:"</strong> {selectedOrder.customer_name || 'N/A'}</p>
              <p>
                <strong>Telefon:</strong> {selectedOrder.customer_phone}' '
                <Button variant="link" size="sm" onClick={() => callCustomer(selectedOrder.customer_phone)}>
                  <i className="fas fa-phone"></i>"SunÄƒ"</Button>
              </p>
              {selectedOrder.delivery_address && (
                <p>
                  <strong>"AdresÄƒ:"</strong> {selectedOrder.delivery_address}' '
                  <Button variant="link" size="sm" onClick={() => openMaps(selectedOrder.delivery_address!)}>
                    <i className="fas fa-map"></i> Maps
                  </Button>
                  <Button variant="link" size="sm" onClick={() => openWaze(selectedOrder.delivery_address!)}>
                    <i className="fas fa-map-marked-alt"></i> Waze
                  </Button>
                </p>
              )}

              {selectedOrder.car_plate && (
                <>
                  <h6 className="mt-4">Drive-Thru</h6>
                  <p><strong>"numar masina"</strong> {selectedOrder.car_plate}</p>
                  {selectedOrder.lane_number && (
                    <p><strong>"Lane:"</strong> {selectedOrder.lane_number}</p>
                  )}
                </>
              )}

              {selectedOrder.courier_name && (
                <>
                  <h6 className="mt-4">Curier</h6>
                  <p><strong>"Nume:"</strong> {selectedOrder.courier_name}</p>
                  {selectedOrder.courier_phone && (
                    <p>
                      <strong>Telefon:</strong> {selectedOrder.courier_phone}' '
                      <Button variant="link" size="sm" onClick={() => callCustomer(selectedOrder.courier_phone!)}>
                        <i className="fas fa-phone"></i>"SunÄƒ"</Button>
                    </p>
                  )}
                </>
              )}

              <h6 className="mt-4">Produse</h6>
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Cantitate</th>
                    <th>"PreÈ›"</th>
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

              <h6 className="mt-4">PlatÄƒ</h6>
              <p><strong>"MetodÄƒ:"</strong> {selectedOrder.payment_method}</p>
              <p><strong>Status:</strong> {selectedOrder.is_paid ? 'âœ… PlÄƒtit' : 'âŒ NeplÄƒtit'}</p>
              {selectedOrder.fiscal_receipt_printed && (
                <p>
                  <strong>Bon fiscal:</strong> {selectedOrder.fiscal_receipt_number || 'Printat'} âœ…
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder && (
            <>
              {!selectedOrder.is_paid && (
                <Button variant="success" onClick={() => handleMarkPaid(selectedOrder.id)}>
                  <i className="fas fa-check me-1"></i>"marcheaza platit"</Button>
              )}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'completed' && (
                <Button variant="primary" onClick={() => handleMarkDelivered(selectedOrder.id)}>
                  <i className="fas fa-truck me-1"></i>"marcheaza livrat"</Button>
              )}
              {!selectedOrder.fiscal_receipt_printed && (
                <Button variant="info" onClick={() => printReceipt(selectedOrder.id)}>
                  <i className="fas fa-print me-1"></i>"printeaza bon"</Button>
              )}
              {selectedOrder.status !== 'cancelled' && (
                <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                  <i className="fas fa-times me-1"></i>"AnuleazÄƒ"</Button>
              )}
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>"ÃŽnchide"</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Anulare */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>AnuleazÄƒ ComandÄƒ #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>"motiv anulare"</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="introduceti motivul anularii"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>"RenunÈ›Äƒ"</Button>
          <Button variant="danger" onClick={handleCancel} disabled={!cancelReason}>"anuleaza comanda"</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};





