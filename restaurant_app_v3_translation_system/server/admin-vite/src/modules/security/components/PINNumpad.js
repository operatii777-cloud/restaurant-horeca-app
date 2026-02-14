"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PIN Numpad Component
 *
 * Touch-optimized numpad for PIN entry (Toast/Lightspeed style)
 */
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
require("./PINNumpad.css");
var PINNumpad = function (_a) {
    var onDigit = _a.onDigit, onBackspace = _a.onBackspace, onClear = _a.onClear, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    var handleButtonClick = function (value) {
        //   const { t } = useTranslation();
        if (disabled)
            return;
        // Haptic feedback (if available)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        onDigit(value);
    };
    var buttons = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        'C', '0', '⌫'
    ];
    return (<div className="pin-numpad">
      {buttons.map(function (btn) { return (<button key={btn} type="button" className={"pin-numpad-btn ".concat(btn === 'C' ? 'clear' : '', " ").concat(btn === '⌫' ? 'backspace' : '')} onClick={function () {
                if (btn === 'C') {
                    onClear();
                }
                else if (btn === '⌫') {
                    onBackspace();
                }
                else {
                    handleButtonClick(btn);
                }
            }} disabled={disabled}>
          {btn}
        </button>); })}
    </div>);
};
exports.default = PINNumpad;
