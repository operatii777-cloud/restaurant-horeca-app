/**
 * Schedule & Holidays Controller
 * 
 * Gestionare program restaurant și sărbători
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/settings/schedule
 * Obține programul săptămânal
 */
async function getSchedule(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurant_schedule'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });

    if (!tableExists) {
      // Creează tabela dacă nu există
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS restaurant_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_id INTEGER DEFAULT 1,
            day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
            open_time TEXT,
            close_time TEXT,
            is_closed INTEGER DEFAULT 0,
            break_start TEXT,
            break_end TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(location_id, day_of_week)
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const schedules = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM restaurant_schedule ORDER BY day_of_week",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Transformă is_closed din INTEGER în boolean
    const formattedSchedules = schedules.map(s => ({
      ...s,
      is_closed: s.is_closed === 1 || s.is_closed === true
    }));

    console.log(`✅ [Schedule] Retrieved ${formattedSchedules.length} schedule entries`);
    res.json(formattedSchedules);
  } catch (error) {
    console.error('❌ [Schedule] Error getting schedule:', error);
    next(error);
  }
}

/**
 * PUT /api/settings/schedule
 * Actualizează programul săptămânal
 */
async function updateSchedule(req, res, next) {
  try {
    const { schedules } = req.body;
    
    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'schedules must be an array' });
    }

    const db = await dbPromise;

    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurant_schedule'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });

    if (!tableExists) {
      // Creează tabela dacă nu există
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS restaurant_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_id INTEGER DEFAULT 1,
            day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
            open_time TEXT,
            close_time TEXT,
            is_closed INTEGER DEFAULT 0,
            break_start TEXT,
            break_end TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(location_id, day_of_week)
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Actualizează sau inserează fiecare program
    for (const schedule of schedules) {
      const { day_of_week, open_time, close_time, is_closed, break_start, break_end, location_id = 1 } = schedule;
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO restaurant_schedule (location_id, day_of_week, open_time, close_time, is_closed, break_start, break_end, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(location_id, day_of_week) DO UPDATE SET
            open_time = excluded.open_time,
            close_time = excluded.close_time,
            is_closed = excluded.is_closed,
            break_start = excluded.break_start,
            break_end = excluded.break_end,
            updated_at = CURRENT_TIMESTAMP
        `, [
          location_id,
          day_of_week,
          open_time || null,
          close_time || null,
          is_closed ? 1 : 0,
          break_start || null,
          break_end || null
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    }

    console.log(`✅ [Schedule] Updated ${schedules.length} schedule entries`);
    res.json({ success: true, message: 'Program actualizat cu succes', count: schedules.length });
  } catch (error) {
    console.error('❌ [Schedule] Error updating schedule:', error);
    next(error);
  }
}

/**
 * GET /api/settings/holidays
 * Obține toate sărbătorile
 */
async function getHolidays(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurant_holidays'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });

    if (!tableExists) {
      // Creează tabela dacă nu există
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS restaurant_holidays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_id INTEGER DEFAULT 1,
            date TEXT NOT NULL,
            name TEXT NOT NULL,
            name_en TEXT,
            is_closed INTEGER DEFAULT 1,
            special_open_time TEXT,
            special_close_time TEXT,
            is_recurring INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const holidays = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM restaurant_holidays ORDER BY date",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Transformă is_closed și is_recurring din INTEGER în boolean
    const formattedHolidays = holidays.map(h => ({
      ...h,
      is_closed: h.is_closed === 1 || h.is_closed === true,
      is_recurring: h.is_recurring === 1 || h.is_recurring === true
    }));

    console.log(`✅ [Holidays] Retrieved ${formattedHolidays.length} holidays`);
    res.json(formattedHolidays);
  } catch (error) {
    console.error('❌ [Holidays] Error getting holidays:', error);
    next(error);
  }
}

/**
 * POST /api/settings/holidays
 * Creează o sărbătoare nouă
 */
async function createHoliday(req, res, next) {
  try {
    const { date, name, name_en, is_closed, special_open_time, special_close_time, is_recurring, location_id = 1 } = req.body;
    
    if (!date || !name) {
      return res.status(400).json({ error: 'date and name are required' });
    }

    const db = await dbPromise;

    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurant_holidays'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });

    if (!tableExists) {
      // Creează tabela dacă nu există
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS restaurant_holidays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_id INTEGER DEFAULT 1,
            date TEXT NOT NULL,
            name TEXT NOT NULL,
            name_en TEXT,
            is_closed INTEGER DEFAULT 1,
            special_open_time TEXT,
            special_close_time TEXT,
            is_recurring INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO restaurant_holidays (location_id, date, name, name_en, is_closed, special_open_time, special_close_time, is_recurring)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        location_id,
        date,
        name,
        name_en || null,
        is_closed ? 1 : 0,
        special_open_time || null,
        special_close_time || null,
        is_recurring ? 1 : 0
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });

    console.log(`✅ [Holidays] Created holiday: ${name} (${date})`);
    res.status(201).json({ 
      success: true, 
      id: result.id,
      message: 'Sărbătoare creată cu succes' 
    });
  } catch (error) {
    console.error('❌ [Holidays] Error creating holiday:', error);
    next(error);
  }
}

/**
 * PUT /api/settings/holidays/:id
 * Actualizează o sărbătoare
 */
async function updateHoliday(req, res, next) {
  try {
    const { id } = req.params;
    const { date, name, name_en, is_closed, special_open_time, special_close_time, is_recurring } = req.body;
    
    if (!date || !name) {
      return res.status(400).json({ error: 'date and name are required' });
    }

    const db = await dbPromise;

    const result = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE restaurant_holidays
        SET date = ?, name = ?, name_en = ?, is_closed = ?, special_open_time = ?, special_close_time = ?, is_recurring = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        date,
        name,
        name_en || null,
        is_closed ? 1 : 0,
        special_open_time || null,
        special_close_time || null,
        is_recurring ? 1 : 0,
        id
      ], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Holiday not found' });
    }

    console.log(`✅ [Holidays] Updated holiday ID ${id}`);
    res.json({ success: true, message: 'Sărbătoare actualizată cu succes' });
  } catch (error) {
    console.error('❌ [Holidays] Error updating holiday:', error);
    next(error);
  }
}

/**
 * DELETE /api/settings/holidays/:id
 * Șterge o sărbătoare
 */
async function deleteHoliday(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM restaurant_holidays WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Holiday not found' });
    }

    console.log(`✅ [Holidays] Deleted holiday ID ${id}`);
    res.json({ success: true, message: 'Sărbătoare ștearsă cu succes' });
  } catch (error) {
    console.error('❌ [Holidays] Error deleting holiday:', error);
    next(error);
  }
}

module.exports = {
  getSchedule,
  updateSchedule,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
};

