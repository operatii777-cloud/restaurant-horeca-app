/**
 * ✅ SĂPTĂMÂNA 1 - SECURITATE: Session rotation pentru securitate îmbunătățită
 * 
 * Rotire automată a sesiunilor pentru a preveni session hijacking
 */

const crypto = require('crypto');

/**
 * Generează un nou session token
 * @returns {string} Session token
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Rotește sesiunea unui utilizator (generează token nou și invalidează cel vechi)
 * @param {Object} db - Database connection
 * @param {number} userId - ID utilizator
 * @param {string} oldToken - Token-ul vechi
 * @returns {Promise<Object>} { newToken, expiresAt }
 */
async function rotateSession(db, userId, oldToken) {
  return new Promise((resolve, reject) => {
    // Generează token nou
    const newToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 ore

    // Începe tranzacție
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err);

        // 1. Invalidează sesiunea veche
        db.run(
          'DELETE FROM user_sessions WHERE user_id = ? AND session_token = ?',
          [userId, oldToken],
          (err) => {
            if (err) {
              db.run('ROLLBACK', () => reject(err));
              return;
            }

            // 2. Creează sesiune nouă
            db.run(
              `INSERT INTO user_sessions (user_id, session_token, expires_at, last_activity, created_at)
               VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
              [userId, newToken, expiresAt.toISOString()],
              function(err) {
                if (err) {
                  db.run('ROLLBACK', () => reject(err));
                  return;
                }

                // 3. Commit
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK', () => reject(err));
                    return;
                  }

                  resolve({
                    newToken,
                    expiresAt: expiresAt.toISOString(),
                  });
                });
              }
            );
          }
        );
      });
    });
  });
}

/**
 * Verifică dacă o sesiune trebuie rotită (după X minute de activitate)
 * @param {Object} db - Database connection
 * @param {string} sessionToken - Token-ul sesiunii
 * @param {number} rotationIntervalMinutes - Interval pentru rotire (default: 30 minute)
 * @returns {Promise<boolean>} true dacă sesiunea trebuie rotită
 */
async function shouldRotateSession(db, sessionToken, rotationIntervalMinutes = 30) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT created_at, last_activity FROM user_sessions WHERE session_token = ?`,
      [sessionToken],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(false);

        const lastActivity = new Date(row.last_activity);
        const now = new Date();
        const minutesSinceCreation = (now - new Date(row.created_at)) / (1000 * 60);

        // Rotește dacă au trecut mai mult de X minute de la creare
        resolve(minutesSinceCreation >= rotationIntervalMinutes);
      }
    );
  });
}

/**
 * Rotește automat sesiunea dacă este necesar
 * @param {Object} db - Database connection
 * @param {number} userId - ID utilizator
 * @param {string} sessionToken - Token-ul sesiunii
 * @param {number} rotationIntervalMinutes - Interval pentru rotire (default: 30 minute)
 * @returns {Promise<Object|null>} { newToken, expiresAt } sau null dacă nu este necesară rotirea
 */
async function autoRotateSessionIfNeeded(db, userId, sessionToken, rotationIntervalMinutes = 30) {
  const needsRotation = await shouldRotateSession(db, sessionToken, rotationIntervalMinutes);
  
  if (needsRotation) {
    return await rotateSession(db, userId, sessionToken);
  }
  
  return null;
}

/**
 * Invalidează toate sesiunile unui utilizator (excepție: sesiunea curentă)
 * @param {Object} db - Database connection
 * @param {number} userId - ID utilizator
 * @param {string} currentToken - Token-ul sesiunii curente (nu va fi invalidat)
 * @returns {Promise<number>} Numărul de sesiuni invalidate
 */
async function invalidateOtherSessions(db, userId, currentToken) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM user_sessions WHERE user_id = ? AND session_token != ?',
      [userId, currentToken],
      function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

module.exports = {
  generateSessionToken,
  rotateSession,
  shouldRotateSession,
  autoRotateSessionIfNeeded,
  invalidateOtherSessions,
};

