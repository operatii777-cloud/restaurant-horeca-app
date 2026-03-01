/**
 * PIN Authentication Routes
 * 
 * Provides PIN-based login for POS/Kiosk terminals
 * Similar to Lightspeed/Toast employee quick login
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { dbPromise } = require('../../../database');

// Constants
const MAX_PIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MINUTES = 15;
const PIN_LENGTH = 4;

/**
 * Hash PIN with salt
 */
function hashPIN(pin, salt) {
  return crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex');
}

/**
 * Generate random salt
 */
function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * GET /api/auth/pin/employees
 * Get list of employees for quick select (avatars + names)
 * Combines users (admins/managers) and waiters
 */
router.get('/employees', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Get users (admins, managers)
    const users = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          username as name,
          username,
          CASE role_id 
            WHEN 1 THEN 'admin'
            WHEN 2 THEN 'manager'
            ELSE 'staff'
          END as role,
          'user' as type,
          CASE WHEN pin IS NOT NULL AND pin != '' THEN 1 ELSE 0 END as has_pin
        FROM users
        WHERE is_active = 1
        ORDER BY username ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Get waiters
    const waiters = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          name,
          name as username,
          COALESCE(role, 'waiter') as role,
          'waiter' as type,
          CASE WHEN pin_hash IS NOT NULL OR pin IS NOT NULL THEN 1 ELSE 0 END as has_pin
        FROM waiters
        WHERE active = 1
        ORDER BY name ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Combine and format
    const allEmployees = [...users, ...waiters];
    
    res.json({
      success: true,
      data: allEmployees.map(emp => ({
        id: emp.id,
        name: emp.name || emp.username,
        username: emp.username,
        role: emp.role,
        type: emp.type,
        avatarUrl: null,
        hasPIN: emp.has_pin === 1,
        initials: (emp.name || emp.username || 'NA').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      }))
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/pin/setup
 * Set up or update PIN for an employee
 */
router.post('/setup', async (req, res) => {
  try {
    const { userId, pin, type = 'waiter' } = req.body;
    const db = await dbPromise;
    
    // Validate PIN
    if (!pin || pin.length !== PIN_LENGTH || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: `PIN must be exactly ${PIN_LENGTH} digits`
      });
    }
    
    // Generate salt and hash PIN
    const salt = generateSalt();
    const pinHash = hashPIN(pin, salt);
    
    if (type === 'user') {
      // Update user - users table has 'pin' column (plain text for now)
      await new Promise((resolve, reject) => {
        db.run(`UPDATE users SET pin = ? WHERE id = ?`, [pin, userId], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    } else {
      // Update waiter - waiters table has pin_hash and pin_salt
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE waiters 
          SET pin_hash = ?, pin_salt = ?, pin = ?
          WHERE id = ?
        `, [pinHash, salt, pin, userId], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    }
    
    res.json({
      success: true,
      message: 'PIN set successfully'
    });
  } catch (error) {
    console.error('Error setting up PIN:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/pin/login
 * Login with PIN (for POS/Kiosk)
 */
router.post('/login', async (req, res) => {
  try {
    const { userId, pin, type = 'waiter' } = req.body;
    const db = await dbPromise;
    
    if (!userId || !pin) {
      return res.status(400).json({
        success: false,
        error: 'User ID and PIN are required'
      });
    }
    
    let user;
    
    if (type === 'user') {
      // Get admin/manager user
      user = await new Promise((resolve, reject) => {
        db.get(`
          SELECT id, username as name, username, 
                 CASE role_id WHEN 1 THEN 'admin' WHEN 2 THEN 'manager' ELSE 'staff' END as role,
                 pin as pin_hash, '' as pin_salt, 
                 is_active, 'user' as type
          FROM users
          WHERE id = ?
        `, [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row ? { ...row, pin_attempts: 0, pin_locked_until: null } : null);
        });
      });
    } else {
      // Get waiter
      user = await new Promise((resolve, reject) => {
        db.get(`
          SELECT id, name, name as username, COALESCE(role, 'waiter') as role,
                 COALESCE(pin_hash, pin) as pin_hash, pin_salt, 
                 active as is_active, 'waiter' as type
          FROM waiters
          WHERE id = ?
        `, [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row ? { ...row, pin_attempts: 0, pin_locked_until: null } : null);
        });
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive'
      });
    }
    
    // Check if locked out
    if (user.pin_locked_until) {
      const lockoutEnd = new Date(user.pin_locked_until);
      if (lockoutEnd > new Date()) {
        const minutesRemaining = Math.ceil((lockoutEnd - new Date()) / 60000);
        return res.status(429).json({
          success: false,
          error: `Account locked. Try again in ${minutesRemaining} minutes.`,
          lockedUntil: user.pin_locked_until
        });
      }
    }
    
    // Check if PIN is set
    if (!user.pin_hash) {
      return res.status(400).json({
        success: false,
        error: 'PIN not set for this user. Please set up PIN first.'
      });
    }
    
    // Verify PIN - handle both hashed and plain text PINs
    let pinValid = false;
    
    if (user.pin_salt) {
      // Hashed PIN with salt
      const attemptedHash = hashPIN(pin, user.pin_salt);
      pinValid = (attemptedHash === user.pin_hash);
    } else {
      // Plain text PIN (legacy) or simple comparison
      pinValid = (pin === user.pin_hash || pin === user.pin_hash.toString());
    }
    
    if (!pinValid) {
      // Invalid PIN - return error (simplified - no attempt tracking for now)
      console.log(`Failed PIN login attempt for user ${userId}`);
      
      return res.status(401).json({
        success: false,
        error: 'Invalid PIN',
        attemptsRemaining: MAX_PIN_ATTEMPTS - 1
      });
    }
    
    // Success - log it
    console.log(`Successful PIN login for user ${userId}`);
    
    // Log the login
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO login_history (user_id, login_method, ip_address, user_agent, success)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, 'PIN', req.ip, req.get('user-agent'), 1], (err) => {
        if (err) console.error('Failed to log login:', err);
        resolve();
      });
    });
    
    // Generate session token (simplified - in production use JWT)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role
        },
        sessionToken: sessionToken,
        loginMethod: 'PIN',
        loginTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in PIN login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/pin/verify
 * Verify PIN for manager override (without full login)
 */
router.post('/verify', async (req, res) => {
  try {
    const { userId, pin, action } = req.body;
    const db = await dbPromise;
    
    if (!userId || !pin) {
      return res.status(400).json({
        success: false,
        error: 'User ID and PIN are required'
      });
    }
    
    // Get user - check both users and waiters tables
    let user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, username as name, 
               CASE role_id WHEN 1 THEN 'admin' WHEN 2 THEN 'manager' ELSE 'staff' END as role, 
               pin as pin_hash, '' as pin_salt, is_active
        FROM users
        WHERE id = ? AND role_id IN (1, 2)
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // If not found in users, check waiters with manager role
    if (!user) {
      user = await new Promise((resolve, reject) => {
        db.get(`
          SELECT id, name, role, COALESCE(pin_hash, pin) as pin_hash, pin_salt, active as is_active
          FROM waiters
          WHERE id = ? AND role IN ('admin', 'manager', 'supervisor')
        `, [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Manager/Admin not found'
      });
    }
    
    if (!user.pin_hash) {
      return res.status(400).json({
        success: false,
        error: 'PIN not set for this manager'
      });
    }
    
    // Verify PIN - handle both hashed and plain text
    let pinValid = false;
    if (user.pin_salt) {
      const attemptedHash = hashPIN(pin, user.pin_salt);
      pinValid = (attemptedHash === user.pin_hash);
    } else {
      pinValid = (pin === user.pin_hash || pin === String(user.pin_hash));
    }
    
    if (!pinValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid PIN'
      });
    }
    
    // Log the override
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO audit_log (user_id, action, details, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `, [userId, 'MANAGER_OVERRIDE', JSON.stringify({ action: action || 'unspecified' })], (err) => {
        if (err) console.error('Failed to log override:', err);
        resolve();
      });
    });
    
    res.json({
      success: true,
      data: {
        authorized: true,
        authorizedBy: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        action: action,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in PIN verify:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/pin/clock-in
 * Clock in an employee (start shift)
 */
router.post('/clock-in', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const db = await dbPromise;
    
    // Verify PIN first
    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT id, name, pin_hash, pin_salt FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!user || !user.pin_hash) {
      return res.status(400).json({ success: false, error: 'Invalid user or PIN not set' });
    }
    
    const attemptedHash = hashPIN(pin, user.pin_salt);
    if (attemptedHash !== user.pin_hash) {
      return res.status(401).json({ success: false, error: 'Invalid PIN' });
    }
    
    // Check if already clocked in
    const activeShift = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM time_clock 
        WHERE employee_id = ? AND clock_out IS NULL
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (activeShift) {
      return res.status(400).json({
        success: false,
        error: 'Already clocked in. Please clock out first.'
      });
    }
    
    // Clock in
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO time_clock (employee_id, clock_in) VALUES (?, datetime('now'))
      `, [userId], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({
      success: true,
      data: {
        shiftId: result.id,
        employeeId: userId,
        employeeName: user.name,
        clockIn: new Date().toISOString(),
        message: `${user.name} clocked in successfully`
      }
    });
  } catch (error) {
    console.error('Error in clock-in:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/pin/clock-out
 * Clock out an employee (end shift)
 */
router.post('/clock-out', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const db = await dbPromise;
    
    // Verify PIN first
    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT id, name, pin_hash, pin_salt FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!user || !user.pin_hash) {
      return res.status(400).json({ success: false, error: 'Invalid user or PIN not set' });
    }
    
    const attemptedHash = hashPIN(pin, user.pin_salt);
    if (attemptedHash !== user.pin_hash) {
      return res.status(401).json({ success: false, error: 'Invalid PIN' });
    }
    
    // Find active shift
    const activeShift = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, clock_in FROM time_clock 
        WHERE employee_id = ? AND clock_out IS NULL
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!activeShift) {
      return res.status(400).json({
        success: false,
        error: 'Not clocked in. Please clock in first.'
      });
    }
    
    // Calculate hours worked
    const clockIn = new Date(activeShift.clock_in);
    const clockOut = new Date();
    const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60);
    
    // Clock out
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE time_clock 
        SET clock_out = datetime('now'), total_hours = ?
        WHERE id = ?
      `, [hoursWorked.toFixed(2), activeShift.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      data: {
        shiftId: activeShift.id,
        employeeId: userId,
        employeeName: user.name,
        clockIn: activeShift.clock_in,
        clockOut: clockOut.toISOString(),
        hoursWorked: hoursWorked.toFixed(2),
        message: `${user.name} clocked out successfully. Worked ${hoursWorked.toFixed(2)} hours.`
      }
    });
  } catch (error) {
    console.error('Error in clock-out:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// PIN USERS TABLE - init + seed on first load
// ============================================================
(async () => {
  try {
    const db = await dbPromise;
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS pin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin','manager','ospatar')),
          pin TEXT NOT NULL UNIQUE,
          active INTEGER DEFAULT 1,
          auto_lock_seconds INTEGER DEFAULT 60
        )
      `, (err) => { if (err) reject(err); else resolve(); });
    });
    // Seed initial users if table is empty
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as cnt FROM pin_users', [], (err, row) => {
        if (err) reject(err); else resolve(row ? row.cnt : 0);
      });
    });
    if (count === 0) {
      const seeds = [
        { name: 'Admin', role: 'admin', pin: '5555', auto_lock_seconds: 120 },
        { name: 'Manager', role: 'manager', pin: '2222', auto_lock_seconds: 90 },
        { name: 'Ospatar 1', role: 'ospatar', pin: '1111', auto_lock_seconds: 60 },
      ];
      // IMPORTANT: Change these default PINs immediately after first login in production.
      // These seed values are only for initial setup convenience.
      for (const s of seeds) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT OR IGNORE INTO pin_users (name, role, pin, auto_lock_seconds) VALUES (?, ?, ?, ?)',
            [s.name, s.role, s.pin, s.auto_lock_seconds],
            (err) => { if (err) reject(err); else resolve(); }
          );
        });
      }
      console.log('✅ pin_users table seeded with default users');
    }
  } catch (err) {
    console.error('❌ Failed to initialize pin_users table:', err.message);
  }
})();

/**
 * POST /api/auth/pin/direct-login
 * Login using only PIN (for Electron launcher kiosk login)
 * Body: { pin: "1234" }
 */
router.post('/direct-login', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== 'string' || pin.trim() === '') {
      return res.status(400).json({ success: false, message: 'PIN is required' });
    }
    const db = await dbPromise;
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, role, auto_lock_seconds FROM pin_users WHERE pin = ? AND active = 1',
        [pin.trim()],
        (err, row) => { if (err) reject(err); else resolve(row || null); }
      );
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'PIN incorect' });
    }
    res.json({
      success: true,
      role: user.role,
      userId: user.id,
      userName: user.name,
      autoLockSeconds: user.auto_lock_seconds
    });
  } catch (error) {
    console.error('Error in direct PIN login:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/auth/pin/pin-users
 * List all pin_users
 */
router.get('/pin-users', async (req, res) => {
  try {
    const db = await dbPromise;
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, role, active, auto_lock_seconds FROM pin_users ORDER BY id ASC', [], (err, rows) => {
        if (err) reject(err); else resolve(rows || []);
      });
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error listing pin_users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/pin/pin-users
 * Add a new pin user
 * Body: { name, role, pin }
 */
router.post('/pin-users', async (req, res) => {
  try {
    const { name, role, pin } = req.body;
    if (!name || !role || !pin) {
      return res.status(400).json({ success: false, error: 'name, role and pin are required' });
    }
    if (!['admin', 'manager', 'ospatar'].includes(role)) {
      return res.status(400).json({ success: false, error: 'role must be admin, manager or ospatar' });
    }
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ success: false, error: 'PIN must be 4-6 digits' });
    }
    const db = await dbPromise;
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO pin_users (name, role, pin) VALUES (?, ?, ?)',
        [name, role, pin],
        function(err) { if (err) reject(err); else resolve({ id: this.lastID }); }
      );
    });
    res.status(201).json({ success: true, data: { id: result.id, name, role, pin, active: 1, auto_lock_seconds: 60 } });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ success: false, error: 'PIN already in use' });
    }
    console.error('Error adding pin_user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/auth/pin/pin-users/:id
 * Edit a pin user (name, role, pin)
 */
router.put('/pin-users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, pin } = req.body;
    if (role && !['admin', 'manager', 'ospatar'].includes(role)) {
      return res.status(400).json({ success: false, error: 'role must be admin, manager or ospatar' });
    }
    if (pin && !/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ success: false, error: 'PIN must be 4-6 digits' });
    }
    const db = await dbPromise;
    const fields = [];
    const values = [];
    if (name) { fields.push('name = ?'); values.push(name); }
    if (role) { fields.push('role = ?'); values.push(role); }
    if (pin) { fields.push('pin = ?'); values.push(pin); }
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Nothing to update' });
    }
    values.push(id);
    await new Promise((resolve, reject) => {
      db.run(`UPDATE pin_users SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) reject(err); else resolve(this.changes);
      });
    });
    res.json({ success: true });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ success: false, error: 'PIN already in use' });
    }
    console.error('Error updating pin_user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/auth/pin/pin-users/:id/toggle
 * Toggle active/inactive for a pin user
 */
router.patch('/pin-users/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    await new Promise((resolve, reject) => {
      db.run('UPDATE pin_users SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?', [id], function(err) {
        if (err) reject(err); else resolve(this.changes);
      });
    });
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id, name, role, active, auto_lock_seconds FROM pin_users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err); else resolve(row || null);
      });
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error toggling pin_user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/auth/pin/pin-users/:id/autolock
 * Set auto_lock_seconds for a pin user
 * Body: { seconds: 60 }
 */
router.put('/pin-users/:id/autolock', async (req, res) => {
  try {
    const { id } = req.params;
    const { seconds } = req.body;
    const secs = parseInt(seconds, 10);
    if (isNaN(secs) || secs < 30 || secs > 120) {
      return res.status(400).json({ success: false, error: 'seconds must be between 30 and 120' });
    }
    const db = await dbPromise;
    await new Promise((resolve, reject) => {
      db.run('UPDATE pin_users SET auto_lock_seconds = ? WHERE id = ?', [secs, id], function(err) {
        if (err) reject(err); else resolve(this.changes);
      });
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting autolock:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

