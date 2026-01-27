import { useState, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import { KioskPaymentMethodSelector } from './KioskPaymentMethodSelector';
import { KioskPaymentAmountInput } from './KioskPaymentAmountInput';
import { KioskPaymentNumericPad } from './KioskPaymentNumericPad';
import { KioskPaymentsList } from './KioskPaymentsList';
import { processPayment, getOrderPayments } from '../api/KioskApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const KioskPaymentsModal = ({
  show,
  onHide,
  orderId,
  total,
  session,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amount, setAmount] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [splitMode, setSplitMode] = useState(false);

  useEffect(() => {
    if (show && orderId) {
      loadPayments();
    }
  }, [show, orderId]);

  const loadPayments = async () => {
    try {
      const data = await getOrderPayments(orderId);
      setPayments(data.payments || []);
    } catch (err) {
      console.error('❌ Eroare la încărcarea plăților:', err);
    }
  };

  const calculateRemaining = () => {
    const paid = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    return Math.max(0, total - paid);
  };

  const handlePayment = async () => {
    setError(null);
    const amountNum = parseFloat(amount);
    const remaining = calculateRemaining();

    if (!amountNum || amountNum <= 0) {
      setError('Introdu o sumă validă.');
      return;
    }

    if (amountNum > remaining) {
      setError(`Suma depășește restul de plată (${remaining.toFixed(2)} RON).`);
      return;
    }

    // Verifică permisiuni pentru voucher
    if (paymentMethod === 'VOUCHER' && session?.role !== 'supervisor' && session?.role !== 'admin') {
      setError('Doar supervisori și admin pot folosi voucher-uri.');
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        method: paymentMethod,
        amount: amountNum,
        split: splitMode,
      };

      await processPayment(orderId, paymentData);
      await loadPayments();

      // Verifică dacă comanda este complet plătită
      const newRemaining = calculateRemaining();
      if (newRemaining <= 0.01) {
        // Comanda este plătită complet - marchează ca achitată în backend
        try {
          // Marchează comanda ca achitată (is_paid = 1)
          await httpClient.put(`/api/orders/${orderId}`, {
            is_paid: 1,
          });
          
          // Log acțiune
          try {
            await httpClient.post('/api/kiosk/actions-log', {
              username: session?.username,
              order_id: orderId,
              action_type: 'PAYMENT',
              details_json: JSON.stringify({ 
                total_paid: total,
                payment_method: paymentMethod,
                payments_count: payments.length + 1,
              }),
            });
          } catch (err) {
            console.error('❌ Eroare la logarea acțiunii:', err);
          }
        } catch (err) {
          console.error('❌ Eroare la marcarea comenzii ca achitată:', err);
        }
        
        // Comanda este plătită complet - deschide fiscalizarea
        if (onPaymentComplete) {
          onPaymentComplete();
        }
      }

      setAmount('');
      setError(null);
    } catch (err) {
      console.error('❌ Eroare la procesarea plății:', err);
      setError(err.message || 'Nu s-a putut procesa plata.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExact = () => {
    const remaining = calculateRemaining();
    setAmount(remaining.toFixed(2));
  };

  const remaining = calculateRemaining();
  const isFullyPaid = remaining <= 0.01;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="kiosk-payments-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-money-bill-wave me-2"></i>Plată - Comandă #{orderId}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Total și rest */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="h5 mb-0">Total comandă:</span>
              <strong className="h4 text-primary mb-0">{total.toFixed(2)} RON</strong>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span>Rest de plată:</span>
              <strong className={remaining > 0 ? 'text-danger' : 'text-success'}>
                {remaining.toFixed(2)} RON
              </strong>
            </div>
            {isFullyPaid && (
              <Alert variant="success" className="mt-3 mb-0">
                <i className="fas fa-check-circle me-2"></i>Comanda este plătită complet!
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Plăți existente */}
        {payments.length > 0 && (
          <div className="mb-4">
            <KioskPaymentsList payments={payments} />
          </div>
        )}

        {/* Formular plată nouă */}
        {!isFullyPaid && (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Metodă plată</Form.Label>
              <KioskPaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
                session={session}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <KioskPaymentAmountInput
                value={amount}
                onChange={setAmount}
                remaining={remaining}
                disabled={loading}
                onUseExact={handleUseExact}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <KioskPaymentNumericPad value={amount} onChange={setAmount} disabled={loading} />
            </Form.Group>

            {(session?.role === 'supervisor' || session?.role === 'admin') && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Split Bill (împărțire factură)"
                  checked={splitMode}
                  onChange={(e) => setSplitMode(e.target.checked)}
                />
              </Form.Group>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          <i className="fas fa-times me-2"></i>Închide
        </Button>
        {!isFullyPaid && (
          <Button variant="primary" onClick={handlePayment} disabled={loading || !amount}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>Se procesează...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>Procesează Plată
              </>
            )}
          </Button>
        )}
        {isFullyPaid && (
          <Alert variant="success" className="mb-0">
            <i className="fas fa-check-circle me-2"></i>
            Comanda este plătită complet! Se va deschide automat modulul de fiscalizare.
          </Alert>
        )}
      </Modal.Footer>
    </Modal>
  );
};

