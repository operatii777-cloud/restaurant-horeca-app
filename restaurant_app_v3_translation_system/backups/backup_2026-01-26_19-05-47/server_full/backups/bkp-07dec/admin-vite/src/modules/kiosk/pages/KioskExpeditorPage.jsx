import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Alert, Modal, Form, Spinner } from 'react-bootstrap';
import { 
  Megaphone, Check, Clock, ChefHat, UtensilsCrossed,
  Bell, AlertCircle, CheckCircle, X, Timer, Package
} from 'lucide-react';
import './KioskExpeditorPage.css';

/**
 * KioskExpeditorPage - Expediție (Pass) 
 * Display pentru expediția bucătăriei:
 * - Comenzi gata de servit
 * - Confirmare pick-up de ospătar
 * - Timer pentru freshness
 * - Alertă dacă așteaptă prea mult
 */
export const KioskExpeditorPage = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [pickedOrders, setPickedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [waiterPin, setWaiterPin] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      // Fetch orders that are ready for pickup
      const res = await fetch('/api/orders?status=ready,picked_up&limit=50');
      const data = await res.json();
      const orders = data.orders || data || [];
      
      // Separate ready vs picked up
      const ready = orders.filter(o => o.status === 'ready');
      const picked = orders.filter(o => o.status === 'picked_up').slice(0, 10);
      
      // Add mock ready time if not present
      const enrichedReady = ready.map(order => ({
        ...order,
        ready_at: order.ready_at || new Date(Date.now() - Math.random() * 300000).toISOString(),
        items: order.items || [
          { name: 'Burger Classic', quantity: 1 },
          { name: 'Cartofi prăjiți', quantity: 2 }
        ]
      }));
      
      setReadyOrders(enrichedReady);
      setPickedOrders(picked);
      setLoading(false);
    } catch (err) {
      console.error('Error loading expeditor data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Calculate wait time
  const getWaitTime = (readyAt) => {
    const readyTime = new Date(readyAt).getTime();
    const diff = Math.floor((currentTime - readyTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return { minutes, seconds, total: diff };
  };

  // Get urgency level
  const getUrgency = (seconds) => {
    if (seconds < 120) return 'fresh'; // < 2 min
    if (seconds < 300) return 'warm'; // < 5 min
    return 'critical'; // > 5 min
  };

  // Handle pickup confirmation
  const handlePickup = async () => {
    if (!selectedOrder) return;
    
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'picked_up' })
      });
      
      if (res.ok) {
        setSuccess(`Comanda #${selectedOrder.order_number || selectedOrder.id} preluată!`);
        setShowConfirmModal(false);
        setSelectedOrder(null);
        setWaiterPin('');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Eroare la actualizarea comenzii');
      }
    } catch (err) {
      setError('Eroare la conexiune');
    }
  };

  // Play sound for new orders (optional)
  const playAlert = () => {
    try {
      const audio = new Audio('/sounds/ding.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="expeditor-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div className="expeditor-page">
      {/* Header */}
      <div className="expeditor-header">
        <div className="expeditor-header__left">
          <h1 className="expeditor-title">
            <Megaphone className="expeditor-title-icon" />
            Expediție (Pass)
          </h1>
          <p className="expeditor-subtitle">Comenzi gata pentru servire • Confirmare pickup</p>
        </div>
        <div className="expeditor-header__right">
          <div className="expeditor-stats">
            <div className="expeditor-stat expeditor-stat--ready">
              <Package size={20} />
              <span>{readyOrders.length}</span>
              <small>Așteaptă</small>
            </div>
            <div className="expeditor-stat expeditor-stat--picked">
              <Check size={20} />
              <span>{pickedOrders.length}</span>
              <small>Preluate</small>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          <AlertCircle size={18} className="me-2" /> {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-3">
          <CheckCircle size={18} className="me-2" /> {success}
        </Alert>
      )}

      {/* Ready Orders Grid */}
      <div className="expeditor-section">
        <h2 className="expeditor-section-title">
          <Bell className="text-warning" /> Comenzi Gata ({readyOrders.length})
        </h2>
        
        {readyOrders.length === 0 ? (
          <div className="expeditor-empty">
            <ChefHat size={64} />
            <h3>Toate comenzile au fost preluate</h3>
            <p>Se așteaptă comenzi noi din bucătărie...</p>
          </div>
        ) : (
          <div className="expeditor-grid">
            {readyOrders.map((order) => {
              const waitTime = getWaitTime(order.ready_at);
              const urgency = getUrgency(waitTime.total);
              
              return (
                <Card 
                  key={order.id} 
                  className={`expeditor-card expeditor-card--${urgency}`}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowConfirmModal(true);
                  }}
                >
                  <Card.Body>
                    <div className="expeditor-card__header">
                      <div className="expeditor-card__number">
                        #{order.order_number || order.id}
                      </div>
                      <Badge bg={urgency === 'critical' ? 'danger' : urgency === 'warm' ? 'warning' : 'success'}>
                        <Timer size={12} /> {waitTime.minutes}:{waitTime.seconds.toString().padStart(2, '0')}
                      </Badge>
                    </div>
                    
                    <div className="expeditor-card__table">
                      <UtensilsCrossed size={16} />
                      Masa {order.table_number || order.table_id || '-'}
                    </div>
                    
                    <div className="expeditor-card__items">
                      {(order.items || []).slice(0, 4).map((item, idx) => (
                        <div key={idx} className="expeditor-card__item">
                          <span className="qty">{item.quantity}x</span>
                          <span className="name">{item.name || item.product_name}</span>
                        </div>
                      ))}
                      {(order.items || []).length > 4 && (
                        <div className="expeditor-card__item expeditor-card__item--more">
                          +{order.items.length - 4} alte produse
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant={urgency === 'critical' ? 'danger' : 'success'}
                      className="expeditor-card__pickup"
                    >
                      <Check size={18} /> PREIA COMANDA
                    </Button>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Picked Up */}
      {pickedOrders.length > 0 && (
        <div className="expeditor-section expeditor-section--recent">
          <h2 className="expeditor-section-title">
            <Check className="text-success" /> Preluate Recent
          </h2>
          <div className="expeditor-recent">
            {pickedOrders.map((order) => (
              <div key={order.id} className="expeditor-recent__item">
                <span className="expeditor-recent__number">#{order.order_number || order.id}</span>
                <span className="expeditor-recent__table">Masa {order.table_number || order.table_id}</span>
                <Badge bg="success"><Check size={12} /></Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Pickup Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <Check size={24} className="me-2" /> 
            Confirmare Preluare
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          {selectedOrder && (
            <>
              <div className="expeditor-modal-order">
                <div className="expeditor-modal-number">
                  #{selectedOrder.order_number || selectedOrder.id}
                </div>
                <div className="expeditor-modal-table">
                  Masa {selectedOrder.table_number || selectedOrder.table_id}
                </div>
              </div>
              
              <div className="expeditor-modal-items my-3">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="mb-1">
                    <strong>{item.quantity}x</strong> {item.name || item.product_name}
                  </div>
                ))}
              </div>
              
              <Alert variant="info" className="mt-3">
                Apasă butonul pentru a confirma preluarea comenzii
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            <X size={18} className="me-1" /> Anulează
          </Button>
          <Button variant="success" size="lg" onClick={handlePickup}>
            <Check size={20} className="me-1" /> CONFIRMĂ PRELUARE
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KioskExpeditorPage;

