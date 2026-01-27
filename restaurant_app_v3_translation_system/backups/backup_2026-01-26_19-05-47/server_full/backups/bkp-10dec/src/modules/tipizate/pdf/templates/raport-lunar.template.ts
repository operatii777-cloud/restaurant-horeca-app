/**
 * PHASE S5.2 - Raport Lunar Template
 * Individual template for Raport Lunar (Monthly Report) documents
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';

export interface RaportLunarTemplateData {
  document: TipizatBase;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render Raport Lunar document template
 */
export function renderRaportLunarTemplate(doc: PDFDocument, data: RaportLunarTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('RAPORT LUNAR', { align: 'center' });
  doc.moveDown(0.5);

  // Informații document
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Perioadă: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
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
    doc.fontSize(11).font('Helvetica-Bold').text('Rezumat lunar:', { underline: true });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const itemX = 50;
    const amountX = 450;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Categorie', itemX, tableTop);
    doc.text('Valoare', amountX, tableTop);

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
      doc.text(line.totalWithVat.toFixed(2), amountX, y);

      y += 15;
    });

    doc.y = y;
    doc.moveDown();
  }

  // Totaluri
  doc.moveDown();
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`TOTAL LUNAR: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.moveDown();

  // Semnături
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica');
  doc.text('Pregătit de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
  doc.text('Aprobat de:', 350, doc.y - 20);
  doc.text('___________________', 350, doc.y);
}

