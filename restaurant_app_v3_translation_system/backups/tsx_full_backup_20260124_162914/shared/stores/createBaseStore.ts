/**
 * createBaseStore - Helper pentru crearea store-urilor Zustand standardizate
 * 
 * Asigură consistență între toate store-urile din aplicație:
 * - Type safety
 * - DevTools middleware (în development)
 * - Pattern consistent
 */

import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Creează un store Zustand cu configurație standardizată
 * 
 * @param storeCreator - Funcția care definește store-ul (StateCreator)
 * @param storeName - Numele store-ului (pentru DevTools)
 * @returns Store hook
 */
export function createBaseStore<T extends object>(
  storeCreator: StateCreator<T>,
  storeName: string
) {
  // În development, adăugăm DevTools middleware
  if (process.env.NODE_ENV === 'development') {
    return create<T>()(
      devtools(storeCreator, { name: storeName })
    );
  }
  
  // În production, fără DevTools
  return create<T>()(storeCreator);
}

