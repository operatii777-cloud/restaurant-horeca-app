/**
 * PHASE S8.3 - Migration: Add ubl_xml column to tipizate_documents
 * 
 * Restaurant App V3 powered by QrOMS
 */

const { dbPromise } = require('../../../../database');

async function addUblXmlColumn() {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(
      `ALTER TABLE tipizate_documents ADD COLUMN ubl_xml TEXT`,
      (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Error adding ubl_xml column:', err.message);
          reject(err);
        } else {
          console.log('✅ ubl_xml column added to tipizate_documents');
          resolve();
        }
      }
    );
  });
}

module.exports = { addUblXmlColumn };


