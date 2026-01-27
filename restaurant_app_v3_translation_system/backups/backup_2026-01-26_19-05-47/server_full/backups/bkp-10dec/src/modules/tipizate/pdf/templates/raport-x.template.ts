/**
 * PHASE S5.2 - Raport X Template
 * Individual template for Raport X (Daily Report) documents
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';

export interface RaportXTemplateData {
  document: TipizatBase;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render Raport X document template
 */
export function renderRaportXTemplate(doc: PDFDocument, data: RaportXTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('RAPORT X', { align: 'center' });
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

  // Tabel tranzacții
  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Tranzacții zilnice:', { underline: true });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const descX = 50;
    const amountX = 450;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Descriere', descX, tableTop);
    doc.text('Sumă', amountX, tableTop);

    doc.moveTo(descX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    let y = doc.y;
    doc.fontSize(9).font('Helvetica');
    lines.forEach((line) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }

      doc.text(line.productName || 'N/A', descX, y);
      doc.text(line.totalWithVat.toFixed(2), amountX, y);

      y += 15;
    });

    doc.y = y;
    doc.moveDown();
  }

  // Totaluri
  doc.moveDown();
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`TOTAL ZILNIC: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.moveDown();

  // Semnături
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica');
  doc.text('Pregătit de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
}

