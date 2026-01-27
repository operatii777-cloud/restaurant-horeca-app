/**
 * PHASE S5.2 - PDF Controller Helper
 * Common helper function for all PDF endpoints
 * PHASE S5.6 - Extended for print-friendly mode
 */

const { pdfEngineService } = require('./pdf-engine.service');

/**
 * Generate PDF response for a tipizate document
 * @param {string} docType - Document type
 * @param {number} docId - Document ID
 * @param {object} res - Express response
 * @param {object} req - Express request (optional, for query params)
 */
async function generatePdfResponse(docType, docId, res, req = null) {
  try {
    // PHASE S5.6 - Extract print options from query params
    const printOptions = req ? {
      format: req.query.format || undefined, // 'A4' or 'A5'
      printerFriendly: req.query.printerFriendly === 'true' || req.query.print === 'true',
      monochrome: req.query.monochrome === 'true' || req.query.color === 'false',
    } : {};
    
    const pdfBuffer = await pdfEngineService.generatePdf(docType, docId, printOptions);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${docType}-${docId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.send(pdfBuffer);
  } catch (error) {
    throw error;
  }
}

module.exports = { generatePdfResponse };

