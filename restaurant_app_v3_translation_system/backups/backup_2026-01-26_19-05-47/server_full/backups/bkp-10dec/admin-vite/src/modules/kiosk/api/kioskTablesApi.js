import { httpClient } from '@/shared/api/httpClient';

/**
 * API pentru gestionarea pozițiilor meselor
 */

/**
 * Obține toate pozițiile meselor
 * @returns {Promise<Array>} Array de obiecte { table_id, x, y, status }
 */
export const getTablesPositions = async () => {
  try {
    // Folosim endpoint-ul KIOSK care nu necesită autentificare admin
    const response = await httpClient.get('/api/kiosk/tables/positions');
    return response.data || [];
  } catch (error) {
    console.error('❌ Eroare la obținerea pozițiilor meselor:', error);
    throw error;
  }
};

/**
 * Salvează poziția unei mese
 * @param {number} tableId - ID-ul mesei
 * @param {number} x - Poziția X
 * @param {number} y - Poziția Y
 * @returns {Promise<Object>} Răspuns de la server
 */
export const saveTablePosition = async (tableId, x, y) => {
  try {
    const response = await httpClient.post('/api/admin/tables/positions', {
      table_id: tableId,
      x: Math.round(x),
      y: Math.round(y)
    });
    return response.data;
  } catch (error) {
    console.error('❌ Eroare la salvarea poziției mesei:', error);
    throw error;
  }
};

/**
 * Salvează pozițiile multiple mese (batch)
 * @param {Array} positions - Array de { table_id, x, y }
 * @returns {Promise<Object>} Răspuns de la server
 */
export const saveTablesPositionsBatch = async (positions) => {
  try {
    const response = await httpClient.post('/api/admin/tables/positions/batch', {
      positions: positions.map(p => ({
        table_id: p.table_id,
        x: Math.round(p.x),
        y: Math.round(p.y)
      }))
    });
    return response.data;
  } catch (error) {
    console.error('❌ Eroare la salvarea pozițiilor meselor:', error);
    throw error;
  }
};

