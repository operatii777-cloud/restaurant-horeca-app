import { useState, useEffect, useCallback } from 'react';
import { getTablesPositions, saveTablePosition } from '../api/kioskTablesApi';

/**
 * Hook pentru gestionarea pozițiilor meselor
 * @param {number} totalTables - Numărul total de mese (default: 30)
 * @returns {Object} { positions, loading, updatePosition, refreshPositions }
 */
export const useTablesPositions = (totalTables = 30) => {
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(true);

  // Încarcă pozițiile din backend
  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTablesPositions();
      
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
    } catch (error) {
      console.error('❌ Eroare la încărcarea pozițiilor:', error);
      // Folosim poziții default în caz de eroare (fără grid forțat)
      const defaultPositions = {};
      for (let i = 1; i <= totalTables; i++) {
        defaultPositions[i] = {
          x: 50 + (i % 10) * 150,
          y: 50 + Math.floor(i / 10) * 150,
          status: 'free'
        };
      }
      setPositions(defaultPositions);
    } finally {
      setLoading(false);
    }
  }, [totalTables]);

  // Actualizează poziția unei mese
  const updatePosition = useCallback(async (tableId, x, y) => {
    console.log(`💾 updatePosition - Masa ${tableId}, poziție nouă: (${x}, ${y})`);
    
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

