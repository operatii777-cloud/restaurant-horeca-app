// Hostess Map - POS Integration
// Purpose: Auto start/close table sessions based on POS orders
// Created: 3 Dec 2025

const db = require('../config/database');

/**
 * Auto-start table session when order is created
 * Called from POS when creating new order
 */
async function autoStartTableSession(orderData) {
  const { table_number, waiter_id, timestamp } = orderData;
  
  if (!table_number) return; // Skip if no table (takeaway/delivery)
  
  try {
    // Find table by table_number
    const table = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM tables WHERE table_number = ?`, [table_number], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!table) {
      console.warn(`⚠️ Hostess: Table ${table_number} not found`);
      return;
    }
    
    // Check if session already exists
    const existingSession = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM table_sessions WHERE table_id = ? AND status = 'OPEN'`,
        [table.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (existingSession) {
      console.log(`✅ Hostess: Table ${table_number} already has open session #${existingSession.id}`);
      return existingSession.id;
    }
    
    // Create new session
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO table_sessions (table_id, started_at, server_id, status)
         VALUES (?, ?, ?, 'OPEN')`,
        [table.id, timestamp || new Date().toISOString(), waiter_id || null],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    console.log(`✅ Hostess: Auto-started session #${result.id} for table ${table_number}`);
    return result.id;
    
  } catch (error) {
    console.error('❌ Hostess: Error auto-starting session:', error);
  }
}

/**
 * Auto-close table session when order is paid/closed
 * Called from POS when order is marked as paid
 */
async function autoCloseTableSession(orderData) {
  const { table_number, order_id } = orderData;
  
  if (!table_number) return;
  
  try {
    // Find table
    const table = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM tables WHERE table_number = ?`, [table_number], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!table) {
      console.warn(`⚠️ Hostess: Table ${table_number} not found`);
      return;
    }
    
    // Close open session
    const result = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE table_sessions 
         SET closed_at = datetime('now'), status = 'CLOSED', pos_order_id = ?
         WHERE table_id = ? AND status = 'OPEN'`,
        [order_id || null, table.id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
    
    if (result.changes > 0) {
      console.log(`✅ Hostess: Auto-closed session for table ${table_number}`);
    } else {
      console.log(`⚪ Hostess: No open session found for table ${table_number}`);
    }
    
  } catch (error) {
    console.error('❌ Hostess: Error auto-closing session:', error);
  }
}

/**
 * Update covers (number of people) for a table session
 */
async function updateTableCovers(tableNumber, covers) {
  if (!tableNumber || !covers) return;
  
  try {
    const table = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM tables WHERE table_number = ?`, [tableNumber], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!table) return;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE table_sessions SET covers = ? WHERE table_id = ? AND status = 'OPEN'`,
        [covers, table.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`✅ Hostess: Updated covers to ${covers} for table ${tableNumber}`);
    
  } catch (error) {
    console.error('❌ Hostess: Error updating covers:', error);
  }
}

module.exports = {
  autoStartTableSession,
  autoCloseTableSession,
  updateTableCovers
};

