/**
 * FAZA 1.4 - PDF QR Code Helper
 * 
 * Generates QR codes for ANAF SPV links and other fiscal information
 */

const QRCode = require('qrcode');
const { dbPromise } = require('../../../../database');

/**
 * Generate QR code as base64 PNG
 */
async function generateQRCodeBase64(text: string, size: number = 200): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return qrDataUrl;
  } catch (error) {
    console.error('[PDF QR] Error generating QR code:', error);
    // Return placeholder if QR generation fails
    return '';
  }
}

/**
 * Generate ANAF SPV QR code URL
 * 
 * Format: https://www.anaf.ro/anaf/internet/ANAF/SPV/verificare_factura?cui={CUI}&serie={SERIE}&numar={NUMAR}
 */
async function generateAnafQRUrl(documentType: string, documentId: number): Promise<string> {
  try {
    const db = await dbPromise;
    
    // Get document info
    const document = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tipizate WHERE id = ?',
        [documentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!document) {
      return '';
    }

    // Get company CUI from fiscal config
    const fiscalConfig = await new Promise((resolve, reject) => {
      db.get(
        'SELECT config_value FROM fiscal_config WHERE config_name = ?',
        ['company_cui'],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const cui = fiscalConfig?.config_value || '';
    const serie = document.series || '';
    const numar = document.number || '';

    // Build ANAF SPV verification URL
    const anafUrl = `https://www.anaf.ro/anaf/internet/ANAF/SPV/verificare_factura?cui=${encodeURIComponent(cui)}&serie=${encodeURIComponent(serie)}&numar=${encodeURIComponent(numar)}`;
    
    return anafUrl;
  } catch (error) {
    console.error('[PDF QR] Error generating ANAF URL:', error);
    return '';
  }
}

/**
 * Get ANAF submission status for document
 */
async function getAnafSubmissionStatus(documentType: string, documentId: number): Promise<{
  status: 'PENDING' | 'RECEIVED' | 'VALID' | 'ERROR' | 'NONE';
  anafId: string | null;
  timestamp: string | null;
}> {
  try {
    const db = await dbPromise;
    
    const journal = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM anaf_journal WHERE document_type = ? AND document_id = ? ORDER BY created_at DESC LIMIT 1',
        [documentType, documentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!journal) {
      return { status: 'NONE', anafId: null, timestamp: null };
    }

    const statusMap: Record<string, 'PENDING' | 'RECEIVED' | 'VALID' | 'ERROR'> = {
      'PENDING': 'PENDING',
      'PROCESSING': 'PENDING',
      'SUBMITTED': 'RECEIVED',
      'CONFIRMED': 'VALID',
      'ACK': 'VALID',
      'FAILED': 'ERROR',
      'REJECTED': 'ERROR',
      'DEAD_LETTER': 'ERROR',
    };

    return {
      status: statusMap[journal.status] || 'PENDING',
      anafId: journal.anaf_id || null,
      timestamp: journal.created_at || null,
    };
  } catch (error) {
    console.error('[PDF QR] Error getting ANAF status:', error);
    return { status: 'NONE', anafId: null, timestamp: null };
  }
}

/**
 * Get unique ANAF code for document
 */
async function getAnafUniqueCode(documentType: string, documentId: number): Promise<string | null> {
  try {
    const db = await dbPromise;
    
    const journal = await new Promise((resolve, reject) => {
      db.get(
        'SELECT anaf_id FROM anaf_journal WHERE document_type = ? AND document_id = ? ORDER BY created_at DESC LIMIT 1',
        [documentType, documentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    return journal?.anaf_id || null;
  } catch (error) {
    console.error('[PDF QR] Error getting ANAF code:', error);
    return null;
  }
}

module.exports = {
  generateQRCodeBase64,
  generateAnafQRUrl,
  getAnafSubmissionStatus,
  getAnafUniqueCode,
};

