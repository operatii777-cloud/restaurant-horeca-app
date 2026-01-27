/**
 * PHASE S5.2 - PDF Helpers
 * Utility functions for PDF generation
 */

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function getWatermarkText(status) {
  switch (status) {
    case 'DRAFT':
      return 'NESEMNAT';
    case 'LOCKED':
      return 'BLOCAT';
    case 'SIGNED':
      return 'SEMNAT DIGITAL';
    default:
      return null;
  }
}

function getDocumentTitle(docType) {
  const titles: Record<string, string> = {
    NIR: 'Notă de Intrare în Receptie',
    BON_CONSUM: 'Bon de Consum',
    TRANSFER: 'Transfer Gestiuni',
    INVENTAR: 'Inventar',
    FACTURA: 'Factură Fiscală',
    CHITANTA: 'Chitanță',
    REGISTRU_CASA: 'Registru de Casă',
    RAPORT_GESTIUNE: 'Raport de Gestiune',
    RAPORT_X: 'Raport X',
    RAPORT_Z: 'Raport Z',
    RAPORT_LUNAR: 'Raport Lunar',
    AVIZ: 'Aviz de Însoțire',
    PROCES_VERBAL: 'Proces Verbal',
    RETUR: 'Restituire',
  };
  return titles[docType] || docType;
}

function buildFiscalHeader(fiscalHeader) {
  return `
${fiscalHeader.companyName}
CUI: ${fiscalHeader.companyCUI}
${fiscalHeader.companyAddress}
${fiscalHeader.companyPhone ? `Tel: ${fiscalHeader.companyPhone}` : ''}
${fiscalHeader.companyEmail ? `Email: ${fiscalHeader.companyEmail}` : ''}
Cod Fiscal: ${fiscalHeader.fiscalCode}
  `.trim();
}

function calculatePageBreak(currentY, pageHeight, marginBottom) {
  return currentY > pageHeight - marginBottom - 50;
}

module.exports = {
  formatDate,
  formatCurrency,
  formatNumber,
  getWatermarkText,
  getDocumentTitle,
  buildFiscalHeader,
  calculatePageBreak,
};

