// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PIN Numpad Component
 * 
 * Touch-optimized numpad for PIN entry (Toast/Lightspeed style)
 */

import React from 'react';
import './PINNumpad.css';

interface PINNumpadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const PINNumpad: React.FC<PINNumpadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  disabled = false
}) => {
  const handleButtonClick = (value: string) => {
//   const { t } = useTranslation();
    if (disabled) return;
    
    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    onDigit(value);
  };

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'C', '0', '⌫'
  ];

  return (
    <div className="pin-numpad">
      {buttons.map((btn) => (
        <button
          key={btn}
          type="button"
          className={`pin-numpad-btn ${btn === 'C' ? 'clear' : ''} ${btn === '⌫' ? 'backspace' : ''}`}
          onClick={() => {
            if (btn === 'C') {
              onClear();
            } else if (btn === '⌫') {
              onBackspace();
            } else {
              handleButtonClick(btn);
            }
          }}
          disabled={disabled}
        >
          {btn}
        </button>
      ))}
    </div>
  );
};

export default PINNumpad;

