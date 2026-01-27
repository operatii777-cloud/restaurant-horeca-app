/**
 * PHASE S5.5 - Tipizate Store (Zustand Enterprise)
 * Global state management for all tipizate documents
 * 
 * Features:
 * - Cross-document state management
 * - List caching
 * - Document caching
 * - Global filters
 * - UI preferences (persistent)
 * - Undo/Redo
 * - Cross-tab sync
 * - Optimistic updates
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { TipizatType } from '../api/types';

interface TipizateState {
  // 🔵 Document type curent
  type: TipizatType;
  setType: (type: TipizatType) => void;

  // 🔵 Cache listări (per tip)
  listCache: Record<string, any>;
  setListCache: (type: TipizatType, payload: any) => void;
  clearListCache: (type?: TipizatType) => void;

  // 🔵 Cache documente individuale
  docCache: Record<string, any>;
  setDocCache: (type: TipizatType, id: number, payload: any) => void;
  getDocCache: (type: TipizatType, id: number) => any;
  clearDocCache: (type?: TipizatType, id?: number) => void;

  // 🔵 Filtre globale
  filters: Record<string, any>;
  setFilters: (type: TipizatType, filters: any) => void;
  clearFilters: (type?: TipizatType) => void;

  // 🔵 Preferințe UI (persistente)
  ui: {
    pdfTheme: 'standard' | 'compact' | 'detailed';
    hiddenColumns: Record<string, string[]>;
    gridDensity: 'compact' | 'comfortable' | 'spacious';
    pageSize: number;
  };
  setUi: (partial: Partial<TipizateState['ui']>) => void;
  toggleColumn: (type: TipizatType, columnName: string) => void;

  // 🔵 Undo / Redo
  history: Array<{ form: any; lines: any[]; totals: any }>;
  future: Array<{ form: any; lines: any[]; totals: any }>;
  pushHistory: (snapshot: { form: any; lines: any[]; totals: any }) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // 🔵 Last Used Document
  lastOpened: Record<string, number>;
  setLastOpened: (type: TipizatType, id: number) => void;

  // 🔵 Global reload trigger
  reloadToken: number;
  reload: () => void;
}

export const useTipizateStore = create<TipizateState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Document type curent
      type: 'NIR',
      setType: (type) => set({ type }),

      // Cache listări
      listCache: {},
      setListCache: (type, payload) =>
        set((s) => ({
          listCache: { ...s.listCache, [type]: payload },
        })),
      clearListCache: (type) =>
        set((s) => {
          if (type) {
            const { [type]: _, ...rest } = s.listCache;
            return { listCache: rest };
          }
          return { listCache: {} };
        }),

      // Cache documente individuale
      docCache: {},
      setDocCache: (type, id, payload) =>
        set((s) => ({
          docCache: {
            ...s.docCache,
            [`"Type"_"Id"`]: payload,
          },
        })),
      getDocCache: (type, id) => {
        const state = get();
        return state.docCache[`"Type"_"Id"`] || null;
      },
      clearDocCache: (type, id) =>
        set((s) => {
          if (type && id) {
            const { [`"Type"_"Id"`]: _, ...rest } = s.docCache;
            return { docCache: rest };
          } else if (type) {
            const filtered = Object.fromEntries(
                Object.entries(s.docCache).filter(([key]) => !key.startsWith(`${type}_`))
            );
            return { docCache: filtered };
          }
          return { docCache: {} };
        }),

      // Filtre globale
      filters: {},
      setFilters: (type, filters) =>
        set((s) => ({
          filters: { ...s.filters, [type]: filters },
        })),
      clearFilters: (type) =>
        set((s) => {
          if (type) {
            const { [type]: _, ...rest } = s.filters;
            return { filters: rest };
          }
          return { filters: {} };
        }),

      // Preferințe UI
      ui: {
        pdfTheme: 'standard',
        hiddenColumns: {},
        gridDensity: 'comfortable',
        pageSize: 50,
      },
      setUi: (partial) =>
        set((s) => ({
          ui: { ...s.ui, ...partial },
        })),
      toggleColumn: (type, columnName) =>
        set((s) => {
          const hidden = s.ui.hiddenColumns[type] || [];
          const exists = hidden.includes(columnName);
          return {
            ui: {
              ...s.ui,
              hiddenColumns: {
                ...s.ui.hiddenColumns,
                [type]: exists
                  ? hidden.filter((c) => c !== columnName)
                  : [...hidden, columnName],
              },
            },
          };
        }),

      // Undo / Redo
      history: [],
      future: [],
      pushHistory: (snapshot) =>
        set((s) => ({
          history: [...s.history, snapshot],
          future: [],
        })),
      undo: () =>
        set((s) => {
          if (s.history.length === 0) return {};
          const previous = s.history[s.history.length - 1];
          const current = {
            form: s.ui,
            lines: [],
            totals: {},
          };
          return {
            ...previous,
            history: s.history.slice(0, -1),
            future: [current, ...s.future],
          };
        }),
      redo: () =>
        set((s) => {
          if (s.future.length === 0) return {};
          const next = s.future[0];
          const current = {
            form: s.ui,
            lines: [],
            totals: {},
          };
          return {
            ...next,
            history: [...s.history, current],
            future: s.future.slice(1),
          };
        }),
      clearHistory: () =>
        set({
          history: [],
          future: [],
        }),

      // Last Used Document
      lastOpened: {},
      setLastOpened: (type, id) =>
        set((s) => ({
          lastOpened: { ...s.lastOpened, [type]: id },
        })),

      // Global reload trigger
      reloadToken: 0,
      reload: () =>
        set((s) => ({
          reloadToken: s.reloadToken + 1,
        })),
    })),
    {
      name: 'tipizate-store',
      version: 1,
      partialize: (state) => ({
        ui: state.ui,
        filters: state.filters,
        lastOpened: state.lastOpened,
        type: state.type,
      }),
    }
  )
);

// Cross-tab sync using BroadcastChannel
if (typeof window !== 'undefined') {
  const channel = new BroadcastChannel('tipizate-store-sync');

  // Listen for changes from other tabs
  channel.onmessage = (event) => {
    if (event.data.type === 'RELOAD') {
      useTipizateStore.getState().reload();
    } else if (event.data.type === 'CACHE_UPDATE') {
      const { docType, docId, payload } = event.data;
      useTipizateStore.getState().setDocCache(docType, docId, payload);
    }
  };

  // Subscribe to store changes and broadcast
  useTipizateStore.subscribe(
    (state) => state.reloadToken,
    () => {
      channel.postMessage({ type: 'RELOAD' });
    }
  );
}



