/**
 * PHASE S8.7 - ANAF Submit Controller
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API endpoints for ANAF submission
 */

const AnafSubmitService = require('./anafSubmit.service');
const AnafJournalRepository = require('./journal/anafJournal.repository');

/**
 * GET /api/anaf/status/:id?documentType=FACTURA
 * Get submission status
 */
async function getStatus(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    const { documentType } = req.query;
    
    if (!documentType) {
      return res.status(400).json({
        success: false,
        error: 'Document type is required'
      });
    }

    const status = await AnafSubmitService.getSubmissionStatus(parseInt(id, 10), documentType);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('[ANAF Submit] Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get submission status'
    });
  }
}

/**
 * POST /api/anaf/resubmit/:id
 * Resubmit failed document
 */
async function resubmit(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    
    if (!documentType) {
      return res.status(400).json({
        success: false,
        error: 'Document type is required'
      });
    }

    const result = await AnafSubmitService.resubmitDocument(parseInt(id, 10), documentType);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('[ANAF Submit] Error resubmitting:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resubmit document'
    });
  }
}

/**
 * GET /api/anaf/journal
 * Get ANAF journal entries
 */
async function getJournal(req: any, res: any, next: any) {
  try {
    const { documentType, status, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    const entries = await AnafJournalRepository.list({
      documentType,
      status,
      startDate,
      endDate,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
    
    res.json({
      success: true,
      data: entries
    });
  } catch (error: any) {
    console.error('[ANAF Submit] Error getting journal:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get journal'
    });
  }
}

module.exports = {
  getStatus,
  resubmit,
  getJournal
};


