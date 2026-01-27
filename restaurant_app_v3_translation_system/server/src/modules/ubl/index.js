/**
 * PHASE S8.1 - UBL Core Module
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Unified UBL 2.1 + CIUS-RO invoice generation
 */

const { buildUblInvoice } = require('./ubl.builder');
const {
  UBL_NAMESPACES,
  CIUS_RO,
  INVOICE_TYPE_CODES,
  PAYMENT_MEANS_CODES,
  TAX_CATEGORY_CODES,
  UNIT_CODES,
  DEFAULT_CURRENCY
} = require('./ubl.config');

module.exports = {
  // Main builder function
  buildUblInvoice,
  
  // Configuration
  UBL_NAMESPACES,
  CIUS_RO,
  INVOICE_TYPE_CODES,
  PAYMENT_MEANS_CODES,
  TAX_CATEGORY_CODES,
  UNIT_CODES,
  DEFAULT_CURRENCY
};


