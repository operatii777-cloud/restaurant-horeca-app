/**
 * PHASE S8.7 + FAZA 1 - ANAF Submit Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for ANAF submission, token management, certificate management, and health dashboard
 */

const express = require('express');
const router = express.Router();
const controller = require('./anafSubmit.controller');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for certificate upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const certDir = path.join(__dirname, '../../../certificates');
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }
      cb(null, certDir);
    },
    filename: (req, file, cb) => {
      cb(null, `anaf-cert-${Date.now()}.pfx`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/x-pkcs12' || 
        file.originalname.endsWith('.pfx') || 
        file.originalname.endsWith('.p12')) {
      cb(null, true);
    } else {
      cb(new Error('Only .pfx or .p12 certificate files are allowed'));
    }
  }
});

/**
 * Legacy endpoints
 */
router.get('/status/:id', controller.getStatus);
router.post('/resubmit/:id', controller.resubmit);
router.get('/journal', controller.getJournal);

/**
 * FAZA 1.1 - Token Management
 */
router.post('/token/refresh', controller.refreshToken);

/**
 * FAZA 1.2 - Certificate Management
 */
router.post('/certificate/upload', upload.single('certificate'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No certificate file provided' });
    }
    
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Certificate password is required' });
    }
    
    // TODO: Validate certificate and extract expiry date
    // For now, store the certificate path
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    // Deactivate old certificates
    await new Promise((resolve, reject) => {
      db.run('UPDATE anaf_certificates SET is_active = 0 WHERE is_active = 1', [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Insert new certificate
    const certificatePath = req.file.path;
    const expiryDate = null; // TODO: Extract from certificate
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO anaf_certificates (
          certificate_path,
          certificate_password_encrypted,
          expiry_date,
          is_active
        ) VALUES (?, ?, ?, 1)
      `, [certificatePath, password, expiryDate], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        path: certificatePath,
        expiryDate
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/certificate/status', async (req, res, next) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    const certificate = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM anaf_certificates 
        WHERE is_active = 1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!certificate) {
      return res.json({
        success: true,
        data: { hasCertificate: false }
      });
    }
    
    const isExpired = certificate.expiry_date 
      ? new Date(certificate.expiry_date) < new Date()
      : null;
    
    const daysUntilExpiry = certificate.expiry_date
      ? Math.ceil((new Date(certificate.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    res.json({
      success: true,
      data: {
        hasCertificate: true,
        expiryDate: certificate.expiry_date,
        isExpired,
        daysUntilExpiry,
        createdAt: certificate.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/certificate', async (req, res, next) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run('UPDATE anaf_certificates SET is_active = 0 WHERE is_active = 1', [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Certificate deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * FAZA 1.7 - ANAF Health Dashboard
 */
router.get('/health', controller.getAnafHealth);
router.get('/submissions', controller.getSubmissions);

module.exports = router;
