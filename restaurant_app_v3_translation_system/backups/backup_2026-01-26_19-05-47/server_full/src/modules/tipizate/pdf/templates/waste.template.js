/**
 * PHASE S5.2 - Waste Template (JavaScript version for Node.js)
 * Individual template for Waste documents
 */

const PDFDocument = require('pdfkit');

/**
 * Render Waste document template
 */
function renderWasteTemplate(doc, data) {
  const { document, fiscalHeader, lines, totals } = data;

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('PIERDERI / DETERIORĂRI', { align: 'center' });
  doc.moveDown(0.5);

  // Informații document
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  doc.text(`Locație: ${document.locationName || 'N/A'}`);
  doc.moveDown();

  // Header fiscal
  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('Date Fiscale:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Companie: ${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    doc.moveDown();
  }

  // Tabel linii
  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Produse deteriorate/pierdute:', { underline: true });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 250;
    const reasonX = 320;
    const unitPriceX = 400;
    const totalX = 480;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Ingredient', itemX, tableTop);
    doc.text('Cant.', qtyX, tableTop);
    doc.text('Motiv', reasonX, tableTop);
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

      doc.text(line.ingredientName || line.productName || 'N/A', itemX, y);
      doc.text(line.quantity.toFixed(2), qtyX, y);
      doc.text(line.reason || line.wasteReason || 'N/A', reasonX, y);
      doc.text((line.unitPrice || line.price || 0).toFixed(2), unitPriceX, y);
      doc.text((line.total || (line.quantity * (line.unitPrice || line.price || 0))).toFixed(2), totalX, y);

      y += 15;
    });

    doc.y = y;
    doc.moveDown();
  }

  // Totaluri
  doc.moveDown();
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`TOTAL PIERDERI: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.moveDown();

  // Semnături
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica');
  doc.text('Înregistrat de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
  doc.text('Aprobat de:', 300, doc.y - 20);
  doc.text('___________________', 300, doc.y);
}

module.exports = { renderWasteTemplate };

