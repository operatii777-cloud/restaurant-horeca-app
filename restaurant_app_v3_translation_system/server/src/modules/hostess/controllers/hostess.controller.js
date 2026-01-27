/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/hostess.js
 * 
 * NOTE: This controller uses helper functions from the original route file.
 * TODO PHASE E8: Extract helpers to service layer
 */

const { dbPromise } = require('../../../../database');

// Helper functions (copied from routes/hostess.js)
const runQuery = async (sql, params = []) => {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runQuerySingle = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Direct implementation of handlers
async function getTables(req, res, next) {
  try {
    const tables = await runQuery('SELECT * FROM hostess_tables LIMIT 100');
    res.json({ success: true, data: tables || [] });
  } catch (error) {
    console.error('Error in getTables:', error);
    if (error.message && error.message.includes('no such table')) {
      res.json({ success: true, data: [] });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await runQuery(`
      SELECT 
        COUNT(DISTINCT table_id) as total_tables,
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_sessions,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_sessions,
        COALESCE(AVG(
          CASE 
            WHEN close_time IS NOT NULL 
            THEN (julianday(close_time) - julianday(start_time)) * 24 * 60
            ELSE NULL 
          END
        ), 0) as avg_session_duration_minutes
      FROM hostess_sessions
    `);
    
    const result = stats[0] || {
      total_tables: 0,
      total_sessions: 0,
      active_sessions: 0,
      closed_sessions: 0,
      avg_session_duration_minutes: 0
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in getStats:', error);
    // Return default stats on error (table might not exist)
    if (error.message && error.message.includes('no such table')) {
      res.json({ success: true, data: {
        total_tables: 0,
        total_sessions: 0,
        active_sessions: 0,
        closed_sessions: 0,
        avg_session_duration_minutes: 0
      }});
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

async function startSession(req, res, next) {
  try {
    const { table_id } = req.body;
    if (!table_id) {
      return res.status(400).json({ success: false, error: 'table_id required' });
    }

    const db = await dbPromise;
    db.run(
      `INSERT INTO hostess_sessions (table_id, status, start_time) VALUES (?, ?, ?)`,
      [table_id, 'active', new Date().toISOString()],
      function(err) {
        if (err) {
          console.error('Error in startSession:', err);
          return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.json({ success: true, data: { id: this.lastID } });
      }
    );
  } catch (error) {
    console.error('Error in startSession:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function closeSession(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'id required' });
    }

    const db = await dbPromise;
    db.run(
      `UPDATE hostess_sessions SET status = ?, close_time = ? WHERE id = ?`,
      ['closed', new Date().toISOString(), id],
      function(err) {
        if (err) {
          console.error('Error in closeSession:', err);
          return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.json({ success: true, data: { changes: this.changes } });
      }
    );
  } catch (error) {
    console.error('Error in closeSession:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getSessions(req, res, next) {
  try {
    const sessions = await runQuery('SELECT * FROM hostess_sessions ORDER BY start_time DESC LIMIT 100');
    res.json({ success: true, data: sessions || [] });
  } catch (error) {
    console.error('Error in getSessions:', error);
    if (error.message && error.message.includes('no such table')) {
      res.json({ success: true, data: [] });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

module.exports = {
  getTables,
  getStats,
  startSession,
  closeSession,
  getSessions
};
