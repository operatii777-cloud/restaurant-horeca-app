/**
 * PHASE S5.2 - Factură Template
 */

function renderFacturaTemplate(doc, data) {
  const { document, fiscalHeader, lines, totals } = data;

  doc.fontSize(18).font('Helvetica-Bold').text('FACTURĂ FISCALĂ', { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(11).font('Helvetica-Bold');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.fontSize(10).font('Helvetica');
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  doc.moveDown();

  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('FURNIZOR:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Denumire: ${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    if (fiscalHeader.companyAddress) doc.text(`Adresă: ${fiscalHeader.companyAddress}`);
    doc.moveDown();
  }

  const documentData = typeof document.documentData === 'string' 
    ? JSON.parse(document.documentData) 
    : document.documentData || {};
  
  if (documentData.clientName) {
    doc.fontSize(11).font('Helvetica-Bold').text('CLIENT:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Denumire: ${documentData.clientName}`);
    if (documentData.clientCUI) doc.text(`CUI: ${documentData.clientCUI}`);
    if (documentData.clientAddress) doc.text(`Adresă: ${documentData.clientAddress}`);
    doc.moveDown();
  }

  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Produse/Servicii:', { underline: true });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 200;
    const unitPriceX = 280;
    const vatX = 360;
    const totalX = 480;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Produs', itemX, tableTop);
    doc.text('Cant.', qtyX, tableTop);
    doc.text('Preț Unit.', unitPriceX, tableTop);
    doc.text('TVA%', vatX, tableTop);
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
      doc.text(`${line.vatRate.toFixed(0)}%`, vatX, y);
      doc.text(line.totalWithVat.toFixed(2), totalX, y);

      y += 15;
    });

    doc.y = y;
    doc.moveDown();
  }

  doc.moveDown();
  doc.fontSize(10).font('Helvetica');
  doc.text(`Subtotal: ${totals.subtotal?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.text(`TVA: ${totals.vatAmount?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`TOTAL: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.moveDown();

  doc.moveDown();
  doc.fontSize(8).font('Helvetica');
  doc.text('Acest document fiscal este emis în conformitate cu Legea nr. 227/2015 privind Codul fiscal.', { align: 'center' });
  doc.text(`ID Document: ${document.id} | Versiune: ${document.version}`, { align: 'center' });
}

module.exports = { renderFacturaTemplate };

