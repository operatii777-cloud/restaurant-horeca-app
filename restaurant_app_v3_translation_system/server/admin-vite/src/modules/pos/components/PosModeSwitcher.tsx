import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S12 - POS Mode Switcher Component
 * 
 * Switches between POS modes (Tables, Fast Sale, Kiosk, Delivery).
 */

import React from 'react';
import { usePosStore, type PosMode } from '../store/posStore';
import './PosModeSwitcher.css';

export function PosModeSwitcher() {
  const { t } = useTranslation();
  const { currentMode, setMode } = usePosStore();

  const modes: Array<{ key: PosMode; labelKey: string; icon: string }> = [
    { key: 'TABLES', labelKey: 'pos.modes.dineIn', icon: '🍽️' },
    { key: 'FAST_SALE', labelKey: 'pos.modes.takeaway', icon: '⚡' },
    { key: 'KIOSK', labelKey: 'pos.modes.kiosk', icon: '📱' },
    { key: 'DELIVERY', labelKey: 'pos.modes.delivery', icon: '🚚' },
  ];

  return (
    <div className="pos-mode-switcher">
      {modes.map((mode) => (
        <button
          key={mode.key}
          className={`pos-mode-btn ${currentMode === mode.key ? 'active' : ''}`}
          onClick={() => setMode(mode.key)}
        >
          <span className="pos-mode-icon">{mode.icon}</span>
          <span className="pos-mode-label">{t(mode.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}

