/**
 * PHASE S5.2 - Aviz Template
 */

function renderAvizTemplate(doc, data) {
  const { document, fiscalHeader, lines, totals } = data;

  doc.fontSize(16).font('Helvetica-Bold').text('AVIZ DE EXPEDIERE', { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  doc.text(`Locație: ${document.locationName || 'N/A'}`);
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
  
  if (documentData.destinationName) {
    doc.fontSize(11).font('Helvetica-Bold').text('DESTINATAR:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nume: ${documentData.destinationName}`);
    if (documentData.destinationAddress) doc.text(`Adresă: ${documentData.destinationAddress}`);
    doc.moveDown();
  }

  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Produse expediate:', { underline: true });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 250;
    const unitPriceX = 320;
    const totalX = 480;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Produs', itemX, tableTop);
    doc.text('Cant.', qtyX, tableTop);
    doc.text('Preț Unit.', unitPriceX, tableTop);
    doc.text('Total', totalX, tableTop);

    doc.moveTo(itemX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    let y = doc.y;
    doc.fontSize(9).font('Helvetica');
    lines.forEach((line) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }

      doc.text(line.productName || 'N/A', itemX, y);
      doc.text(line.quantity.toFixed(2), qtyX, y);
      doc.text(line.unitPrice.toFixed(2), unitPriceX, y);
      doc.text(line.totalWithVat.toFixed(2), totalX, y);

      y += 15;
    });

    doc.y = y;
    doc.moveDown();
  }

  doc.moveDown();
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`TOTAL: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.moveDown();

  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica');
  doc.text('Expediat de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
  doc.text('Primit de:', 350, doc.y - 20);
  doc.text('___________________', 350, doc.y);
}

module.exports = { renderAvizTemplate };

