/**
 * Daily Menu Controller
 * Handles Daily Menu logic
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/daily-menu
 * Returns today's daily menu
 */
async function getDailyMenu(req, res, next) {
  try {
    const db = await dbPromise;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // First check for exceptions
    const exception = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM daily_menu_exceptions
        WHERE date = ? AND is_active = 1
      `, [today], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    let menu = null;

    if (exception) {
      // Use exception menu - caută în ambele tabele (catalog_products apoi menu)
      let soup = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM catalog_products WHERE id = ?', [exception.soup_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (!soup) {
        soup = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM menu WHERE id = ?', [exception.soup_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      }

      let mainCourse = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM catalog_products WHERE id = ?', [exception.main_course_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (!mainCourse) {
        mainCourse = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM menu WHERE id = ?', [exception.main_course_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      }

      if (soup && mainCourse) {
        menu = {
          soup: soup,
          mainCourse: mainCourse,
          discount: exception.discount || 10.00
        };
      }
    } else {
      // Check for today's menu
      const todayMenu = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM daily_menu
          WHERE date = ? AND is_active = 1
        `, [today], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (todayMenu) {
        // Caută în ambele tabele (catalog_products apoi menu)
        let soup = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM catalog_products WHERE id = ?', [todayMenu.soup_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        if (!soup) {
          soup = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM menu WHERE id = ?', [todayMenu.soup_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
        }

        let mainCourse = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM catalog_products WHERE id = ?', [todayMenu.main_course_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        if (!mainCourse) {
          mainCourse = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM menu WHERE id = ?', [todayMenu.main_course_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
        }

        if (soup && mainCourse) {
          menu = {
            soup: soup,
            mainCourse: mainCourse,
            discount: todayMenu.discount || 10.00
          };
        }
      } else {
        // Check for scheduled menu
        const schedule = await new Promise((resolve, reject) => {
          db.get(`
            SELECT * FROM daily_menu_schedule
            WHERE start_date <= ? AND end_date >= ? AND is_active = 1
            ORDER BY created_at DESC
            LIMIT 1
          `, [today, today], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (schedule) {
          // Caută în ambele tabele (catalog_products apoi menu)
          let soup = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM catalog_products WHERE id = ?', [schedule.soup_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          if (!soup) {
            soup = await new Promise((resolve, reject) => {
              db.get('SELECT * FROM menu WHERE id = ?', [schedule.soup_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
          }

          let mainCourse = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM catalog_products WHERE id = ?', [schedule.main_course_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          if (!mainCourse) {
            mainCourse = await new Promise((resolve, reject) => {
              db.get('SELECT * FROM menu WHERE id = ?', [schedule.main_course_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
          }

          if (soup && mainCourse) {
            menu = {
              soup: soup,
              mainCourse: mainCourse,
              discount: schedule.discount || 10.00
            };
          }
        }
      }
    }

    if (!menu) {
      return res.json({
        menu: null,
        available: false
      });
    }

    res.json(menu);
  } catch (error) {
    console.error('Error in getDailyMenu:', error);
    // Return safe default instead of crashing
    res.json({
      menu: null,
      available: false
    });
  }
}

/**
 * POST /api/admin/daily-menu
 * Creează sau actualizează daily menu
 */
async function createOrUpdateDailyMenu(req, res, next) {
  try {
    // Acceptă ambele formate: soupId/mainCourseId (din frontend) sau soup_id/main_course_id (legacy)
    const { date, soupId, soup_id, mainCourseId, main_course_id, discount } = req.body;
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;

    console.log('📝 [DailyMenu] POST /api/admin/daily-menu - Request body:', JSON.stringify(req.body));

    // Normalizează parametrii
    const soup_id_final = soupId || soup_id;
    const main_course_id_final = mainCourseId || main_course_id;
    const discount_final = discount || 10.00;
    
    // Dacă nu este specificată dată, folosește data de astăzi
    const today = new Date().toISOString().split('T')[0];
    const date_final = date || today;

    console.log('📝 [DailyMenu] Normalized params:', { date_final, soup_id_final, main_course_id_final, discount_final });

    if (!soup_id_final || !main_course_id_final) {
      console.error('❌ [DailyMenu] Missing required params:', { soup_id_final, main_course_id_final });
      return res.status(400).json({
        success: false,
        error: 'soupId și mainCourseId sunt obligatorii'
      });
    }

    // Verifică dacă produsele există în meniu (verifică în ambele tabele: menu și catalog_products)
    const soupExists = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM menu WHERE id = ?
        UNION
        SELECT id FROM catalog_products WHERE id = ?
      `, [soup_id_final, soup_id_final], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });

    const mainCourseExists = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM menu WHERE id = ?
        UNION
        SELECT id FROM catalog_products WHERE id = ?
      `, [main_course_id_final, main_course_id_final], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });

    if (!soupExists) {
      console.error('❌ [DailyMenu] Soup not found in menu or catalog_products:', soup_id_final);
      return res.status(400).json({
        success: false,
        error: `Ciorba cu ID ${soup_id_final} nu există în meniu`
      });
    }

    if (!mainCourseExists) {
      console.error('❌ [DailyMenu] Main course not found in menu or catalog_products:', main_course_id_final);
      return res.status(400).json({
        success: false,
        error: `Felul principal cu ID ${main_course_id_final} nu există în meniu`
      });
    }

    // Șterge daily menu existent pentru data respectivă
    await new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM daily_menu WHERE date = ?`,
        [date_final],
        (err) => {
          if (err) {
            console.error('❌ [DailyMenu] Error deleting existing menu:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Dezactivează temporar foreign key constraints pentru a permite inserarea
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Inserează daily menu nou
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO daily_menu (date, soup_id, main_course_id, discount, is_active, created_at)
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [date_final, soup_id_final, main_course_id_final, discount_final],
        function(err) {
          if (err) {
            console.error('❌ [DailyMenu] Error inserting menu:', err);
            console.error('❌ [DailyMenu] SQL params:', { date_final, soup_id_final, main_course_id_final, discount_final });
            reject(err);
          } else {
            console.log('✅ [DailyMenu] Menu saved successfully:', { id: this.lastID, date_final });
            resolve({ id: this.lastID });
          }
        }
      );
    });

    // Reactivează foreign key constraints
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: 'Daily menu salvat cu succes',
      id: result.id,
      date: date_final,
      soup_id: soup_id_final,
      main_course_id: main_course_id_final,
      discount: discount_final
    });
  } catch (error) {
    console.error('❌ [DailyMenu] Error in createOrUpdateDailyMenu:', error);
    console.error('❌ [DailyMenu] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la salvarea meniului zilei',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * DELETE /api/admin/daily-menu
 * Șterge daily menu pentru o dată specifică (sau astăzi dacă nu este specificată)
 */
async function deleteDailyMenu(req, res, next) {
  try {
    const { date } = req.query;
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;

    // Dacă nu este specificată dată, folosește data de astăzi
    const today = new Date().toISOString().split('T')[0];
    const date_final = date || today;

    const result = await new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM daily_menu WHERE date = ?`,
        [date_final],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    res.json({
      success: true,
      message: `Daily menu pentru ${date_final} șters cu succes`,
      deleted: result.changes,
      date: date_final
    });
  } catch (error) {
    console.error('Error in deleteDailyMenu:', error);
    next(error);
  }
}

/**
 * POST /api/admin/daily-menu/schedule
 * Programează daily menu pentru mai multe zile
 */
async function scheduleDailyMenu(req, res, next) {
  try {
    // Acceptă ambele formate: startDate/endDate (din frontend) sau start_date/end_date (legacy)
    const { startDate, endDate, start_date, end_date, soupId, soup_id, mainCourseId, main_course_id, discount } = req.body;
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;

    // Normalizează parametrii
    const start_date_final = startDate || start_date;
    const end_date_final = endDate || end_date;
    const soup_id_final = soupId || soup_id;
    const main_course_id_final = mainCourseId || main_course_id;
    const discount_final = discount || 10.00;

    if (!start_date_final || !end_date_final || !soup_id_final || !main_course_id_final) {
      return res.status(400).json({
        success: false,
        error: 'startDate, endDate, soupId și mainCourseId sunt obligatorii'
      });
    }

    // Inserează programarea în tabela daily_menu_schedule
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO daily_menu_schedule (start_date, end_date, soup_id, main_course_id, discount, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [start_date_final, end_date_final, soup_id_final, main_course_id_final, discount_final],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.json({
      success: true,
      message: `Programare creată cu succes`,
      id: result.id,
      start_date: start_date_final,
      end_date: end_date_final
    });
  } catch (error) {
    console.error('Error in scheduleDailyMenu:', error);
    next(error);
  }
}

/**
 * POST /api/admin/daily-menu/exception
 * Adaugă excepție pentru daily menu (exclude o dată specifică)
 */
async function addDailyMenuException(req, res, next) {
  try {
    // Acceptă ambele formate: soupId/mainCourseId (din frontend) sau soup_id/main_course_id (legacy)
    const { date, soupId, soup_id, mainCourseId, main_course_id, discount } = req.body;
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;

    // Normalizează parametrii
    const soup_id_final = soupId || soup_id;
    const main_course_id_final = mainCourseId || main_course_id;
    const discount_final = discount || 10.00;

    if (!date || !soup_id_final || !main_course_id_final) {
      return res.status(400).json({
        success: false,
        error: 'Date, soupId și mainCourseId sunt obligatorii'
      });
    }

    // Inserează sau actualizează excepția
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO daily_menu_exceptions (date, soup_id, main_course_id, discount, is_active, created_at)
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [date, soup_id_final, main_course_id_final, discount_final],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      message: `Excepție adăugată pentru ${date}`,
      date
    });
  } catch (error) {
    console.error('Error in addDailyMenuException:', error);
    next(error);
  }
}

/**
 * GET /api/admin/daily-menu/schedule
 * Returnează toate programările pentru daily menu
 */
async function getDailyMenuSchedule(req, res, next) {
  try {
    const db = await dbPromise;

    const schedules = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          s.id,
          s.start_date,
          s.end_date,
          s.soup_id,
          s.main_course_id,
          s.discount,
          s.is_active,
          s.created_at,
          soup.name as soup_name,
          soup.price as soup_price,
          main.name as main_course_name,
          main.price as main_course_price
        FROM daily_menu_schedule s
        LEFT JOIN menu soup ON s.soup_id = soup.id
        LEFT JOIN menu main ON s.main_course_id = main.id
        WHERE s.is_active = 1
        ORDER BY s.created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      schedules: schedules
    });
  } catch (error) {
    console.error('Error in getDailyMenuSchedule:', error);
    next(error);
  }
}

/**
 * GET /api/admin/daily-menu/exceptions
 * Returnează toate excepțiile pentru daily menu
 */
async function getDailyMenuExceptions(req, res, next) {
  try {
    const db = await dbPromise;

    const exceptions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          e.id,
          e.date,
          e.soup_id,
          e.main_course_id,
          e.discount,
          e.is_active,
          e.created_at,
          soup.name as soup_name,
          soup.price as soup_price,
          main.name as main_course_name,
          main.price as main_course_price
        FROM daily_menu_exceptions e
        LEFT JOIN menu soup ON e.soup_id = soup.id
        LEFT JOIN menu main ON e.main_course_id = main.id
        WHERE e.is_active = 1
        ORDER BY e.date DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      exceptions: exceptions
    });
  } catch (error) {
    console.error('Error in getDailyMenuExceptions:', error);
    next(error);
  }
}

/**
 * DELETE /api/admin/daily-menu/schedule/:id
 * Șterge o programare
 */
async function deleteDailyMenuSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID este obligatoriu'
      });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE daily_menu_schedule SET is_active = 0 WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    res.json({
      success: true,
      message: `Programare ștearsă cu succes`,
      deleted: result.changes
    });
  } catch (error) {
    console.error('Error in deleteDailyMenuSchedule:', error);
    next(error);
  }
}

/**
 * DELETE /api/admin/daily-menu/exception/:id
 * Șterge o excepție
 */
async function deleteDailyMenuException(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID este obligatoriu'
      });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE daily_menu_exceptions SET is_active = 0 WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    res.json({
      success: true,
      message: `Excepție ștearsă cu succes`,
      deleted: result.changes
    });
  } catch (error) {
    console.error('Error in deleteDailyMenuException:', error);
    next(error);
  }
}

module.exports = {
  getDailyMenu,
  createOrUpdateDailyMenu,
  deleteDailyMenu,
  scheduleDailyMenu,
  addDailyMenuException,
  getDailyMenuSchedule,
  getDailyMenuExceptions,
  deleteDailyMenuSchedule,
  deleteDailyMenuException
};

