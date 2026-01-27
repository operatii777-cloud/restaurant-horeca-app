import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/**
 * KIOSK Payment Numeric Pad
 * Componentă dedicată KIOSK, touch-friendly, butoane mari
 */
export const KioskPaymentNumericPad = ({ value, onChange, disabled }) => {
  const safeValue = value ?? '';

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const handleDigit = (digit) => {
    if (disabled) return;
    let next = safeValue;
    if (next === '0') {
      next = '';
    }
    const dotIndex = next.indexOf('.');
    if (dotIndex !== -1) {
      const decimals = next.length - dotIndex - 1;
      if (decimals >= 2) {
        return;
      }
    }
    onChange?.(next + digit);
  };

  const handleDot = () => {
    if (disabled) return;
    if (!safeValue) {
      onChange?.('0.');
      return;
    }
    if (!safeValue.includes('.')) {
      onChange?.(safeValue + '.');
    }
  };

  const handleClear = () => {
    if (disabled) return;
    onChange?.('');
  };

  const handleBackspace = () => {
    if (disabled) return;
    if (!safeValue) return;
    onChange?.(safeValue.slice(0, -1));
  };

  return (
    <div className="kiosk-numeric-pad">
      <div className="kiosk-numeric-pad-grid">
        {digits.slice(0, 9).map((d) => (
          <Button
            key={d}
            type="button"
            variant="outline-secondary"
            size="lg"
            className="kiosk-numeric-btn"
            onClick={() => handleDigit(d)}
            disabled={disabled}
          >
            {d}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline-secondary"
          size="lg"
          className="kiosk-numeric-btn"
          onClick={() => handleDigit('0')}
          disabled={disabled}
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          size="lg"
          className="kiosk-numeric-btn"
          onClick={handleDot}
          disabled={disabled}
        >
          .
        </Button>
        <Button
          type="button"
          variant="outline-danger"
          size="lg"
          className="kiosk-numeric-btn"
          onClick={handleBackspace}
          disabled={disabled}
        >
          <i className="fas fa-backspace"></i>
        </Button>
      </div>
      <Button
        type="button"
        variant="outline-warning"
        size="lg"
        className="w-100 mt-2"
        onClick={handleClear}
        disabled={disabled}
      >
        <i className="fas fa-eraser me-2"></i>C – Șterge tot
      </Button>
    </div>
  );
};

