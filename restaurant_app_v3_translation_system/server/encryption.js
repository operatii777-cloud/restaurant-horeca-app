/**
 * 🔒 DATA ENCRYPTION MODULE
 * Encrypt/Decrypt date sensibile (PII, card details)
 * Folosește AES-256-CBC
 */

const crypto = require('crypto');

// Encryption key din environment variable (32 bytes pentru AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // Pentru AES, IV este întotdeauna 16 bytes

// Verifică dacă ENCRYPTION_KEY este setat corect
if (!process.env.ENCRYPTION_KEY) {
  console.warn('⚠️ ENCRYPTION_KEY nu este setat în .env - folosind key generat (NU ESTE SECUR PENTRU PRODUCTION!)');
}

// Derivează cheia de criptare din ENCRYPTION_KEY
function getEncryptionKey() {
  // Dacă ENCRYPTION_KEY este deja 32 bytes (64 hex chars), folosește-l direct
  if (ENCRYPTION_KEY.length === 64) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  // Altfel, derivează o cheie de 32 bytes folosind SHA-256
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypt text folosind AES-256-CBC
 * @param {string} text - Textul de criptat
 * @returns {string} - Text criptat în format: iv:encryptedText (hex)
 */
function encrypt(text) {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Returnează IV + encrypted text (separate prin :)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Eroare la encrypt:', error);
    throw new Error('Eroare la criptarea datelor');
  }
}

/**
 * Decrypt text folosind AES-256-CBC
 * @param {string} encryptedText - Text criptat în format: iv:encryptedText
 * @returns {string} - Text decriptat
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Format criptat invalid');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Eroare la decrypt:', error);
    // Dacă decriptarea eșuează, poate fi text necriptat (pentru migrare)
    // Returnează textul original
    return encryptedText;
  }
}

/**
 * Encrypt object (toate câmpurile sensibile)
 * @param {object} data - Obiectul cu date
 * @param {string[]} fieldsToEncrypt - Lista câmpurilor de criptat
 * @returns {object} - Obiect cu câmpurile criptate
 */
function encryptObject(data, fieldsToEncrypt = ['phone', 'email', 'card_last4', 'card_number']) {
  if (!data || typeof data !== 'object') return data;
  
  const encrypted = { ...data };
  
  fieldsToEncrypt.forEach(field => {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field]);
    }
  });
  
  return encrypted;
}

/**
 * Decrypt object (toate câmpurile sensibile)
 * @param {object} data - Obiectul cu date criptate
 * @param {string[]} fieldsToDecrypt - Lista câmpurilor de decriptat
 * @returns {object} - Obiect cu câmpurile decriptate
 */
function decryptObject(data, fieldsToDecrypt = ['phone', 'email', 'card_last4', 'card_number']) {
  if (!data || typeof data !== 'object') return data;
  
  const decrypted = { ...data };
  
  fieldsToDecrypt.forEach(field => {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decrypt(decrypted[field]);
    }
  });
  
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject
};

