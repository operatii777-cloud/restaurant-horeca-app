/**
 * FAZA 1.2 - Certificate Manager Controller
 * 
 * Handles certificate upload, validation, and status
 */

const { dbPromise } = require('../../../../database');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * POST /api/anaf/certificate/upload
 * Upload certificate .pfx file
 */
async function uploadCertificate(req, res, next) {
  try {
    if (!req.files || !req.files.certificate) {
      return res.status(400).json({ success: false, error: 'Certificate file is required' });
    }
    
    const certificateFile = req.files.certificate;
    const password = req.body.password || '';
    
    // Validate file type
    if (!certificateFile.name.endsWith('.pfx') && !certificateFile.name.endsWith('.p12')) {
      return res.status(400).json({ success: false, error: 'Certificate must be .pfx or .p12 file' });
    }
    
    // Create certificates directory if it doesn't exist
    const certsDir = path.join(__dirname, '../../../certificates');
    await fs.mkdir(certsDir, { recursive: true });
    
    // Save certificate file
    const certFileName = `anaf_certificate_${Date.now()}.pfx`;
    const certPath = path.join(certsDir, certFileName);
    await fs.writeFile(certPath, certificateFile.data);
    
    // Validate certificate (basic check - try to read it)
    let isValid = false;
    let expiryDate = null;
    try {
      // TODO: Use node-forge or similar to actually parse and validate .pfx
      // For now, we'll just check if file exists and is readable
      const stats = await fs.stat(certPath);
      isValid = stats.isFile();
      
      // Placeholder: In production, parse certificate to get expiry date
      // For now, set expiry to 1 year from now (placeholder)
      expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } catch (err) {
      console.error('[Certificate] Validation error:', err);
      isValid = false;
    }
    
    // Encrypt password before storing
    const encryptionKey = process.env.ANAF_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production-32chars!!';
    const key = crypto.scryptSync(encryptionKey.slice(0, 32), 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedPassword = cipher.update(password, 'utf8', 'hex');
    encryptedPassword += cipher.final('hex');
    const encryptedPasswordFull = iv.toString('hex') + ':' + encryptedPassword;
    
    // Store certificate info in database
    const db = await dbPromise;
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE fiscal_config 
        SET config_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE config_name = 'anaf_certificate_path'
      `, [certPath], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE fiscal_config 
        SET config_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE config_name = 'anaf_certificate_password'
      `, [encryptedPasswordFull], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Store certificate metadata
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO anaf_certificates (
          id,
          file_path,
          file_name,
          expiry_date,
          is_valid,
          uploaded_at,
          updated_at
        ) VALUES (
          1,
          ?,
          ?,
          ?,
          ?,
          datetime('now'),
          datetime('now')
        )
      `, [certPath, certFileName, expiryDate.toISOString(), isValid ? 1 : 0], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        fileName: certFileName,
        expiryDate: expiryDate.toISOString(),
        isValid
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/anaf/certificate/status
 * Get certificate status
 */
async function getCertificateStatus(req, res, next) {
  try {
    const db = await dbPromise;
    
    const cert = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM anaf_certificates WHERE id = 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!cert) {
      return res.json({
        success: true,
        data: {
          hasCertificate: false,
          status: 'missing',
          message: 'No certificate uploaded'
        }
      });
    }
    
    const now = new Date();
    const expiryDate = new Date(cert.expiry_date);
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    let status = 'valid';
    if (!cert.is_valid) {
      status = 'invalid';
    } else if (daysUntilExpiry < 0) {
      status = 'expired';
    } else if (daysUntilExpiry <= 30) {
      status = 'expiring_soon';
    }
    
    res.json({
      success: true,
      data: {
        hasCertificate: true,
        status,
        fileName: cert.file_name,
        expiryDate: cert.expiry_date,
        daysUntilExpiry: Math.round(daysUntilExpiry),
        uploadedAt: cert.uploaded_at
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/anaf/certificate
 * Delete certificate
 */
async function deleteCertificate(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Get certificate path
    const cert = await new Promise((resolve, reject) => {
      db.get(`
        SELECT file_path FROM anaf_certificates WHERE id = 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (cert && cert.file_path) {
      try {
        await fs.unlink(cert.file_path);
      } catch (err) {
        console.warn('[Certificate] Error deleting file:', err);
      }
    }
    
    // Delete from database
    await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM anaf_certificates WHERE id = 1
      `, [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Clear config
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE fiscal_config 
        SET config_value = '', updated_at = CURRENT_TIMESTAMP
        WHERE config_name = 'anaf_certificate_path'
      `, [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadCertificate,
  getCertificateStatus,
  deleteCertificate
};

