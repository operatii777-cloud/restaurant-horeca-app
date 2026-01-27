/**
 * PHASE S5.2 - NIR Template
 * Individual template for NIR (Nota de Intrare în Rezervă) documents
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';

export interface NirTemplateData {
  document: TipizatBase;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render NIR document template
 */
export function renderNirTemplate(doc: PDFDocument, data: NirTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;

  // Header fiscal
  doc.fontSize(16).font('Helvetica-Bold').text('NOTĂ DE INTRARE ÎN REZERVĂ (NIR)', { align: 'center' });
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
    if (fiscalHeader.companyAddress) doc.text(`Adresă: ${fiscalHeader.companyAddress}`);
    doc.moveDown();
  }

  // Tabel linii
  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Produse:', { underline: true });
    doc.moveDown(0.3);

    // Header tabel
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 250;
    const unitPriceX = 320;
    const vatX = 400;
    const totalX = 480;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Produs', itemX, tableTop);
    doc.text('Cant.', qtyX, tableTop);
    doc.text('Preț Unit.', unitPriceX, tableTop);
    doc.text('TVA%', vatX, tableTop);
    doc.text('Total', totalX, tableTop);

    // Linie separator
    doc.moveTo(itemX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Linii produse
    let y = doc.y;
    doc.fontSize(9).font('Helvetica');
    lines.forEach((line, index) => {
      if (y > 750) {
        // New page
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

  // Totaluri
  doc.moveDown();
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`Subtotal: ${totals.subtotal?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.text(`TVA: ${totals.vatAmount?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.fontSize(12);
  doc.text(`TOTAL: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.moveDown();

  // Semnături
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica');
  doc.text('Primit de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
  doc.text('Livrat de:', 350, doc.y - 20);
  doc.text('___________________', 350, doc.y);
}

