import { Card, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/**
 * KIOSK Payments List
 * Componentă dedicată KIOSK pentru afișarea plăților
 */
export const KioskPaymentsList = ({ payments }) => {
  if (!payments || payments.length === 0) {
    return (
      <div className="kiosk-payments-list-empty text-center py-3 text-muted">
        <i className="fas fa-info-circle me-2"></i>Nu există plăți înregistrate.
      </div>
    );
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case 'CASH':
        return 'fa-money-bill-wave';
      case 'CARD':
        return 'fa-credit-card';
      case 'VOUCHER':
        return 'fa-ticket-alt';
      default:
        return 'fa-money-bill';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'CASH':
        return 'success';
      case 'CARD':
        return 'primary';
      case 'VOUCHER':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="kiosk-payments-list">
      <h5 className="mb-3">
        <i className="fas fa-list me-2"></i>Plăți efectuate
      </h5>
      <div className="d-flex flex-column gap-2">
        {payments.map((payment, idx) => (
          <Card key={idx} className="kiosk-payment-item">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <Badge bg={getMethodColor(payment.method)} className="fs-6 p-2">
                  <i className={`fas ${getMethodIcon(payment.method)} me-2`}></i>
                  {payment.method}
                </Badge>
                {payment.split && (
                  <Badge bg="info" className="fs-6">
                    Split
                  </Badge>
                )}
              </div>
              <div className="text-end">
                <div className="h5 mb-0 text-primary">
                  {Number(payment.amount || 0).toLocaleString('ro-RO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  RON
                </div>
                {payment.timestamp && (
                  <small className="text-muted">
                    {new Date(payment.timestamp).toLocaleTimeString('ro-RO')}
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

