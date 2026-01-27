/**
 * PHASE S5.2 - Bon Consum Template
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';
import { BonConsumDocument } from '../../models/bon-consum.types';

export interface BonConsumTemplateData {
  document: TipizatBase | BonConsumDocument;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render Bon Consum document template
 */
export function renderBonConsumTemplate(doc: PDFDocument, data: BonConsumTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;
  const bonConsumDoc = document as BonConsumDocument;

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('BON DE CONSUM', { align: 'center' });
  doc.moveDown(0.5);

  // Informații document
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  doc.text(`Locație: ${document.locationName || 'N/A'}`);
  doc.moveDown();

  // PHASE S6.3 - Header fiscal
  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text(`${fiscalHeader.companyName}`, { align: 'center' });
    doc.fontSize(10).font('Helvetica');
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`, { align: 'center' });
    doc.moveDown();
  }

  // PHASE S6.3 - Secțiune scoatere din stoc
  doc.moveDown();
  doc.fontSize(11).font('Helvetica-Bold').text('═══════════════════════════════════════════════════', { align: 'center' });
  doc.text('SCOATERE DIN STOC PENTRU UZ INTERN', { align: 'center' });
  doc.text('═══════════════════════════════════════════════════', { align: 'center' });
  doc.moveDown();

  // PHASE S6.3 - Gestiuni
  if (bonConsumDoc.fromWarehouseName || bonConsumDoc.toWarehouseName) {
    doc.fontSize(10).font('Helvetica');
    if (bonConsumDoc.fromWarehouseName) {
      doc.text(`Din Gestiune: ${bonConsumDoc.fromWarehouseName}`);
    }
    if (bonConsumDoc.toWarehouseName) {
      doc.text(`Spre Gestiune: ${bonConsumDoc.toWarehouseName}`);
    }
    doc.moveDown();
  }

  // PHASE S6.3 - Motiv consum
  if (bonConsumDoc.consumptionReason) {
    const reasonMap: Record<string, string> = {
      'kitchen_use': 'UZ BUCĂTĂRIE',
      'spoilage': 'STRICARE',
      'sample': 'MOSTRĂ',
      'staff_meal': 'MASA ANGAJAT',
      'promotion': 'PROMOȚIONAL',
      'waste': 'DEȘEU',
      'other': bonConsumDoc.reason || 'ALTELE'
    };
    doc.text(`Motiv Consum: ${reasonMap[bonConsumDoc.consumptionReason] || bonConsumDoc.consumptionReason}`);
    doc.moveDown();
  }

  // PHASE S6.3 - Tabel linii (cu cod produs)
  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('═══════════════════════════════════════════════════', { align: 'center' });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    let itemX = 50;
    let codeX = 100;
    let qtyX = 250;
    let unitPriceX = 320;
    let totalX = 480;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Cod', itemX, tableTop);
    itemX += 50;
    doc.text('Produs', itemX, tableTop);
    doc.text('UM', codeX, tableTop);
    doc.text('Cant.', qtyX, tableTop);
    doc.text('Preț', unitPriceX, tableTop);
    doc.text('Total', totalX, tableTop);

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    let y = doc.y;
    doc.fontSize(9).font('Helvetica');
    lines.forEach((line, index) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }

      itemX = 50;
      doc.text(line.productCode || String(index + 1), itemX, y);
      itemX += 50;
      doc.text(line.productName || 'N/A', itemX, y, { width: 150 });
      doc.text(line.unit || '-', codeX, y);
      doc.text(line.quantity.toFixed(2), qtyX, y);
      doc.text(line.unitPrice.toFixed(2), unitPriceX, y);
      doc.text(line.totalWithVat.toFixed(2), totalX, y);

      y += 15;
    });

    doc.y = y;
    doc.moveDown();
  }

  // Totaluri
  doc.moveDown();
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`TOTAL: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'right' });
  doc.moveDown();

  // PHASE S6.3 - Semnături (extinse)
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica');
  doc.text('───────────────────────────────────────────────', { align: 'center' });
  if (bonConsumDoc.receivedByName) {
    doc.text(`Eliberat: ${document.createdByName || 'N/A'} (${document.createdByName || 'Operator'})`);
    doc.text(`Recepționat: ${bonConsumDoc.receivedByName} (${bonConsumDoc.departmentName || 'Bucătar Șef'})`);
    if (bonConsumDoc.receivedAt) {
      doc.text(`Dată Recepție: ${new Date(bonConsumDoc.receivedAt).toLocaleString('ro-RO')}`);
    }
  } else {
    doc.text('Eliberat:', 50, doc.y);
    doc.text('___________________', 50, doc.y + 20);
  }
  doc.moveDown();
  doc.text('Semnat: ________________   ________________', { align: 'center' });
  doc.text('        Depozitar             Bucătar', { align: 'center' });
}

