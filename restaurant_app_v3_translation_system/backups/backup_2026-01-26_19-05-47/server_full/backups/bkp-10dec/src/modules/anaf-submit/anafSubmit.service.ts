/**
 * PHASE S8.7 - ANAF Submit Service v2
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Direct submission to ANAF SPV v2 with queue, retries, and signatures
 */

const axios = require('axios');
const AnafQueueService = require('./queue/anafQueue.service');
const AnafJournalRepository = require('./journal/anafJournal.repository');
const { signXml } = require('./utils/crypto');

/**
 * PHASE S8.7 - Queue document for ANAF submission
 */
async function queueDocument(documentType: string, documentId: number, xml: string, priority: 'high' | 'normal' = 'normal') {
  // Sign XML if certificate available
  let signedXml = xml;
  try {
    if (process.env.ANAF_CERTIFICATE_PATH) {
      signedXml = await signXml(xml);
    }
  } catch (signError) {
    console.warn('[ANAF Submit] XML signing failed, submitting unsigned:', signError.message);
  }

  // Add to queue
  const job = await AnafQueueService.enqueue({
    documentType,
    documentId,
    xml: signedXml,
    priority
  });

  // Log to journal
  await AnafJournalRepository.create({
    document_id: documentId,
    document_type: documentType,
    xml: signedXml,
    status: 'QUEUED',
    attempts: 0
  });

  return job;
}

/**
 * PHASE S8.7 - Submit document directly to ANAF SPV v2
 */
async function submitToANAF(documentType: string, documentId: number, xml: string) {
  if (!process.env.ANAF_SPV_URL || !process.env.ANAF_SPV_TOKEN) {
    throw new Error('ANAF SPV configuration missing (ANAF_SPV_URL, ANAF_SPV_TOKEN)');
  }

  // Sign XML
  let signedXml = xml;
  try {
    if (process.env.ANAF_CERTIFICATE_PATH) {
      signedXml = await signXml(xml);
    }
  } catch (signError) {
    console.warn('[ANAF Submit] XML signing failed:', signError.message);
  }

  // Submit to SPV
  try {
    const response = await axios.post(
      `${process.env.ANAF_SPV_URL}/api/v2/invoices`,
      {
        xml: signedXml,
        documentType,
        documentId
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ANAF_SPV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Update journal
    await AnafJournalRepository.updateStatus(documentId, documentType, 'SUBMITTED', {
      spvId: response.data.id,
      responseXml: JSON.stringify(response.data),
      submittedAt: new Date()
    });

    return {
      success: true,
      spvId: response.data.id,
      message: 'Document submitted to ANAF successfully'
    };
  } catch (error: any) {
    // Update journal with error
    await AnafJournalRepository.updateStatus(documentId, documentType, 'FAILED', {
      error: error.message,
      responseXml: error.response ? JSON.stringify(error.response.data) : null
    });

    throw new Error(`ANAF submission failed: ${error.message}`);
  }
}

/**
 * PHASE S8.7 - Get submission status
 */
async function getSubmissionStatus(documentId: number, documentType: string) {
  const journal = await AnafJournalRepository.getByDocument(documentId, documentType);
  return journal || null;
}

/**
 * PHASE S8.7 - Resubmit failed document
 */
async function resubmitDocument(documentId: number, documentType: string) {
  const journal = await AnafJournalRepository.getByDocument(documentId, documentType);
  if (!journal) {
    throw new Error('Document not found in journal');
  }

  // Re-queue for submission
  return await queueDocument(documentType, documentId, journal.xml, 'high');
}

module.exports = {
  queueDocument,
  submitToANAF,
  getSubmissionStatus,
  resubmitDocument
};


