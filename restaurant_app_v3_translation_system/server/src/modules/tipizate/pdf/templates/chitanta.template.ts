/**
 * PHASE S5.2 - Chitanță Template
 * PHASE S6.1 - Updated with numberToWords for legal compliance
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';
import { ChitantaDocument } from '../../models/chitanta.types';
import { numberToWords } from '../../utils/numberToWords';

export interface ChitantaTemplateData {
  document: TipizatBase | ChitantaDocument;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render Chitanță document template
 */
export function renderChitantaTemplate(doc: PDFDocument, data: ChitantaTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;
  const chitantaDoc = document as ChitantaDocument;

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('CHITANȚĂ', { align: 'center' });
  doc.moveDown(0.5);

  // PHASE S6.3 - Informații document (extinse)
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  if (chitantaDoc.chitantaTime) {
    doc.text(`Ora: ${chitantaDoc.chitantaTime}`);
  }
  
  // PHASE S6.3 - Status plată
  if (chitantaDoc.paymentStatus) {
    const statusMap: Record<string, string> = {
      'partial': 'Plată Parțială',
      'complete': 'Plată Completă'
    };
    doc.text(`Status: ${statusMap[chitantaDoc.paymentStatus] || chitantaDoc.paymentStatus}`);
  }
  doc.moveDown();

  // PHASE S6.3 - Header fiscal (Emitent/Beneficiar)
  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('BENEFICIAR (EMITENT):', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    if (fiscalHeader.companyAddress) doc.text(`Adresă: ${fiscalHeader.companyAddress}`);
    doc.moveDown();
  }

  // PHASE S6.3 - Client (Plătitor)
  if (chitantaDoc.clientName) {
    doc.fontSize(11).font('Helvetica-Bold').text('PLĂTITOR:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nume: ${chitantaDoc.clientName}`);
    if (chitantaDoc.clientCUI) doc.text(`CUI: ${chitantaDoc.clientCUI}`);
    if (chitantaDoc.clientPhone) doc.text(`Telefon: ${chitantaDoc.clientPhone}`);
    doc.moveDown();
  }

  // PHASE S6.3 - Factură (dacă există)
  if (chitantaDoc.invoiceNumber) {
    doc.moveDown();
    doc.fontSize(10).font('Helvetica-Bold').text('─────────────────────────────────────────────────', { align: 'center' });
    doc.text(`PLATĂ PENTRU FACTURA: ${chitantaDoc.invoiceNumber}`, { align: 'center' });
    doc.text('─────────────────────────────────────────────────', { align: 'center' });
    doc.moveDown();
  }

  // PHASE S6.3 - Detalii plată
  doc.moveDown();
  doc.fontSize(11).font('Helvetica-Bold').text('DETALII PLATĂ:', { underline: true });
  doc.fontSize(10).font('Helvetica');
  
  const paymentMethodMap: Record<string, string> = {
    'cash': 'NUMERAR',
    'card': 'CARD',
    'transfer': 'TRANSFER BANCAR',
    'check': 'CEC'
  };
  doc.text(`Metodă Plată: ${paymentMethodMap[chitantaDoc.paymentMethod] || chitantaDoc.paymentMethod}`);
  
  const totalAmount = totals.total || 0;
  if (chitantaDoc.amountReceived !== null && chitantaDoc.amountReceived !== undefined) {
    doc.text(`Suma Primită: ${chitantaDoc.amountReceived.toFixed(2)} RON`);
  }
  if (chitantaDoc.amountCredited !== null && chitantaDoc.amountCredited !== undefined) {
    doc.text(`Suma Creditată: ${chitantaDoc.amountCredited.toFixed(2)} RON`);
  }
  if (chitantaDoc.changeAmount !== null && chitantaDoc.changeAmount !== undefined && chitantaDoc.changeAmount > 0) {
    doc.text(`Rest: ${chitantaDoc.changeAmount.toFixed(2)} RON`);
  }
  
  // PHASE S6.3 - Referință plată (dacă transfer)
  if (chitantaDoc.paymentMethod === 'transfer') {
    doc.moveDown();
    if (chitantaDoc.paymentReference) {
      doc.text(`Referință Platitor: ${chitantaDoc.paymentReference}`);
    }
    if (chitantaDoc.transferDate) {
      doc.text(`Dată Transfer: ${new Date(chitantaDoc.transferDate).toLocaleDateString('ro-RO')}`);
    }
    if (chitantaDoc.transferTime) {
      doc.text(`Oră Transfer: ${chitantaDoc.transferTime}`);
    }
    if (chitantaDoc.bankAccountNumber) {
      doc.text(`IBAN Destinație: ${chitantaDoc.bankAccountNumber}`);
    }
    if (chitantaDoc.bankName) {
      doc.text(`Bancă: ${chitantaDoc.bankName}`);
    }
  }
  
  doc.moveDown();
  doc.fontSize(10).font('Helvetica-Bold').text('═══════════════════════════════════════════════════', { align: 'center' });
  
  // Scris cu litere (OBLIGATORIU LEGAL)
  doc.fontSize(10).font('Helvetica');
  const documentData = typeof document.documentData === 'string' 
    ? JSON.parse(document.documentData) 
    : document.documentData || {};
  const amountInWords = documentData.amountInWords || numberToWords(totalAmount);
  doc.text(`Cuvinte: ${amountInWords}`, { align: 'center' });
  doc.moveDown();

  // Semnături
  doc.moveDown(3);
  doc.fontSize(9).font('Helvetica');
  doc.text('Primit de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
  doc.text('Emis de:', 350, doc.y - 20);
  doc.text('___________________', 350, doc.y);
}

