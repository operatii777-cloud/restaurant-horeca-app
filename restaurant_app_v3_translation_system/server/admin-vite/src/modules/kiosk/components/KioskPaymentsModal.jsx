import { useState, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import { KioskPaymentMethodSelector } from './KioskPaymentMethodSelector';
import { KioskPaymentAmountInput } from './KioskPaymentAmountInput';
import { KioskPaymentNumericPad } from './KioskPaymentNumericPad';
import { KioskPaymentsList } from './KioskPaymentsList';
import { processPayment, getOrderPayments } from '../api/KioskApi';
import { getSplitBillStatus, processGroupPayment } from '../api/splitBillApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const KioskPaymentsModal = ({
  show,
  onHide,
  orderId,
  total,
  session,
  splitBillData,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  // Amount este setat automat la total (sau la restul de plată dacă există plăți parțiale)
  const [amount, setAmount] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [splitMode, setSplitMode] = useState(false);
  const [selectedSplitGroup, setSelectedSplitGroup] = useState(null);

  useEffect(() => {
    if (show && orderId) {
      loadPayments();
      // Initialize split mode if split bill data is provided
      if (splitBillData) {
        setSplitMode(true);
        setSelectedSplitGroup(splitBillData.groups?.[0] || null);
        // Load split bill status from backend
        loadSplitBillStatus();
      }
      // Set amount automat la total (sau la restul de plată dacă există plăți parțiale)
      setAmount(total ? total.toFixed(2) : '');
    }
  }, [show, orderId, splitBillData, total]);

  const loadSplitBillStatus = async () => {
    if (!orderId) return;
    
    try {
      const status = await getSplitBillStatus(orderId);
      if (status.isSplitBill && status.groups) {
        // Update splitBillData with real status from backend
        if (splitBillData && splitBillData.groups) {
          const updatedGroups = splitBillData.groups.map(group => {
            const groupStatus = status.groups[group.id];
            if (groupStatus) {
              return {
                ...group,
                total: groupStatus.total,
                paid: groupStatus.paid,
                remaining: groupStatus.remaining,
                isFullyPaid: groupStatus.isFullyPaid
              };
            }
            return group;
          });
          // Update selected group if needed
          if (selectedSplitGroup) {
            const updatedSelected = updatedGroups.find(g => g.id === selectedSplitGroup.id);
            if (updatedSelected) {
              setSelectedSplitGroup(updatedSelected);
            }
          }
        }
      }
    } catch (err) {
      // Nu este split bill sau eroare - continuă normal
      console.log('ℹ️ Order is not split bill or error loading status:', err.message);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await getOrderPayments(orderId);
      setPayments(data.payments || []);
    } catch (err) {
      console.error('❌ Eroare la încărcarea plăților:', err);
    }
  };

  const calculateRemaining = () => {
    // If split mode and group selected, calculate remaining for that specific group
    if (splitMode && selectedSplitGroup && splitBillData) {
      // Calculate payments for this specific group
      const groupPaid = payments
        .filter(p => {
          try {
            // Check both meta and split_bill columns
            const paymentMeta = p.meta ? JSON.parse(p.meta) : null;
            const paymentSplitBill = p.split_bill ? JSON.parse(p.split_bill) : null;
            const splitData = paymentMeta || paymentSplitBill;
            return splitData?.groupId === selectedSplitGroup.id;
          } catch {
            return false;
          }
        })
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      
      return Math.max(0, selectedSplitGroup.total - groupPaid);
    }
    
    // Normal payment: calculate total remaining
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

    if (amountNum > remaining + 0.01) { // Toleranță 0.01 RON
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
      // Dacă este split bill, folosește API-ul nou
      if (splitMode && selectedSplitGroup && splitBillData) {
        const result = await processGroupPayment(
          orderId,
          selectedSplitGroup.id,
          amountNum,
          paymentMethod
        );

        if (result.success) {
          // Reload payments
          await loadPayments();
          
          // Verifică dacă toate grupurile sunt plătite
          if (result.allGroupsPaid && onPaymentComplete) {
            onPaymentComplete();
          } else {
            // Reset amount pentru următoarea plată
            setAmount('');
            setError(null);
          }
        }
      } else {
        // PLATĂ NORMALĂ (nu split bill)
        const paymentData = {
          method: paymentMethod,
          amount: amountNum,
          groupId: null // Nu este split bill
        };

        const result = await processPayment(orderId, paymentData);
        await loadPayments();

        // Verifică dacă comanda este complet plătită
        if (result.is_fully_paid && onPaymentComplete) {
          onPaymentComplete();
        } else {
          setAmount('');
          setError(null);
        }
      }
    } catch (err) {
      console.error('❌ Eroare la procesarea plății:', err);
      setError(err.response?.data?.error || err.message || 'Nu s-a putut procesa plata.');
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

        {/* Split Bill Groups Info */}
        {splitMode && splitBillData && splitBillData.groups && (
          <Card className="mb-3 border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Split Bill - Selectează Grup:</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {splitBillData.groups.map((group) => {
                  // Calculează plăți pentru acest grup din payments
                  const groupPaid = payments
                    .filter(p => {
                      try {
                        const paymentMeta = p.meta ? JSON.parse(p.meta) : null;
                        return paymentMeta?.groupId === group.id || paymentMeta?.splitBill?.groupId === group.id;
                      } catch {
                        return false;
                      }
                    })
                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                  const groupRemaining = Math.max(0, (group.total || 0) - groupPaid);
                  const isSelected = selectedSplitGroup?.id === group.id;
                  const isFullyPaid = groupRemaining <= 0.01;
                  
                  return (
                    <Button
                      key={group.id}
                      variant={isSelected ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => {
                        setSelectedSplitGroup(group);
                        setAmount(groupRemaining > 0 ? groupRemaining.toFixed(2) : '');
                      }}
                      className={isSelected ? "active" : ""}
                    >
                      {group.name}
                      <br />
                      <small>
                        {groupRemaining > 0 ? (
                          <span className="text-danger">{groupRemaining.toFixed(2)} RON</span>
                        ) : (
                          <span className="text-success">✓ Plătit</span>
                        )}
                      </small>
                    </Button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Total și rest */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="h5 mb-0">
                {splitMode && selectedSplitGroup ? `${selectedSplitGroup.name} - Total:` : 'Total comandă:'}
              </span>
              <strong className="h4 text-primary mb-0">
                {splitMode && selectedSplitGroup ? selectedSplitGroup.total.toFixed(2) : total.toFixed(2)} RON
              </strong>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span>Rest de plată:</span>
              <strong className={remaining > 0 ? 'text-danger' : 'text-success'}>
                {remaining.toFixed(2)} RON
              </strong>
            </div>
            {isFullyPaid && (
              <Alert variant="success" className="mt-3 mb-0">
                <i className="fas fa-check-circle me-2"></i>
                {splitMode && selectedSplitGroup 
                  ? `${selectedSplitGroup.name} este plătit complet!` 
                  : 'Comanda este plătită complet!'}
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
                disabled={true} // inputul este dezactivat, suma nu poate fi modificată
                onUseExact={handleUseExact}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <KioskPaymentNumericPad value={amount} onChange={setAmount} disabled={loading} />
            </Form.Group>

            {/* Split Bill Toggle - only if not already set from parent */}
            {!splitBillData && (session?.role === 'supervisor' || session?.role === 'admin') && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Split Bill (împărțire factură)"
                  checked={splitMode}
                  onChange={(e) => {
                    setSplitMode(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedSplitGroup(null);
                    }
                  }}
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

