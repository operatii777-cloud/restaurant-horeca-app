/**
 * PHASE S12 - POS Mode Switcher Component
 * 
 * Switches between POS modes (Tables, Fast Sale, Kiosk, Delivery).
 */

import React from 'react';
import { usePosStore, type PosMode } from '../store/posStore';
import './PosModeSwitcher.css';

export function PosModeSwitcher() {
  const { currentMode, setMode } = usePosStore();

  const modes: Array<{ key: PosMode; label: string; icon: string }> = [
    { key: 'TABLES', label: 'Mese', icon: '🍽️' },
    { key: 'FAST_SALE', label: 'Vânzare Rapidă', icon: '⚡' },
    { key: 'KIOSK', label: 'Kiosk', icon: '📱' },
    { key: 'DELIVERY', label: 'Livrare', icon: '🚚' },
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
          <span className="pos-mode-label">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

