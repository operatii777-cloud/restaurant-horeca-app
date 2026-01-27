import { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, InputGroup, Badge, Alert } from 'react-bootstrap';
import { KioskPaymentsModal } from './KioskPaymentsModal';
import { KioskFiscalModal } from './KioskFiscalModal';
import { getOrder, cancelOrder } from '../api/KioskApi';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const KioskCartModal = ({
  show,
  onHide,
  items,
  totals,
  onRemove,
  onIncrement,
  onDecrement,
  onUpdateNotes,
  onSave,
  orderId,
  tableId,
  session,
  onOrderCancelled,
}) => {
  const navigate = useNavigate();
  const [showPayments, setShowPayments] = useState(false);
  const [showFiscal, setShowFiscal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [order, setOrder] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Verifică statusul comenzii pentru a vedea dacă este plătită
  useEffect(() => {
    if (show && orderId) {
      loadOrderStatus();
    }
  }, [show, orderId]);

  const loadOrderStatus = async () => {
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
      setIsPaid(orderData.is_paid === 1 || orderData.is_paid === true);
    } catch (err) {
      console.error('❌ Eroare la încărcarea statusului comenzii:', err);
    }
  };

  const handleSendOrder = async () => {
    try {
      await onSave();
      alert('Comanda a fost trimisă către bar și bucătărie!');
      onHide();
    } catch (err) {
      console.error('❌ Eroare la trimiterea comenzii:', err);
      alert('Nu s-a putut trimite comanda. Încearcă din nou.');
    }
  };

  const handleMarkAsPaid = () => {
    // Deschide modulul de plăți pentru a procesa efectiv plata
    if (!orderId) {
      alert('Nu există comandă activă. Salvează mai întâi comanda.');
      return;
    }
    setShowPayments(true);
  };

  const handlePaymentComplete = () => {
    // După plată completă, închide modalul de plăți și deschide fiscalizarea
    setShowPayments(false);
    setShowFiscal(true);
    // Reîncarcă statusul comenzii
    loadOrderStatus();
  };

  const handleFiscalComplete = () => {
    // După fiscalizare, închide totul și reîncarcă statusul
    setShowFiscal(false);
    loadOrderStatus();
    onHide();
  };

  const handleCloseTable = () => {
    if (!orderId) {
      alert('Nu există comandă activă pentru această masă.');
      return;
    }
    // Verifică dacă comanda este plătită și servită
    // Această logică va fi implementată în backend
    if (window.confirm('Sigur vrei să închizi masa? Verifică că totul este plătit și servit.')) {
      // TODO: Implementare închidere masă
      alert('Masa a fost închisă.');
      onHide();
    }
  };

  const handleCancelOrder = () => {
    if (!orderId) {
      alert('Nu există comandă activă pentru a anula.');
      return;
    }
    // Deschide modalul pentru motiv anulare
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderId) return;
    
    setCancelling(true);
    try {
      await cancelOrder(orderId, cancelReason || 'Anulată din KIOSK');
      alert('Comanda a fost anulată cu succes.');
      setShowCancelModal(false);
      setCancelReason('');
      onHide();
      // Navighează înapoi la planul meselor sau reîncarcă pagina
      if (onOrderCancelled) {
        onOrderCancelled();
      } else {
        navigate('/kiosk/tables');
      }
    } catch (err) {
      console.error('❌ Eroare la anularea comenzii:', err);
      alert('Nu s-a putut anula comanda. Încearcă din nou.');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order && ['pending', 'preparing'].includes(order.status) && !isPaid;

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered className="kiosk-cart-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-shopping-cart me-2"></i>Coș Comandă - Masa {tableId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {items.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
              <p className="text-muted">Coșul este gol</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Produs</th>
                      <th>Cantitate</th>
                      <th>Preț</th>
                      <th>Total</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <strong>{item.product_name}</strong>
                            {item.notes && (
                              <div>
                                <small className="text-muted">
                                  <i className="fas fa-sticky-note me-1"></i>
                                  {item.notes}
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => onDecrement(item.id)}
                            >
                              <i className="fas fa-minus"></i>
                            </Button>
                            <span className="fw-bold">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => onIncrement(item.id)}
                            >
                              <i className="fas fa-plus"></i>
                            </Button>
                          </div>
                        </td>
                        <td>{item.price.toFixed(2)} RON</td>
                        <td>
                          <strong>{(item.price * item.quantity).toFixed(2)} RON</strong>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onRemove(item.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <strong>{totals.subtotal.toFixed(2)} RON</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>TVA (19%):</span>
                  <strong>{totals.vatAmount.toFixed(2)} RON</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="h5 mb-0">Total:</span>
                  <strong className="h4 text-primary mb-0">{totals.total.toFixed(2)} RON</strong>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            <i className="fas fa-times me-2"></i>Închide
          </Button>
          {items.length > 0 && (
            <>
              <Button variant="success" onClick={handleSendOrder}>
                <i className="fas fa-paper-plane me-2"></i>Trimite Comandă
              </Button>
              {orderId && (
                <Button 
                  variant={isPaid ? "outline-success" : "primary"} 
                  onClick={handleMarkAsPaid}
                  disabled={isPaid}
                >
                  {isPaid ? (
                    <>
                      <i className="fas fa-check-circle me-2"></i>Achitată
                    </>
                  ) : (
                    <>
                      <i className="fas fa-money-bill-wave me-2"></i>Marchează ca Achitată
                    </>
                  )}
                </Button>
              )}
              {canCancel && (
                <Button 
                  variant="danger" 
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  <i className="fas fa-times-circle me-2"></i>Anulează Comandă
                </Button>
              )}
              {(session?.role === 'supervisor' || session?.role === 'admin') && isPaid && (
                <Button variant="warning" onClick={handleCloseTable}>
                  <i className="fas fa-door-open me-2"></i>Închide Masă
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal anulare comandă */}
      <Modal 
        show={showCancelModal} 
        onHide={() => !cancelling && setShowCancelModal(false)} 
        size="md" 
        centered
      >
        <Modal.Header closeButton={!cancelling}>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-danger me-2"></i>
            Anulare Comandă
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Atenție!</strong> Această acțiune nu poate fi anulată. Comanda va fi marcată ca anulată.
          </Alert>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="kiosk-cancel-reason">
              <strong>Motiv anulare (opțional):</strong>
            </Form.Label>
            <Form.Control
              id="kiosk-cancel-reason"
              name="cancel_reason"
              as="textarea"
              rows={3}
              placeholder="Ex: Client a plecat, produs indisponibil, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelling}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelModal(false)}
            disabled={cancelling}
          >
            <i className="fas fa-times me-2"></i>Anulează
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>Se anulează...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>Confirmă Anularea
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal plăți - se deschide când marchează comanda ca achitată */}
      {showPayments && orderId && (
        <KioskPaymentsModal
          show={showPayments}
          onHide={() => setShowPayments(false)}
          orderId={orderId}
          total={totals.total}
          session={session}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Modal fiscalizare - se deschide automat după plată completă */}
      {showFiscal && orderId && isPaid && (
        <KioskFiscalModal
          show={showFiscal}
          onHide={() => {
            setShowFiscal(false);
            loadOrderStatus();
          }}
          orderId={orderId}
          onFiscalComplete={handleFiscalComplete}
        />
      )}
    </>
  );
};

