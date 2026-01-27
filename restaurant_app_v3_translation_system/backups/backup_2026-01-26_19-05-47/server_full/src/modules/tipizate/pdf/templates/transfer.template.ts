/**
 * PHASE S5.2 - Transfer Template
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';
import { TransferDocument } from '../../models/transfer.types';

export interface TransferTemplateData {
  document: TipizatBase | TransferDocument;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render Transfer document template
 */
export function renderTransferTemplate(doc: PDFDocument, data: TransferTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;
  const transferDoc = document as TransferDocument;

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('TRANSFER STOC', { align: 'center' });
  doc.moveDown(0.5);

  // PHASE S6.3 - Informații document (extinse)
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data Transfer: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  
  // PHASE S6.3 - Status
  const statusMap: Record<string, string> = {
    'DRAFT': 'Draft',
    'VALIDATED': 'Validat',
    'SIGNED': 'Semnat',
    'LOCKED': 'Blocat',
    'RECEIVED': 'PRIMIT',
    'VARIANCE_CHECK': 'Verificare Varianțe',
    'CANCELLED': 'Anulat'
  };
  doc.text(`Status: ${statusMap[document.status] || document.status}`);
  doc.moveDown();

  // PHASE S6.3 - Locații/Gestiuni
  doc.fontSize(11).font('Helvetica-Bold').text('═══════════════════════════════════════════════════', { align: 'center' });
  doc.fontSize(10).font('Helvetica');
  doc.text('DIN:', { continued: true, align: 'left' });
  doc.text('CĂTRE:', { align: 'right' });
  doc.text(`Restaurant: ${transferDoc.fromLocationName || 'N/A'}`, { continued: true, align: 'left' });
  doc.text(`Restaurant: ${transferDoc.toLocationName || 'N/A'}`, { align: 'right' });
  doc.text(`Gestiune: ${transferDoc.fromWarehouseName || 'N/A'}`, { continued: true, align: 'left' });
  doc.text(`Gestiune: ${transferDoc.toWarehouseName || 'N/A'}`, { align: 'right' });
  doc.text('═══════════════════════════════════════════════════', { align: 'center' });
  doc.moveDown();

  // PHASE S6.3 - Transport
  if (transferDoc.transportMethod) {
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    const transportMap: Record<string, string> = {
      'internal': 'INTERN',
      'courier': 'CURIER',
      'own_vehicle': 'VEHICUL PROPRIU'
    };
    doc.text(`Metodă Transport: ${transportMap[transferDoc.transportMethod] || transferDoc.transportMethod}`);
    
    if (transferDoc.transportMethod === 'own_vehicle') {
      if (transferDoc.driverName) doc.text(`Șofer: ${transferDoc.driverName}`);
      if (transferDoc.vehicleInfo) doc.text(`Mașină: ${transferDoc.vehicleInfo}`);
    }
    
    if (transferDoc.estimatedArrival) {
      doc.text(`Dată Estimată Sosire: ${new Date(transferDoc.estimatedArrival).toLocaleString('ro-RO')}`);
    }
    if (transferDoc.trackingNumber) {
      doc.text(`Tracking/Referință: ${transferDoc.trackingNumber}`);
    }
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
  if (transferDoc.totalItems) {
    doc.fontSize(9).font('Helvetica');
    doc.text(`Total Produse: ${transferDoc.totalItems}`, { align: 'right' });
  }
  doc.moveDown();

  // PHASE S6.3 - Semnături (extinse)
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica');
  doc.text('─────────────────────────────────────────────────', { align: 'center' });
  
  if (transferDoc.shippedByName) {
    doc.text(`Expediat de: ${transferDoc.shippedByName} (${transferDoc.shippedByName})`);
    if (transferDoc.shippedAt) {
      doc.text(`Data/Ora: ${new Date(transferDoc.shippedAt).toLocaleString('ro-RO')}`);
    }
  } else {
    doc.text('Expediat de:', 50, doc.y);
    doc.text('___________________', 50, doc.y + 20);
  }
  
  doc.moveDown();
  
  // PHASE S6.3 - Status primire
  if (transferDoc.receivedByName) {
    doc.text(`Primit de: ${transferDoc.receivedByName}`);
    if (transferDoc.receivedAt) {
      doc.text(`Data Primire: ${new Date(transferDoc.receivedAt).toLocaleString('ro-RO')}`);
    }
  } else if (document.status === 'RECEIVED' || document.status === 'SIGNED') {
    doc.text('⏳ Așteptare primire...', { align: 'center' });
    doc.text('Mesaj: În curs de livrare', { align: 'center' });
  } else {
    doc.text('Primit de:', 350, doc.y - 20);
    doc.text('___________________', 350, doc.y);
  }
  
  if (transferDoc.shippingNotes) {
    doc.moveDown();
    doc.fontSize(8).font('Helvetica');
    doc.text(`Note: ${transferDoc.shippingNotes}`, { align: 'center' });
  }
}

