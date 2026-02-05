/**
 * PHASE S8.7 + FAZA 1 - ANAF Submit Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for ANAF submission, token management, certificate management, and health dashboard
 */

// express, router and controller are normally provided by the module loader
// but we define them here if not already available for testing or direct usage
const express_lib = require('express');
const router_inst = express_lib.Router();
const controller_inst = require('./anafSubmit.controller');
const multer_lib = require('multer');
const fs_lib = require('fs');
const path_lib = require('path');

// Configure multer for certificate upload
const upload = multer_lib({
  storage: multer_lib.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const certDir = path_lib.join(__dirname, '../../../certificates');
      if (!fs_lib.existsSync(certDir)) {
        fs_lib.mkdirSync(certDir, { recursive: true });
      }
      cb(null, certDir);
    },
    filename: (req: any, file: any, cb: any) => {
      cb(null, `anaf-cert-${Date.now()}.pfx`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req: any, file: any, cb: any) => {
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
router_inst.get('/status/:id', controller_inst.getStatus);
router_inst.post('/resubmit/:id', controller_inst.resubmit);
router_inst.get('/journal', controller_inst.getJournal);

/**
 * FAZA 1.1 - Token Management
 */
router_inst.post('/token/refresh', controller_inst.refreshToken);

/**
 * FAZA 1.2 - Certificate Management
 */
router_inst.post('/certificate/upload', upload.single('certificate'), async (req: any, res: any, next: any) => {
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
    await new Promise<void>((resolve, reject) => {
      db.run('UPDATE anaf_certificates SET is_active = 0 WHERE is_active = 1', [], (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insert new certificate
    const certificatePath = req.file.path;
    const expiryDate = null; // TODO: Extract from certificate

    await new Promise<void>((resolve, reject) => {
      db.run(`
        INSERT INTO anaf_certificates (
          certificate_path,
          certificate_password_encrypted,
          expiry_date,
          is_active
        ) VALUES (?, ?, ?, 1)
      `, [certificatePath, password, expiryDate], (err: any) => {
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

router_inst.get('/certificate/status', async (req: any, res: any, next: any) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;

    const certificate: any = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM anaf_certificates 
        WHERE is_active = 1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [], (err: any, row: any) => {
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

router_inst.delete('/certificate', async (req: any, res: any, next: any) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;

    await new Promise<void>((resolve, reject) => {
      db.run('UPDATE anaf_certificates SET is_active = 0 WHERE is_active = 1', [], (err: any) => {
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
router_inst.get('/health', controller_inst.getAnafHealth);
router_inst.get('/submissions', controller_inst.getSubmissions);
router_inst.get('/config', controller_inst.getAnafConfig);
router_inst.get('/transmission-log', controller_inst.getJournal); // Alias for journal

module.exports = router_inst;
