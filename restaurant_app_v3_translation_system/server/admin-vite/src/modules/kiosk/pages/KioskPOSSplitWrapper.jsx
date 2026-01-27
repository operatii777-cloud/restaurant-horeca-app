import React from 'react';
import { KioskThemeProvider } from '../context/KioskThemeContext';
import { KioskLoginModalProvider } from '../context/KioskLoginModalContext';
import { KioskPOSSplitPage } from './KioskPOSSplitPage';

/**
 * Wrapper pentru POS Split Fullscreen
 * Include providers necesare pentru contextele Kiosk
 */
export const KioskPOSSplitWrapper = () => {
  return (
    <KioskThemeProvider>
      <KioskLoginModalProvider>
        <KioskPOSSplitPage />
      </KioskLoginModalProvider>
    </KioskThemeProvider>
  );
};

export default KioskPOSSplitWrapper;

