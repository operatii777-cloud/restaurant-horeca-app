"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Mode Switcher Component
 *
 * Switches between POS modes (Tables, Fast Sale, Kiosk, Delivery).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosModeSwitcher = PosModeSwitcher;
var react_1 = require("react");
var posStore_1 = require("../store/posStore");
require("./PosModeSwitcher.css");
function PosModeSwitcher() {
    //   const { t } = useTranslation();
    var _a = (0, posStore_1.usePosStore)(), currentMode = _a.currentMode, setMode = _a.setMode;
    var modes = [
        { key: 'TABLES', label: 'Mese', icon: '🍽️' },
        { key: 'FAST_SALE', label: 'Vânzare Rapidă', icon: '⚡' },
        { key: 'KIOSK', label: 'Kiosk', icon: '📱' },
        { key: 'DELIVERY', label: 'Livrare', icon: '🚚' },
    ];
    return (<div className="pos-mode-switcher">
      {modes.map(function (mode) { return (<button key={mode.key} className={"pos-mode-btn ".concat(currentMode === mode.key ? 'active' : '')} onClick={function () { return setMode(mode.key); }}>
          <span className="pos-mode-icon">{mode.icon}</span>
          <span className="pos-mode-label">{mode.label}</span>
        </button>); })}
    </div>);
}
