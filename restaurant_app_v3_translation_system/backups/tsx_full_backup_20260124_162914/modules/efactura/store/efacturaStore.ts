// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Store
 * 
 * Zustand store for e-Factura interface.
 * Manages invoice list, filters, and pagination.
 */

import { create } from 'zustand';
import type { EFacturaInvoice, EFacturaFilter } from '@/types/invoice';

interface EFacturaState {
  list: EFacturaInvoice[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filter: EFacturaFilter;
  setFilter: (f: Partial<EFacturaFilter>) => void;
  setList: (data: { items: EFacturaInvoice[]; total: number; page: number; pageSize: number }) => void;
  setLoading: (v: boolean) => void;
  setPage: (p: number) => void;
}

export const useEFacturaStore = create<EFacturaState>((set) => ({
  list: [],
  total: 0,
  page: 1,
  pageSize: 50,
  loading: false,
  filter: { status: 'ALL' },
  
  setFilter: (f) => set((s) => ({ 
    filter: { ...s.filter, ...f }, 
    page: 1 
  })),
  
  setList: ({ items, total, page, pageSize }) => set({ 
    list: items, 
    total, 
    page, 
    pageSize 
  }),
  
  setLoading: (v) => set({ loading: v }),
  
  setPage: (p) => set({ page: p }),
}));

