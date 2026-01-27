import { useState } from 'react';
import { Modal, Button, Alert, Card } from 'react-bootstrap';
import { fiscalizeOrder } from '../api/KioskApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const KioskFiscalModal = ({ show, onHide, orderId, onFiscalComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fiscalReceipt, setFiscalReceipt] = useState(null);

  const handleFiscalize = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await fiscalizeOrder(orderId);
      
      if (result.fiscal_receipt) {
        setFiscalReceipt(result.fiscal_receipt);
        
        // După confirmare, masa devine liberă
        if (onFiscalComplete) {
          onFiscalComplete();
        }
      } else {
        setError('Nu s-a putut genera bonul fiscal.');
      }
    } catch (err) {
      console.error('❌ Eroare la fiscalizare:', err);
      setError(err.message || 'Nu s-a putut fiscaliza comanda.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFiscalReceipt(null);
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="kiosk-fiscal-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-receipt me-2"></i>Fiscalizare Comandă #{orderId}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!fiscalReceipt ? (
          <div className="text-center py-5">
            <i className="fas fa-cash-register fa-4x text-primary mb-4"></i>
            <h4 className="mb-3">Trimite la casa de marcat</h4>
            <p className="text-muted mb-4">
              Comanda va fi trimisă către driverul fiscal pentru generarea bonului.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleFiscalize}
              disabled={loading}
              className="kiosk-fiscal-button"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Se procesează...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>Trimite la Casa de Marcat
                </>
              )}
            </Button>
          </div>
        ) : (
          <div>
            <Alert variant="success" className="mb-4">
              <i className="fas fa-check-circle me-2"></i>Bonul fiscal a fost generat cu succes!
            </Alert>

            <Card>
              <Card.Body>
                <div className="mb-3">
                  <strong>Număr fiscal:</strong> {fiscalReceipt.receipt_number || 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Operator:</strong> {fiscalReceipt.operator || 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Total:</strong> {fiscalReceipt.total?.toFixed(2) || '0.00'} RON
                </div>
                {fiscalReceipt.pdf_url && (
                  <div className="mb-3">
                    <strong>PDF:</strong>{' '}
                    <a href={fiscalReceipt.pdf_url} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-download me-1"></i>Descarcă bonul
                    </a>
                  </div>
                )}
              </Card.Body>
            </Card>

            {fiscalReceipt.pdf_url && (
              <div className="mt-4">
                <iframe
                  src={fiscalReceipt.pdf_url}
                  style={{ width: '100%', height: '500px', border: '1px solid #ddd' }}
                  title="Bon fiscal"
                />
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          <i className="fas fa-times me-2"></i>Închide
        </Button>
        {fiscalReceipt && (
          <Button variant="success" onClick={handleClose}>
            <i className="fas fa-check me-2"></i>Confirmă
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

