const express = require('express');
const router = express.Router();
const database = require('../../database');
const crypto = require('crypto');
const { dbPromise } = database;

// Helper functions
async function runAll(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function runGet(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row ?? null);
    });
  });
}

async function runExec(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// GET /api/admin/kiosk/users - Lista tuturor utilizatorilor kiosk
router.get('/', async (req, res, next) => {
  try {
    const users = await runAll(
      `SELECT 
        id, 
        username, 
        role, 
        full_name, 
        is_active, 
        last_login, 
        created_at, 
        updated_at 
      FROM kiosk_users 
      ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        is_active: Boolean(user.is_active),
      })),
    });
  } catch (error) {
    console.error('❌ Error in GET /api/admin/kiosk/users:', error);
    next(error);
  }
});

// GET /api/admin/kiosk/users/:id - Obține un utilizator specific
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await runGet(
      `SELECT 
        id, 
        username, 
        role, 
        full_name, 
        is_active, 
        last_login, 
        created_at, 
        updated_at 
      FROM kiosk_users 
      WHERE id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilizatorul nu a fost găsit',
      });
    }

    res.json({
      success: true,
      user: {
        ...user,
        is_active: Boolean(user.is_active),
      },
    });
  } catch (error) {
    console.error('❌ Error in GET /api/admin/kiosk/users/:id:', error);
    next(error);
  }
});

// POST /api/admin/kiosk/users - Creează un nou utilizator
router.post('/', async (req, res, next) => {
  try {
    const { username, password, role, full_name, is_active } = req.body;

    // Validare
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username și parola sunt obligatorii',
      });
    }

    if (!['waiter', 'supervisor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rolul trebuie să fie: waiter, supervisor sau admin',
      });
    }

    // Verifică dacă username-ul există deja
    const existingUser = await runGet(
      'SELECT id FROM kiosk_users WHERE username = ?',
      [username]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username-ul există deja',
      });
    }

    // Hash parola
    const password_hash = hashPassword(password);

    // Inserează utilizatorul
    const result = await runExec(
      `INSERT INTO kiosk_users (username, password_hash, role, full_name, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, password_hash, role, full_name || null, is_active !== false ? 1 : 0]
    );

    const newUser = await runGet(
      `SELECT 
        id, 
        username, 
        role, 
        full_name, 
        is_active, 
        last_login, 
        created_at, 
        updated_at 
      FROM kiosk_users 
      WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      user: {
        ...newUser,
        is_active: Boolean(newUser.is_active),
      },
    });
  } catch (error) {
    console.error('❌ Error in POST /api/admin/kiosk/users:', error);
    next(error);
  }
});

// PUT /api/admin/kiosk/users/:id - Actualizează un utilizator
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, role, full_name, is_active } = req.body;

    // Verifică dacă utilizatorul există
    const existingUser = await runGet(
      'SELECT id FROM kiosk_users WHERE id = ?',
      [id]
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Utilizatorul nu a fost găsit',
      });
    }

    // Validare rol
    if (role && !['waiter', 'supervisor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rolul trebuie să fie: waiter, supervisor sau admin',
      });
    }

    // Verifică dacă username-ul este deja folosit de alt utilizator
    if (username) {
      const usernameTaken = await runGet(
        'SELECT id FROM kiosk_users WHERE username = ? AND id != ?',
        [username, id]
      );

      if (usernameTaken) {
        return res.status(400).json({
          success: false,
          error: 'Username-ul există deja',
        });
      }
    }

    // Construiește query-ul de update
    const updates = [];
    const params = [];

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }

    if (password) {
      updates.push('password_hash = ?');
      params.push(hashPassword(password));
    }

    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      params.push(full_name || null);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await runExec(
      `UPDATE kiosk_users 
       SET ${updates.join(', ')} 
       WHERE id = ?`,
      params
    );

    const updatedUser = await runGet(
      `SELECT 
        id, 
        username, 
        role, 
        full_name, 
        is_active, 
        last_login, 
        created_at, 
        updated_at 
      FROM kiosk_users 
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      user: {
        ...updatedUser,
        is_active: Boolean(updatedUser.is_active),
      },
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/admin/kiosk/users/:id:', error);
    next(error);
  }
});

// DELETE /api/admin/kiosk/users/:id - Șterge un utilizator
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verifică dacă utilizatorul există
    const existingUser = await runGet(
      'SELECT id FROM kiosk_users WHERE id = ?',
      [id]
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Utilizatorul nu a fost găsit',
      });
    }

    // Șterge utilizatorul
    await runExec('DELETE FROM kiosk_users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Utilizatorul a fost șters cu succes',
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/admin/kiosk/users/:id:', error);
    next(error);
  }
});

module.exports = router;
