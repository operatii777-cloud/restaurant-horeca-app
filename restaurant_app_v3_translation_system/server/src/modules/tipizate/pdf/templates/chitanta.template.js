/**
 * PHASE S5.2 - Chitanță Template
 */

function renderChitantaTemplate(doc, data) {
  const { document, fiscalHeader, lines, totals } = data;

  doc.fontSize(16).font('Helvetica-Bold').text('CHITANȚĂ', { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  doc.moveDown();

  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('Date Fiscale:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Companie: ${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    doc.moveDown();
  }

  const documentData = typeof document.documentData === 'string' 
    ? JSON.parse(document.documentData) 
    : document.documentData || {};
  
  if (documentData.clientName) {
    doc.fontSize(11).font('Helvetica-Bold').text('PRIMIT DE:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nume: ${documentData.clientName}`);
    if (documentData.clientCUI) doc.text(`CUI: ${documentData.clientCUI}`);
    doc.moveDown();
  }

  doc.moveDown();
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`Suma primită: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'center' });
  doc.moveDown();

  if (documentData.amountInWords) {
    doc.fontSize(10).font('Helvetica');
    doc.text(`Scris cu litere: ${documentData.amountInWords}`, { align: 'center' });
    doc.moveDown();
  }

  doc.moveDown(3);
  doc.fontSize(9).font('Helvetica');
  doc.text('Primit de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
  doc.text('Emis de:', 350, doc.y - 20);
  doc.text('___________________', 350, doc.y);
}

module.exports = { renderChitantaTemplate };

