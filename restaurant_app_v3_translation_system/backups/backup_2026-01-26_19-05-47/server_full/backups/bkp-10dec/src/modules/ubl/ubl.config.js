/**
 * PHASE S8.1 - UBL Core Configuration
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * UBL 2.1 + CIUS-RO compliant base (ready for migration to UBL 3.x)
 */

/**
 * UBL 2.1 Namespaces
 */
const UBL_NAMESPACES = {
  invoice: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
};

/**
 * CIUS-RO (Core Invoice Usage Specification - Romania)
 */
const CIUS_RO = {
  customizationID: 'urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1',
  profileID: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
};

/**
 * Invoice Type Codes
 */
const INVOICE_TYPE_CODES = {
  COMMERCIAL: '380',      // Commercial Invoice
  CREDIT_NOTE: '381',     // Credit Note
  DEBIT_NOTE: '383'       // Debit Note
};

/**
 * Payment Means Codes
 */
const PAYMENT_MEANS_CODES = {
  CREDIT_TRANSFER: '30',  // Credit transfer (virament)
  CASH: '10',             // Cash
  CHECK: '20',            // Check
  CARD: '48'              // Card
};

/**
 * Tax Category Codes
 */
const TAX_CATEGORY_CODES = {
  STANDARD: 'S',         // Standard rate
  ZERO_RATED: 'Z',       // Zero rated
  EXEMPT: 'E',           // Exempt
  REVERSE_CHARGE: 'AE'   // Reverse charge
};

/**
 * Unit Codes (UN/ECE Recommendation 20)
 */
const UNIT_CODES = {
  PIECE: 'C62',          // Piece
  KILOGRAM: 'KGM',       // Kilogram
  LITER: 'LTR',          // Liter
  METER: 'MTR'           // Meter
};

/**
 * Default Currency
 */
const DEFAULT_CURRENCY = 'RON';

module.exports = {
  UBL_NAMESPACES,
  CIUS_RO,
  INVOICE_TYPE_CODES,
  PAYMENT_MEANS_CODES,
  TAX_CATEGORY_CODES,
  UNIT_CODES,
  DEFAULT_CURRENCY
};


