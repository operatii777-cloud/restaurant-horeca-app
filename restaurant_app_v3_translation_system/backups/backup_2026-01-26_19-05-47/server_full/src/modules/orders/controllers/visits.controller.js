/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Visits Controller
 * Visit/table session management
 */

const { dbPromise } = require('../../../../database');

/**
 * POST /api/visits/close
 * Close a visit/table session
 */
async function closeVisit(req, res, next) {
  try {
    const { tableNumber, clientIdentifier } = req.body;
    const db = await dbPromise;
    
    if (!tableNumber && !clientIdentifier) {
      return res.status(400).json({
        success: false,
        error: 'tableNumber or clientIdentifier is required'
      });
    }
    
    // Close table session if exists (verifică dacă tabelul și coloana există)
    if (tableNumber) {
      try {
        // Verifică dacă tabelul table_sessions există
        const tableExists = await new Promise((resolve, reject) => {
          db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='table_sessions'`, (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          });
        });
        
        if (tableExists) {
          // Verifică ce coloane există în table_sessions
          const columns = await new Promise((resolve, reject) => {
            db.all(`PRAGMA table_info(table_sessions)`, [], (err, rows) => {
              if (err) reject(err);
              else resolve(rows.map(r => r.name));
            });
          });
          
          const hasClosedAt = columns.includes('closed_at');
          const hasStatus = columns.includes('status');
          
          // Construiește query-ul dinamic bazat pe coloanele disponibile
          let updateFields = [];
          if (hasClosedAt) {
            updateFields.push("closed_at = datetime('now')");
          }
          if (hasStatus) {
            updateFields.push("status = 'CLOSED'");
          }
          
          if (updateFields.length > 0) {
            const whereClause = hasClosedAt ? "AND closed_at IS NULL" : "";
            
            await new Promise((resolve, reject) => {
              db.run(`
                UPDATE table_sessions
                SET ${updateFields.join(', ')}
                WHERE table_id = (
                  SELECT id FROM tables WHERE table_number = ?
                )
                ${whereClause}
              `, [tableNumber], (err) => {
                if (err) {
                  // Nu eșuăm dacă table_sessions nu există sau are structură diferită
                  console.warn('⚠️ Could not update table_sessions:', err.message);
                  resolve(); // Continuă chiar dacă table_sessions update eșuează
                } else {
                  resolve();
                }
              });
            });
          }
        }
      } catch (sessionError) {
        // Nu eșuăm dacă table_sessions nu există - continuă cu marcarea comenzilor ca plătite
        console.warn('⚠️ Could not close table session:', sessionError.message);
      }
    }
    
    // Mark orders as paid
    const conditions = [];
    const params = [];
    
    if (tableNumber) {
      conditions.push('table_number = ?');
      params.push(tableNumber);
    }
    
    if (clientIdentifier) {
      conditions.push('client_identifier = ?');
      params.push(clientIdentifier);
    }
    
    if (conditions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'tableNumber or clientIdentifier is required'
      });
    }
    
    // Verifică ce coloane există în orders pentru timestamp-ul plății
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(orders)", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.name));
      });
    });
    
    const hasPaidTimestamp = columns.includes('paid_timestamp');
    const hasPaymentTimestamp = columns.includes('payment_timestamp');
    
    // Construiește query-ul dinamic bazat pe coloanele disponibile
    let updateFields = ['is_paid = 1'];
    if (hasPaidTimestamp) {
      updateFields.push("paid_timestamp = datetime('now')");
    } else if (hasPaymentTimestamp) {
      updateFields.push("payment_timestamp = datetime('now')");
    }
    // Adaugă status doar dacă coloana există
    if (columns.includes('status')) {
      updateFields.push("status = 'paid'");
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders
        SET ${updateFields.join(', ')}
        WHERE ${conditions.join(' OR ')}
          AND is_paid = 0
      `, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    res.json({
      success: true,
      message: 'Visit closed successfully',
      orders_marked_paid: result.changes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error closing visit:', error);
    next(error);
  }
}

module.exports = {
  closeVisit
};

