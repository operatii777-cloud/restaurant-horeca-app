/**
 * PHASE S8.3 - UBL Tipizate Controller
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Handles UBL generation requests for tipizate documents
 */

const ublTipizateService = require('./ublTipizate.service');
const tipizateRepository = require('../repositories/tipizate.repository').tipizateRepository;

/**
 * Generate UBL XML for a tipizate document
 * POST /api/tipizate/:docType/:id/ubl
 */
async function generateUBL(req: any, res: any, next: any) {
  try {
    const { docType, id } = req.params;
    const docId = parseInt(id, 10);

    if (!docId || isNaN(docId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID'
      });
    }

    // Generate UBL XML
    const xml = await ublTipizateService.buildUBLForTipizate(docType, docId);

    // Save to database
    await ublTipizateService.saveUBLXml(docType, docId, xml);

    // Get document for response
    const document = await tipizateRepository.getById(docId);

    res.json({
      success: true,
      data: {
        documentId: docId,
        documentType: docType,
        documentNumber: document ? `${document.series}-${document.number}` : null,
        xml: xml,
        xmlLength: xml.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('[UBL Tipizate] Error generating UBL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate UBL XML'
    });
  }
}

/**
 * Get UBL XML for a tipizate document
 * GET /api/tipizate/:docType/:id/ubl/xml
 */
async function getUBLXml(req: any, res: any, next: any) {
  try {
    const { docType, id } = req.params;
    const docId = parseInt(id, 10);

    if (!docId || isNaN(docId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID'
      });
    }

    // Get document
    const document = await tipizateRepository.getById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check if UBL XML exists
    if (document.ubl_xml) {
      res.setHeader('Content-Type', 'application/xml');
      res.send(document.ubl_xml);
    } else {
      // Generate if not exists
      const xml = await ublTipizateService.buildUBLForTipizate(docType, docId);
      await ublTipizateService.saveUBLXml(docType, docId, xml);
      res.setHeader('Content-Type', 'application/xml');
      res.send(xml);
    }
  } catch (error: any) {
    console.error('[UBL Tipizate] Error getting UBL XML:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get UBL XML'
    });
  }
}

/**
 * Download UBL XML for a tipizate document
 * GET /api/tipizate/:docType/:id/ubl/download
 */
async function downloadUBL(req: any, res: any, next: any) {
  try {
    const { docType, id } = req.params;
    const docId = parseInt(id, 10);

    if (!docId || isNaN(docId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID'
      });
    }

    // Get document
    const document = await tipizateRepository.getById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Get or generate UBL XML
    let xml = document.ubl_xml;
    if (!xml) {
      xml = await ublTipizateService.buildUBLForTipizate(docType, docId);
      await ublTipizateService.saveUBLXml(docType, docId, xml);
    }

    // Set download headers
    const filename = `${docType}_${document.series}-${document.number}_${new Date().toISOString().split('T')[0]}.xml`;
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(xml);
  } catch (error: any) {
    console.error('[UBL Tipizate] Error downloading UBL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download UBL XML'
    });
  }
}

module.exports = {
  generateUBL,
  getUBLXml,
  downloadUBL
};


