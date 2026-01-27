/**
 * PHASE S8.8 - ANAF Engine
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * ANAF submission integration
 */

const AnafSubmitService = require('../../modules/anaf-submit/anafSubmit.service');
const AnafQueueService = require('../../modules/anaf-submit/queue/anafQueue.service');
const AnafJournalRepository = require('../../modules/anaf-submit/journal/anafJournal.repository');

class AnafEngine {
  /**
   * PHASE S8.8 - Queue document for ANAF submission
   */
  async queueDocument(documentType: string, documentId: number, xml: string, priority: 'high' | 'normal' = 'normal') {
    return await AnafSubmitService.queueDocument(documentType, documentId, xml, priority);
  }

  /**
   * PHASE S8.8 - Submit document to ANAF
   */
  async submitDocument(documentType: string, documentId: number, xml: string) {
    return await AnafSubmitService.submitToANAF(documentType, documentId, xml);
  }

  /**
   * PHASE S8.8 - Get queue status
   */
  async getQueueStatus() {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT status, COUNT(*) as count 
         FROM anaf_queue 
         GROUP BY status`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else {
            const status: { [key: string]: number } = {};
            rows.forEach((row: any) => {
              status[row.status] = row.count;
            });
            resolve(status);
          }
        }
      );
    });
  }

  /**
   * PHASE S8.8 - Get journal stats
   */
  async getJournalStats() {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT status, COUNT(*) as count 
         FROM anaf_journal 
         GROUP BY status`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else {
            const stats: { [key: string]: number } = {};
            rows.forEach((row: any) => {
              stats[row.status] = row.count;
            });
            resolve(stats);
          }
        }
      );
    });
  }
}

module.exports = { AnafEngine };

