/**
 * PHASE S5.5 - Tipizate Context
 * Enterprise context for UI settings and grid preferences
 */

import React, { createContext, useContext } from 'react';
import { useTipizateStore } from '../store/tipizateStore';

interface TipizateContextValue {
  ui: {
    pdfTheme: 'standard' | 'compact' | 'detailed';
    hiddenColumns: Record<string, string[]>;
    gridDensity: 'compact' | 'comfortable' | 'spacious';
    pageSize: number;
  };
  setUi: (partial: Partial<TipizateContextValue['ui']>) => void;
  toggleColumn: (type: string, columnName: string) => void;
}

const TipizateContext = createContext<TipizateContextValue | null>(null);

export const TipizateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ui = useTipizateStore((s) => s.ui);
  const setUi = useTipizateStore((s) => s.setUi);
  const toggleColumn = useTipizateStore((s) => s.toggleColumn);

  return (
    <TipizateContext.Provider value={{ ui, setUi, toggleColumn }}>
      {children}
    </TipizateContext.Provider>
  );
};

export const useTipizateContext = () => {
  const context = useContext(TipizateContext);
  if (!context) {
    throw new Error('useTipizateContext must be used within TipizateProvider');
  }
  return context;
};

