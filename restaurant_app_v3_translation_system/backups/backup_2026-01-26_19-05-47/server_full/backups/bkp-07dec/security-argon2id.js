/**
 * ✅ SĂPTĂMÂNA 1 - SECURITATE: Argon2id hashing pentru parole
 * 
 * Migrare de la bcrypt la Argon2id cu backward compatibility
 */

const bcrypt = require('bcrypt');

// Verifică dacă argon2 este disponibil
let argon2 = null;
try {
  argon2 = require('argon2');
} catch (error) {
  console.warn('⚠️ argon2 nu este instalat. Folosim bcrypt. Instalează cu: npm install argon2');
}

/**
 * Hash-uiește o parolă folosind Argon2id (sau bcrypt dacă Argon2id nu este disponibil)
 * @param {string} password - Parola plain text
 * @returns {Promise<string>} Hash-ul parolei
 */
async function hashPassword(password) {
  if (!password) {
    throw new Error('Parola nu poate fi goală');
  }

  if (argon2) {
    // Folosește Argon2id (recomandat)
    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3, // 3 iterations
        parallelism: 4, // 4 threads
      });
      return hash;
    } catch (error) {
      console.error('❌ Eroare la hash-uirea cu Argon2id, folosim bcrypt:', error);
      // Fallback la bcrypt
      return await bcrypt.hash(password, 10);
    }
  } else {
    // Fallback la bcrypt
    return await bcrypt.hash(password, 10);
  }
}

/**
 * Verifică o parolă împotriva unui hash (suportă atât Argon2id cât și bcrypt)
 * @param {string} password - Parola plain text
 * @param {string} hash - Hash-ul stocat
 * @returns {Promise<boolean>} true dacă parola este corectă
 */
async function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false;
  }

  // Verifică dacă hash-ul este Argon2id (începe cu $argon2id$)
  if (hash.startsWith('$argon2id$') || hash.startsWith('$argon2i$') || hash.startsWith('$argon2d$')) {
    if (argon2) {
      try {
        return await argon2.verify(hash, password);
      } catch (error) {
        console.error('❌ Eroare la verificarea cu Argon2id:', error);
        return false;
      }
    } else {
      console.warn('⚠️ Hash Argon2id detectat dar argon2 nu este instalat');
      return false;
    }
  }

  // Verifică dacă hash-ul este bcrypt (începe cu $2a$, $2b$, sau $2y$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('❌ Eroare la verificarea cu bcrypt:', error);
      return false;
    }
  }

  // Hash necunoscut
  console.warn('⚠️ Format hash necunoscut:', hash.substring(0, 20));
  return false;
}

/**
 * Migrează un hash bcrypt la Argon2id (opțional, pentru upgrade)
 * @param {string} password - Parola plain text (necesară pentru re-hash)
 * @param {string} oldHash - Hash-ul vechi (bcrypt)
 * @returns {Promise<string>} Hash nou (Argon2id)
 */
async function migrateHashToArgon2id(password, oldHash) {
  if (!argon2) {
    throw new Error('argon2 nu este instalat. Instalează cu: npm install argon2');
  }

  // Verifică parola veche
  const isValid = await verifyPassword(password, oldHash);
  if (!isValid) {
    throw new Error('Parola veche este incorectă');
  }

  // Generează hash nou cu Argon2id
  return await hashPassword(password);
}

module.exports = {
  hashPassword,
  verifyPassword,
  migrateHashToArgon2id,
  isArgon2Available: !!argon2,
};

