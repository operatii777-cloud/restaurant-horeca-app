import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/**
 * KIOSK Payment Method Selector
 * Componentă dedicată KIOSK, nu reutilizează din POS
 */
export const KioskPaymentMethodSelector = ({ value, onChange, session }) => {
  const methods = [
    { id: 'CASH', label: 'Cash', icon: 'fa-money-bill-wave', color: 'success' },
    { id: 'CARD', label: 'Card', icon: 'fa-credit-card', color: 'primary' },
  ];

  // Voucher doar pentru supervisor și admin
  if (session?.role === 'supervisor' || session?.role === 'admin') {
    methods.push({
      id: 'VOUCHER',
      label: 'Voucher',
      icon: 'fa-ticket-alt',
      color: 'warning',
    });
  }

  return (
    <div className="kiosk-payment-methods d-flex gap-2 flex-wrap">
      {methods.map((method) => (
        <Button
          key={method.id}
          variant={value === method.id ? method.color : `outline-${method.color}`}
          size="lg"
          className="kiosk-payment-method-btn"
          onClick={() => onChange?.(method.id)}
        >
          <i className={`fas ${method.icon} me-2`}></i>
          {method.label}
        </Button>
      ))}
    </div>
  );
};

