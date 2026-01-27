// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Form, Modal, Table, Row, Col, InputGroup } from 'react-bootstrap';
import { X, Package, CreditCard, MapPin, Phone, Mail, User, Clock, Check } from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import { StatCard } from '@/shared/components/StatCard';
import { formatTimestamp } from '@/modules/orders/utils/orderHelpers';
import './OrdersHistoryPage.css';

interface Order {
  id: number;
  order_number?: string;
  table_number?: number;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  order_source: string;
  type: string;
  platform?: string;
  payment_method: string;
  total: number;
  status: string;
  timestamp: string;
  items: any[];
  car_plate?: string;
  lane_number?: string;
  is_paid?: boolean;
}

const ORDER_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  DINE_IN: { label: 'DINE-IN', icon: '🍽️', color: 'secondary' },
  TAKEOUT: { label: 'TAKEAWAY', icon: '📦', color: 'success' },
  DELIVERY: { label: 'DELIVERY', icon: '🚚', color: 'primary' },
  DRIVE_THRU: { label: 'DRIVE-THRU', icon: '🚗', color: 'warning' },
};

const PLATFORM_ICONS: Record<string, string> = {
  glovo: '🚚',
  wolt: '📱',
  bolt_food: '🍴',
  friendsride: '🚗',
  tazz: '⚡',
  phone: '📞',
  online: '🌐',
  pos: '💰',
  delivery: '🚚',
  drive_thru: '🚗'
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

export const OrdersHistoryPage: React.FC = () => {
//   const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOrderSource, setFilterOrderSource] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(50);

  useEffect(() => {
    fetchOrders();
  }, [dateRange, currentPage]);

  // NU mai prevenim scroll-ul paginii - fără overlay, pagină rămâne interactivă
  // useEffect pentru scroll a fost eliminat - pagină poate face scroll când modalul este deschis

  // Închide modalul la apăsarea tastei Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetailsModal) {
        setShowDetailsModal(false);
      }
    };
    
    if (showDetailsModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDetailsModal]);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      params.append('limit', '1000'); // Get more orders for filtering
      
      const response = await httpClient.get<{ data?: Order[]; orders?: Order[] }>(
        `/api/orders-delivery?${params.toString()}`
      );
      
      // Suport pentru ambele formate (data sau orders)
      if (response.data) {
        const ordersData = response.data.data || response.data.orders || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filtru după order_source
    if (filterOrderSource !== 'all') {
      filtered = filtered.filter(o => o.order_source === filterOrderSource);
    }

    // Filtru după type
    if (filterType !== 'all') {
      const typeMap: Record<string, string[]> = {
        dine_in: ['dine_in', "Restaurant"],
        takeaway: ['takeout', 'takeaway'],
        delivery: ["Livrare"],
        drive_thru: ['drive_thru', 'drive-thru']
      };
      const types = typeMap[filterType] || [];
      filtered = filtered.filter(o => types.includes(o.type?.toLowerCase() || ''));
    }

    // Filtru după status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    // Filtru după platform (suportă și delivery/drive_thru ca order_source)
    if (filterPlatform !== 'all') {
      if (filterPlatform === "Delivery") {
        filtered = filtered.filter(o => 
          o.platform === "Delivery" || 
          o.order_source === 'DELIVERY' || 
          o.type === "Delivery"
        );
      } else if (filterPlatform === 'drive_thru') {
        filtered = filtered.filter(o => 
          o.platform === 'drive_thru' || 
          o.order_source === 'DRIVE_THRU' || 
          o.type === 'drive_thru' || 
          o.type === 'drive-thru'
        );
      } else if (filterPlatform === 'pos') {
        filtered = filtered.filter(o => 
          o.platform === 'pos' || 
          o.order_source === 'POS' || 
          o.order_source === 'KIOSK' || 
          o.order_source === 'QR'
        );
      } else {
        filtered = filtered.filter(o => o.platform === filterPlatform);
      }
    }

    // Căutare
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.customer_name?.toLowerCase().includes(query) ||
        o.customer_phone?.includes(query) ||
        o.delivery_address?.toLowerCase().includes(query) ||
        o.order_number?.includes(query) ||
        o.id.toString().includes(query) ||
        o.table_number?.toString().includes(query) ||
        o.car_plate?.toLowerCase().includes(query)
      );
    }

    // Sortare după dată (cel mai recent primul)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filtered;
  }, [orders, filterOrderSource, filterType, filterStatus, filterPlatform, searchQuery]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage, pageSize]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const bySource = filteredOrders.reduce((acc, o) => {
      const source = o.order_source || 'UNKNOWN';
        acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byType = filteredOrders.reduce((acc, o) => {
      const type = o.type?.toLowerCase() || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalValue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return { total, bySource, byType, totalValue };
  }, [filteredOrders]);

  const platforms = useMemo(() => {
    const unique = Array.from(new Set(orders.map(o => o.platform).filter(Boolean)));
    return unique;
  }, [orders]);

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getOrderTypeInfo = (order: Order) => {
    const source = order.order_source || 'UNKNOWN';
    const typeInfo = ORDER_TYPE_labels[source] || { label: source, icon: '📋', color: 'secondary' };
    return typeInfo;
  };

  const getOrderDisplayInfo = (order: Order) => {
    if (order.order_source === 'DRIVE_THRU') {
      return `🚗 ${order.car_plate || 'N/A'} ${order.lane_number ? `(Lane ${order.lane_number})` : ''}`;
    }
    if (order.order_source === 'DELIVERY') {
      return `🚚 ${order.delivery_address || 'N/A'}`;
    }
    if (order.order_source === 'TAKEOUT' || order.type === 'takeout' || order.type === 'takeaway') {
      return `📦 ${order.customer_name || 'Takeaway'}`;
    }
    if (order.table_number) {
      return `🍽️ Masa ${order.table_number}`;
    }
    return 'N/A';
  };

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  return (
    <div className="orders-history-page">
      <div className="page-header">
        <h1><i className="fas fa-history me-2"></i>Istoric Comenzi</h1>
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
            icon={<span>📦</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Dine-In"
            value={String(stats.bySource['POS'] || stats.bySource['KIOSK'] || stats.bySource['QR'] || '0')}
            helper="Comenzi restaurant"
            icon={<span>🍽️</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Delivery"
            value={stats.bySource['DELIVERY']?.toString() || '0'}
            helper="Comenzi livrare"
            icon={<span>🚚</span>}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Drive-Thru"
            value={stats.bySource['DRIVE_THRU']?.toString() || '0'}
            helper="Comenzi drive-thru"
            icon={<span>🚗</span>}
          />
        </Col>
      </Row>

      {/* Filtre */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={2}>
              <Form.Label>"tip sursa"</Form.Label>
              <Form.Select value={filterOrderSource} onChange={(e) => setFilterOrderSource(e.target.value)}>
                <option value="all">Toate</option>
                <option value="POS">POS</option>
                <option value="KIOSK">KIOSK</option>
                <option value="QR">QR</option>
                <option value="DELIVERY">Delivery</option>
                <option value="DRIVE_THRU">Drive-Thru</option>
                <option value="TAKEOUT">Takeaway</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Tip Consum</Form.Label>
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">Toate</option>
                <option value="dine_in">Dine-In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">"Delivery"</option>
                <option value="drive_thru">Drive-Thru</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Toate</option>
                <option value="pending">în așteptare</option>
                <option value="preparing">în preparare</option>
                <option value="ready">Gata</option>
                <option value="completed">Finalizat</option>
                <option value="delivered">Livrat</option>
                <option value="paid">Plătit</option>
                <option value="cancelled">Anulat</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Platformă</Form.Label>
              <Form.Select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
                <option value="all">Toate</option>
                <option value="delivery">🚚 Delivery</option>
                <option value="drive_thru">🚗 Drive-Thru</option>
                <option value="pos">💰 POS</option>
                {platforms.filter(p => p !== 'pos' && p !== "Delivery" && p !== 'drive_thru').map(p => (
                  <option key={p} value={p}>
                    {PLATFORM_icons[p] || '📱'} {p}
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
                  placeholder="cauta dupa id nume telefon adresa masa numar masin"
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

      {/* Tabel Comenzi */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">"se incarca"</span>
          </div>
        </div>
      ) : (
        <>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Dată/Ora</th>
                      <th>Tip</th>
                      <th>Masa/Adresă/Client</th>
                      <th>Produse</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>"Acțiuni"</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5">
                          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                          <p className="text-muted">"nu exista comenzi care sa corespunda filtrelor sel"</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map(order => {
                        const typeInfo = getOrderTypeInfo(order);
                        return (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{new Date(order.timestamp).toLocaleString('ro-RO')}</td>
                            <td>
                              <Badge bg={typeInfo.color}>
                                {typeInfo.icon} {typeInfo.label}
                              </Badge>
                              {order.platform && (
                                <Badge bg="light" text="dark" className="ms-1">
                                  {PLATFORM_ICONS[order.platform] || '📱'} {order.platform}
                                </Badge>
                              )}
                            </td>
                            <td>{getOrderDisplayInfo(order)}</td>
                            <td>{order.items?.length || 0} produs(e)</td>
                            <td><strong>{order.total.toFixed(2)} RON</strong></td>
                            <td>
                              <Badge bg={STATUS_COLORS[order.status] || 'secondary'}>
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
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Paginare */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Afișare {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredOrders.length)} din {filteredOrders.length} comenzi
                    </small>
                  </div>
                  <div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <i className="fas fa-chevron-left"></i> Anterior
                    </Button>
                    <span className="mx-2">
                      Pagina {currentPage} din {totalPages}
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >"Următor"<i className="fas fa-chevron-right"></i>
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Modal Detalii - Design Clasic */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="xl"
        centered
        scrollable
        className="order-details-modal-classic"
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
                <Badge bg={STATUS_COLORS[selectedOrder.status] || 'secondary'} className="me-2">
                  {selectedOrder.status?.toUpperCase() || 'N/A'}
                </Badge>
                {(() => {
                  const typeInfo = getOrderTypeInfo(selectedOrder);
                  return (
                    <Badge bg={typeInfo.color} className="me-2">
                      {typeInfo.icon} {typeInfo.label}
                    </Badge>
                  );
                })()}
                <Badge bg="light" text="dark">
                  <Clock size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                  {formatTimestamp(selectedOrder.timestamp)}
                </Badge>
              </div>

              {/* Informații Client */}
              {(selectedOrder.customer_name || selectedOrder.customer_phone || selectedOrder.delivery_address || selectedOrder.table_number || selectedOrder.car_plate) && (
                <Card className="mb-3">
                  <Card.Header>
                    <strong>
                      <User size={16} className="me-2" style={{ verticalAlign: 'middle' }} />"informatii client"</strong>
                  </Card.Header>
                  <Card.Body>
                    {selectedOrder.customer_name && (
                      <p className="mb-2">
                        <User size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }} />
                        <strong>"Nume:"</strong> {selectedOrder.customer_name}
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
                        <strong>"Adresă:"</strong> {selectedOrder.delivery_address}
                      </p>
                    )}
                    {selectedOrder.table_number && (
                      <p className="mb-2">
                        <MapPin size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }} />
                        <strong>"Masă:"</strong> {selectedOrder.table_number}
                      </p>
                    )}
                    {selectedOrder.car_plate && (
                      <p className="mb-0">
                        <MapPin size={16} className="me-2 text-muted" style={{ verticalAlign: 'middle' }} />
                        <strong>"numar masina"</strong> {selectedOrder.car_plate}
                        {selectedOrder.lane_number && ` (Lane ${selectedOrder.lane_number})`}
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
                        <th className="text-end">"Preț"</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td>{item.name || item.product_name || 'N/A'}</td>
                          <td className="text-center">{item.quantity || 1}</td>
                          <td className="text-end">{(item.price || item.unit_price || 0).toFixed(2)} RON</td>
                          <td className="text-end">
                            <strong>{((item.quantity || 1) * (item.price || item.unit_price || 0)).toFixed(2)} RON</strong>
                          </td>
                        </tr>
                      ))}
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
                    <span><strong>"Metodă:"</strong></span>
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
                    <span className="fs-5"><strong>{selectedOrder.total.toFixed(2)} RON</strong></span>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>"Închide"</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};






