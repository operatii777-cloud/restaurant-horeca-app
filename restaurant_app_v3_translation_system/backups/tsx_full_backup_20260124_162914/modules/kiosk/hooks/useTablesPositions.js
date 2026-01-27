import React, { useState, useEffect, useCallback } from 'react';
import { getTablesPositions, saveTablePosition } from '../api/kioskTablesApi';

/**
 * Hook pentru gestionarea pozițiilor meselor
 * @param {number} totalTables - Numărul total de mese (default: 30)
 * @returns {Object} { positions, loading, updatePosition, refreshPositions }
 */
export const useTablesPositions = (totalTables = 30) => {
  // FIX: Inițializăm cu poziții default IMEDIAT - nu mai așteptăm API-ul
  const [positions, setPositions] = useState(() => {
    // Generează poziții default imediat pentru render instant
    const defaultPositions = {};
    for (let i = 1; i <= totalTables; i++) {
      defaultPositions[i] = {
        x: 50 + (i % 10) * 150,
        y: 50 + Math.floor(i / 10) * 150,
        status: 'free'
      };
    }
    return defaultPositions;
  });
  const [loading, setLoading] = useState(false); // FIX: Nu mai blocăm cu loading: true

  // Încarcă pozițiile din backend - FIX: Nu mai blocăm render-ul
  const loadPositions = useCallback(async () => {
    try {
      // Nu mai setăm loading = true - pagina se randează instant
      const data = await getTablesPositions();
      
      // Asigură-te că data este un array
      if (!Array.isArray(data)) {
        console.warn('⚠️ getTablesPositions returned non-array:', data);
        throw new Error('Invalid data format');
      }
      
      // Convertim array-ul în obiect pentru acces rapid
      const positionsMap = {};
      data.forEach((pos) => {
        positionsMap[pos.table_id] = {
          x: pos.x || 0,
          y: pos.y || 0,
          status: pos.status || 'free'
        };
      });

      // Inițializăm poziții default pentru mesele care nu au poziție salvată
      // NU mai forțăm grid-ul - lăsăm utilizatorul să plaseze mesele liber
      for (let i = 1; i <= totalTables; i++) {
        if (!positionsMap[i]) {
          // Poziții random/împrăștiate pentru a permite aranjare liberă
          // Utilizatorul poate muta mesele oriunde dorește
          positionsMap[i] = {
            x: 50 + (i % 10) * 150, // Distribuție liberă
            y: 50 + Math.floor(i / 10) * 150,
            status: 'free'
          };
        }
      }

      setPositions(positionsMap);
      setLoading(false);
    } catch (error) {
      console.error('❌ Eroare la încărcarea pozițiilor:', error);
      // Folosim poziții default în caz de eroare - dar nu mai setăm loading
      // Pozițiile default sunt deja setate în useState inițial
      setLoading(false);
    }
  }, [totalTables]);

  // Actualizează poziția unei mese
  const updatePosition = useCallback(async (tableId, x, y) => {
    console.log(`💾 updatePosition - Masa ${tableId}, poziție nouă: ("X", "Y")`);
    
    // Actualizare optimistă în UI IMEDIAT
    setPositions((prev) => {
      const newPositions = {
        ...prev,
        [tableId]: {
          ...prev[tableId],
          x: Math.round(x),
          y: Math.round(y)
        }
      };
      console.log(`✅ updatePosition - State actualizat pentru masa ${tableId}:`, newPositions[tableId]);
      return newPositions;
    });

    // Salvare în backend (direct, fără debounce pentru feedback imediat)
    try {
      console.log(`📤 updatePosition - Salvare în backend pentru masa ${tableId}...`);
      const result = await saveTablePosition(tableId, x, y);
      console.log(`✅ updatePosition - Poziție salvată cu succes pentru masa ${tableId}:`, result);
    } catch (error) {
      console.error(`❌ updatePosition - Eroare la salvarea poziției pentru masa ${tableId}:`, error);
      // Revert la poziția anterioară în caz de eroare
      console.log(`🔄 updatePosition - Revert la pozițiile din backend...`);
      loadPositions();
    }
  }, [loadPositions]);

  // Refresh pozițiile
  const refreshPositions = useCallback(() => {
    loadPositions();
  }, [loadPositions]);

  // Încarcă pozițiile la mount
  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  return {
    positions,
    loading,
    updatePosition,
    refreshPositions
  };
};

