/**
 * PHASE S8.9 - Registru Jurnal Template
 * ANAF Compliance - Legal format for Sales/Purchases Journal
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, FiscalHeader } from '../../models/tipizate.types';
import { RegistruJurnalDocument, JournalEntry, JournalTotals } from '../../models/registru-jurnal.types';

export interface RegistruJurnalTemplateData {
  document: TipizatBase | RegistruJurnalDocument;
  fiscalHeader: FiscalHeader;
  entries: JournalEntry[];
  totals: JournalTotals;
}

/**
 * Render Registru Jurnal document template
 */
export function renderRegistruJurnalTemplate(doc: PDFDocument, data: RegistruJurnalTemplateData): void {
  const { document, fiscalHeader, entries, totals } = data;
  const journalDoc = document as RegistruJurnalDocument;

  // Header
  const journalTypeName = journalDoc.journalType === 'VANZARI' ? 'VÂNZĂRI' : 'CUMPĂRĂRI';
  doc.fontSize(16).font('Helvetica-Bold').text(`REGISTRU JURNAL ${journalTypeName}`, { align: 'center' });
  doc.moveDown(0.5);

  // PHASE S8.9 - Document Info
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Perioadă: ${new Date(journalDoc.startDate).toLocaleDateString('ro-RO')} - ${new Date(journalDoc.endDate).toLocaleDateString('ro-RO')}`);
  
  if (journalDoc.fiscalMonth && journalDoc.fiscalYear) {
    const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
    doc.text(`Perioadă Fiscală: ${monthNames[journalDoc.fiscalMonth - 1]} ${journalDoc.fiscalYear}`);
  }
  
  doc.text(`Locație: ${document.locationName || 'N/A'}`);
  doc.text(`Generat la: ${journalDoc.generatedAt ? new Date(journalDoc.generatedAt).toLocaleString('ro-RO') : new Date().toLocaleString('ro-RO')}`);
  if (journalDoc.generatedByName) {
    doc.text(`Generat de: ${journalDoc.generatedByName}`);
  }
  doc.moveDown();

  // Header fiscal companie
  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('DATE FISCALE:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Companie: ${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    if (fiscalHeader.regCom) doc.text(`Reg. Com.: ${fiscalHeader.regCom}`);
    if (fiscalHeader.companyAddress) doc.text(`Adresă: ${fiscalHeader.companyAddress}`);
    doc.moveDown();
  }

  // PHASE S8.9 - Entries Table
  if (entries && entries.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('ÎNREGISTRĂRI:', { underline: true });
    doc.moveDown(0.3);

    // Table header
    doc.fontSize(8).font('Helvetica-Bold');
    let y = doc.y;
    doc.text('Nr.', 40, y, { width: 30 });
    doc.text('Tip', 70, y, { width: 40 });
    doc.text('Serie/Nr.', 110, y, { width: 70 });
    doc.text('Data', 180, y, { width: 60 });
    doc.text('Partener', 240, y, { width: 100 });
    doc.text('CUI', 340, y, { width: 60 });
    doc.text('Bază', 400, y, { width: 50 });
    doc.text('TVA', 450, y, { width: 50 });
    doc.text('Total', 500, y, { width: 60 });
    
    doc.moveDown(0.8);
    doc.strokeColor('#000000').lineWidth(0.5).moveTo(40, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.fontSize(7).font('Helvetica');
    entries.forEach((entry, index) => {
      if (doc.y > 700) { // Page break
        doc.addPage();
        y = 50;
        doc.y = y;
      }

      y = doc.y;
      
      // Line number
      doc.text(entry.lineNumber.toString(), 40, y, { width: 30 });
      
      // Document type
      const typeMap: Record<string, string> = {
        'FACTURA': 'FACT',
        'NIR': 'NIR',
        'BON_FISCAL': 'BON',
        'CHITANTA': 'CHIT',
        'AVIZ': 'AVIZ',
        'NOTE_CREDIT': 'NC',
        'NOTE_DEBIT': 'ND'
      };
      doc.text(typeMap[entry.documentType] || entry.documentType, 70, y, { width: 40 });
      
      // Series/Number
      const docNum = `${entry.documentSeries}${entry.documentNumber}`;
      doc.text(docNum, 110, y, { width: 70 });
      
      // Date
      doc.text(new Date(entry.documentDate).toLocaleDateString('ro-RO'), 180, y, { width: 60 });
      
      // Partner
      doc.text(entry.partnerName, 240, y, { width: 100, ellipsis: true });
      
      // CUI
      doc.text(entry.partnerCUI || '-', 340, y, { width: 60 });
      
      // Base amount
      doc.text(entry.baseAmount.toFixed(2), 400, y, { width: 50, align: 'right' });
      
      // VAT amount
      doc.text(entry.vatAmount.toFixed(2), 450, y, { width: 50, align: 'right' });
      
      // Total amount
      doc.text(entry.totalAmount.toFixed(2), 500, y, { width: 60, align: 'right' });
      
      doc.moveDown(0.6);
    });

    doc.moveDown(0.3);
    doc.strokeColor('#000000').lineWidth(0.5).moveTo(40, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.5);
  }

  // PHASE S8.9 - Totals Section
  doc.fontSize(11).font('Helvetica-Bold').text('TOTALURI:', { underline: true });
  doc.moveDown(0.3);
  
  // VAT Breakdown
  if (totals.vatBreakdown && totals.vatBreakdown.length > 0) {
    doc.fontSize(10).font('Helvetica-Bold').text('Detaliere pe Cote TVA:');
    doc.fontSize(9).font('Helvetica');
    
    totals.vatBreakdown.forEach(vatDetail => {
      doc.text(`TVA ${vatDetail.vatRate}%: Bază ${vatDetail.baseAmount.toFixed(2)} RON + TVA ${vatDetail.vatAmount.toFixed(2)} RON = Total ${vatDetail.totalAmount.toFixed(2)} RON (${vatDetail.numberOfEntries} înregistrări)`);
    });
    doc.moveDown(0.5);
  }

  // Grand Totals
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text(`TOTAL BAZĂ: ${totals.totalBaseAmount.toFixed(2)} RON`);
  doc.text(`TOTAL TVA: ${totals.totalVatAmount.toFixed(2)} RON`);
  doc.text(`TOTAL GENERAL: ${totals.totalAmount.toFixed(2)} RON`);
  doc.text(`Nr. Total Înregistrări: ${totals.totalEntries}`);
  doc.moveDown(0.5);

  // Payment breakdown (for sales journal)
  if (totals.paymentBreakdown && totals.paymentBreakdown.length > 0) {
    doc.fontSize(10).font('Helvetica-Bold').text('Detaliere pe Metode de Plată:');
    doc.fontSize(9).font('Helvetica');
    
    totals.paymentBreakdown.forEach(payment => {
      const methodMap: Record<string, string> = {
        'cash': 'Numerar',
        'card': 'Card',
        'transfer': 'Transfer Bancar',
        'check': 'Cec'
      };
      const methodName = methodMap[payment.paymentMethod] || payment.paymentMethod;
      doc.text(`${methodName}: ${payment.amount.toFixed(2)} RON (${payment.numberOfTransactions} tranzacții)`);
    });
    doc.moveDown(0.5);
  }

  // PHASE S8.9 - Approval & Signatures
  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica-Bold').text('AUTORIZARE ȘI SEMNĂTURI:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(9).font('Helvetica');
  
  const startY = doc.y;
  
  // Generated by (left column)
  doc.text('ÎNTOCMIT DE:', 50, startY);
  if (journalDoc.generatedByName) {
    doc.text(`Nume: ${journalDoc.generatedByName}`, 50, startY + 15);
  } else {
    doc.text('Nume: ___________________', 50, startY + 15);
  }
  if (journalDoc.generatedAt) {
    doc.text(`Data: ${new Date(journalDoc.generatedAt).toLocaleDateString('ro-RO')}`, 50, startY + 30);
  } else {
    doc.text('Data: _________', 50, startY + 30);
  }
  doc.text('Semnătură: ___________________', 50, startY + 45);
  
  // Approved by (right column)
  doc.text('APROBAT DE:', 350, startY);
  if (journalDoc.approvedByName) {
    doc.text(`Nume: ${journalDoc.approvedByName}`, 350, startY + 15);
  } else {
    doc.text('Nume: ___________________', 350, startY + 15);
  }
  if (journalDoc.approvedAt) {
    doc.text(`Data: ${new Date(journalDoc.approvedAt).toLocaleDateString('ro-RO')}`, 350, startY + 30);
  } else {
    doc.text('Data: _________', 350, startY + 30);
  }
  doc.text('Semnătură: ___________________', 350, startY + 45);
  
  // Legal compliance note
  doc.moveDown(4);
  doc.fontSize(8).font('Helvetica').fillColor('#666666');
  doc.text('Registru Jurnal întocmit conform OUG 28/1999 și Ordin ANAF 2861/2009', { align: 'center' });
  doc.text('Document obligatoriu pentru contabilitate și raportare ANAF', { align: 'center' });
}
