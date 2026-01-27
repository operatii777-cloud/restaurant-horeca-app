/**
 * PHASE S8.5 - SAF-T Service
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Service layer for SAF-T validation
 */

const {
  validateFiscalReceipt,
  validateUBL,
  validateTipizat,
  validateStockTransaction,
  validatePayment
} = require('./saft.validator');

/**
 * PHASE S8.5 - Validate fiscal receipt
 */
async function validateFiscalReceiptData(receiptData: any) {
  return validateFiscalReceipt(receiptData);
}

/**
 * PHASE S8.5 - Validate UBL XML
 */
async function validateUBLXml(documentType: string, xml: string) {
  return validateUBL(documentType, xml);
}

/**
 * PHASE S8.5 - Validate tipizate document
 */
async function validateTipizatDocument(docType: string, document: any) {
  return validateTipizat(docType, document);
}

/**
 * PHASE S8.5 - Validate stock transaction
 */
async function validateStockTransactionData(stockMove: any) {
  return validateStockTransaction(stockMove);
}

/**
 * PHASE S8.5 - Validate payment
 */
async function validatePaymentData(payment: any) {
  return validatePayment(payment);
}

module.exports = {
  validateFiscalReceiptData,
  validateUBLXml,
  validateTipizatDocument,
  validateStockTransactionData,
  validatePaymentData
};


