import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, Badge, Alert } from 'react-bootstrap';
import { KioskPaymentsModal } from './KioskPaymentsModal';
import { KioskFiscalModal } from './KioskFiscalModal';
import { getOrder, cancelOrder, updateOrder } from '../api/KioskApi';
import { useNavigate } from 'react-router-dom';
import { useHappyHour } from '../hooks/useHappyHour';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const KioskCartSidebar = ({
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
  
  // Happy Hour hook
  const { activeHappyHour, discounts, calculateDiscounts } = useHappyHour();

  // Funcție pentru încărcarea statusului comenzii (definită înainte de useEffect pentru a evita hoisting)
  const loadOrderStatus = React.useCallback(async () => {
    if (!orderId) return;
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
      setIsPaid(orderData.is_paid === 1 || orderData.is_paid === true);
    } catch (err) {
      console.error('❌ Eroare la încărcarea statusului comenzii:', err);
    }
  }, [orderId]);

  // Verifică statusul comenzii
  useEffect(() => {
    if (orderId) {
      loadOrderStatus();
    }
  }, [orderId, loadOrderStatus]);

  // Calculate Happy Hour discounts when items change
  useEffect(() => {
    if (items && items.length > 0) {
      const cartItems = items.map(item => ({
        productId: item.product_id || item.id,
        finalPrice: item.price + (item.customizations?.reduce((sum, c) => sum + (c.extra_price || 0), 0) || 0),
        quantity: item.quantity,
        isFree: item.is_free || false
      }));
      calculateDiscounts(cartItems);
    } else {
      calculateDiscounts([]);
    }
  }, [items, calculateDiscounts]);

  // Calculate totals with Happy Hour discounts
  const calculatedTotals = useMemo(() => {
    if (!items || items.length === 0) {
      return totals;
    }

    let subtotal = 0;
    items.forEach(item => {
      const itemPrice = item.price + (item.customizations?.reduce((sum, c) => sum + (c.extra_price || 0), 0) || 0);
      if (!item.is_free) {
        subtotal += itemPrice * item.quantity;
      }
    });

    // Apply Happy Hour discounts if available
    let happyHourDiscount = 0;
    if (discounts && discounts.hasDiscount && discounts.items.length > 0) {
      // Match items with discounts
      items.forEach((item, index) => {
        const discountItem = discounts.items[index];
        if (discountItem && !item.is_free) {
          happyHourDiscount += discountItem.discount * item.quantity;
        }
      });
    }

    const discountedSubtotal = subtotal - happyHourDiscount;
    const vatAmount = discountedSubtotal * 0.19;
    const total = discountedSubtotal + vatAmount;

    return {
      subtotal: discountedSubtotal,
      vatAmount,
      total,
      happyHourDiscount
    };
  }, [items, totals, discounts]);

  const handleSendOrder = async () => {
    try {
      // 1. Salvează comanda (creează sau actualizează) și obține orderId
      const savedOrderId = await onSave();
      
      // 2. Folosim orderId returnat sau cel din props
      const finalOrderId = savedOrderId || orderId;
      
      // 3. Dacă există orderId, actualizează statusul la 'preparing' pentru a trimite către bar/bucătărie
      if (finalOrderId) {
        await updateOrder(finalOrderId, { status: 'preparing' });
        console.log('✅ Comandă trimisă către bar și bucătărie (status: preparing)');
        alert('Comanda a fost trimisă către bar și bucătărie!');
      } else {
        alert('Eroare: Nu s-a putut obține ID-ul comenzii.');
      }
    } catch (err) {
      console.error('❌ Eroare la trimiterea comenzii:', err);
      alert('Nu s-a putut trimite comanda. Încearcă din nou.');
    }
  };

  const handleMarkAsPaid = () => {
    if (!orderId) {
      alert('Nu există comandă activă. Salvează mai întâi comanda.');
      return;
    }
    setShowPayments(true);
  };

  const handlePaymentComplete = React.useCallback(() => {
    setShowPayments(false);
    setShowFiscal(true);
    loadOrderStatus();
  }, [loadOrderStatus]);

  const handleFiscalComplete = React.useCallback(() => {
    setShowFiscal(false);
    loadOrderStatus();
  }, [loadOrderStatus]);

  const handleCancelOrder = () => {
    if (!orderId) {
      alert('Nu există comandă activă pentru a anula.');
      return;
    }
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
    <div className="kiosk-cart-sidebar">
      <Card className="h-100">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <i className="fas fa-shopping-cart me-2"></i>
            Coș - Masa {tableId}
          </h5>
        </Card.Header>
        <Card.Body className="d-flex flex-column" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {/* Happy Hour Banner */}
          {activeHappyHour && activeHappyHour.active && activeHappyHour.settings.length > 0 && (
            <Alert variant="success" className="mb-3" style={{ fontSize: '0.9rem' }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-clock me-2"></i>
                <div>
                  <strong>🎉 Happy Hour Activ!</strong>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    {activeHappyHour.settings[0].name} - {activeHappyHour.settings[0].discount_percentage}% reducere
                  </div>
                </div>
              </div>
            </Alert>
          )}
          
          {(!items || items.length === 0) ? ( // 🟢 FIX BUG 3: Verifică dacă items este null/undefined
            <div className="text-center py-5">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <p className="text-muted">Coșul este gol</p>
            </div>
          ) : (
            <>
              <div className="flex-grow-1 mb-3">
                {(items || []).map((item) => ( // 🟢 FIX BUG 3: Fallback pentru items null/undefined
                  <Card key={item.id} className="mb-2">
                    <Card.Body className="p-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <strong className="d-block">{item.product_name}</strong>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="mt-1">
                              {item.customizations.map((custom, idx) => (
                                <Badge key={idx} bg="info" className="me-1 mb-1" style={{ fontSize: '0.7rem' }}>
                                  {custom.option_name}
                                  {custom.extra_price > 0 && ` (+${custom.extra_price.toFixed(2)} RON)`}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <small className="text-muted d-block mt-1">
                              <i className="fas fa-sticky-note me-1"></i>
                              {item.notes}
                            </small>
                          )}
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onRemove(item.id)}
                          className="ms-2"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
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
                        <strong className="text-primary">
                          {(item.price * item.quantity + (item.customizations?.reduce((sum, c) => sum + (c.extra_price || 0), 0) || 0) * item.quantity).toFixed(2)} RON
                        </strong>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              <Card className="bg-light">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <strong>{calculatedTotals.subtotal.toFixed(2)} RON</strong>
                  </div>
                  {calculatedTotals.happyHourDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-success">
                        <i className="fas fa-tag me-1"></i>Happy Hour:
                      </span>
                      <strong className="text-success">-{calculatedTotals.happyHourDiscount.toFixed(2)} RON</strong>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span>TVA (19%):</span>
                    <strong>{calculatedTotals.vatAmount.toFixed(2)} RON</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="h5 mb-0">Total:</span>
                    <strong className="h4 text-primary mb-0">{calculatedTotals.total.toFixed(2)} RON</strong>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </Card.Body>
        <Card.Footer className="bg-white">
          <div className="d-grid gap-2">
            {items.length > 0 && (
              <>
                <Button variant="success" size="lg" onClick={handleSendOrder}>
                  <i className="fas fa-paper-plane me-2"></i>Trimite Comandă
                </Button>
                {orderId && (
                  <Button 
                    variant={isPaid ? "outline-success" : "primary"} 
                    size="lg"
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
                    size="lg"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    <i className="fas fa-times-circle me-2"></i>Anulează Comandă
                  </Button>
                )}
              </>
            )}
          </div>
        </Card.Footer>
      </Card>

      {/* Modal plăți */}
      {orderId && (
        <KioskPaymentsModal
          show={showPayments}
          onHide={() => setShowPayments(false)}
          orderId={orderId}
          tableId={tableId}
          total={totals.total}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Modal fiscal */}
      {orderId && (
        <KioskFiscalModal
          show={showFiscal}
          onHide={() => setShowFiscal(false)}
          orderId={orderId}
          onFiscalComplete={handleFiscalComplete}
        />
      )}

      {/* Modal anulare */}
      {showCancelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                  Anulare Comandă
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <strong>Atenție!</strong> Această acțiune nu poate fi anulată.
                </div>
                <div className="mb-3">
                  <label htmlFor="cancel-reason" className="form-label">
                    <strong>Motiv anulare (opțional):</strong>
                  </label>
                  <textarea
                    id="cancel-reason"
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Introduceți motivul anulării..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
                  Anulează
                </Button>
                <Button variant="danger" onClick={handleConfirmCancel} disabled={cancelling}>
                  {cancelling ? 'Se anulează...' : 'Confirmă Anulare'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

