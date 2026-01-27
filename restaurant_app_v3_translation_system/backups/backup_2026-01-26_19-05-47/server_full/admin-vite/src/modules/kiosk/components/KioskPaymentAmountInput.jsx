import { Form, Button, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/**
 * KIOSK Payment Amount Input
 * Componentă dedicată KIOSK, touch-friendly
 */
export const KioskPaymentAmountInput = ({ value, onChange, remaining, disabled, onUseExact }) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    const normalized = raw.replace(',', '.');
    if (!/^[0-9]*[.]?[0-9]*$/.test(normalized) && normalized !== '') {
      return;
    }
    onChange?.(normalized);
  };

  const handleUseExact = () => {
    if (typeof remaining !== 'number') return;
    onUseExact?.(remaining);
  };

  return (
    <div className="kiosk-payment-amount-input">
      <Form.Label htmlFor="kiosk-payment-amount" className="fw-bold">Sumă plată</Form.Label>
      <InputGroup size="lg">
        <Form.Control
          id="kiosk-payment-amount"
          name="payment_amount"
          type="text"
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.00"
          className="text-end fs-4"
          inputMode="decimal"
          autoComplete="off"
        />
        <Button
          variant="outline-secondary"
          onClick={handleUseExact}
          disabled={disabled || !remaining || remaining <= 0}
        >
          <i className="fas fa-equals me-1"></i>
          Sumă exactă
          {typeof remaining === 'number' && remaining > 0 && (
            <div className="small">({remaining.toFixed(2)})</div>
          )}
        </Button>
      </InputGroup>
    </div>
  );
};

