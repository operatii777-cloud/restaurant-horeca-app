/**
 * PHASE S5.2 - NIR Template
 * PHASE S6.2 - Enhanced with Boogit-compatible fields
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';
import { NirDocument } from '../../models/nir.types';

export interface NirTemplateData {
  document: TipizatBase | NirDocument;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render NIR document template
 */
export function renderNirTemplate(doc: PDFDocument, data: NirTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;
  const nirDoc = document as NirDocument;

  // Header fiscal
  doc.fontSize(16).font('Helvetica-Bold').text('NOTĂ DE INTRARE ÎN REZERVĂ (NIR)', { align: 'center' });
  doc.moveDown(0.5);

  // Informații document
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  if (nirDoc.receiptDate) {
    doc.text(`Data Primire: ${new Date(nirDoc.receiptDate).toLocaleDateString('ro-RO')}`);
  }
  doc.text(`Locație: ${document.locationName || 'N/A'}`);
  if (document.warehouseId) {
    doc.text(`Gestiune Primară: ${document.warehouseId}`);
  }
  if (nirDoc.secondaryWarehouseId) {
    doc.text(`Gestiune Secundară: ${nirDoc.secondaryWarehouseId}`);
  }
  if (nirDoc.transportCompany) {
    doc.text(`Transport: ${nirDoc.transportCompany}`);
  }
  if (nirDoc.responsiblePerson) {
    doc.text(`Responsabil Primire: ${nirDoc.responsiblePerson}`);
  }
  doc.moveDown();

  // Header fiscal companie
  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('Date Fiscale Companie:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Companie: ${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    if (fiscalHeader.companyAddress) doc.text(`Adresă: ${fiscalHeader.companyAddress}`);
    doc.moveDown();
  }

  // PHASE S6.2 - Furnizor (cu adresă și contact)
  if (nirDoc.supplierName) {
    doc.fontSize(11).font('Helvetica-Bold').text('FURNIZOR:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Denumire: ${nirDoc.supplierName}`);
    if (nirDoc.supplierCUI) doc.text(`CUI: ${nirDoc.supplierCUI}`);
    if (nirDoc.supplierAddress) doc.text(`Adresă: ${nirDoc.supplierAddress}`);
    if (nirDoc.supplierContact) doc.text(`Contact: ${nirDoc.supplierContact}`);
    if (nirDoc.supplierEmail) doc.text(`E-mail: ${nirDoc.supplierEmail}`);
    doc.moveDown();
  }

  // PHASE S6.2 - Factură Sursă
  if (nirDoc.invoiceNumber) {
    doc.fontSize(11).font('Helvetica-Bold').text('FACTURA FURNIZOR:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Număr Factură: ${nirDoc.invoiceSeries || ''}${nirDoc.invoiceNumber}`);
    if (nirDoc.invoiceDate) doc.text(`Data Factură: ${new Date(nirDoc.invoiceDate).toLocaleDateString('ro-RO')}`);
    if (nirDoc.invoiceTotalAmount !== null && nirDoc.invoiceTotalAmount !== undefined) {
      doc.text(`Valoare Totală: ${nirDoc.invoiceTotalAmount.toFixed(2)} RON`);
    }
    if (nirDoc.invoiceTvaAmount !== null && nirDoc.invoiceTvaAmount !== undefined) {
      doc.text(`TVA: ${nirDoc.invoiceTvaAmount.toFixed(2)} RON`);
    }
    if (nirDoc.invoiceTvaRate !== null && nirDoc.invoiceTvaRate !== undefined) {
      doc.text(`Cota TVA: ${nirDoc.invoiceTvaRate}%`);
    }
    if (nirDoc.invoiceStatus) {
      const statusMap: Record<string, string> = {
        'draft': 'Draft',
        'partial': 'Plată Parțială',
        'paid': 'Plătit',
        'cancelled': 'Anulat'
      };
      doc.text(`Status Factură: ${statusMap[nirDoc.invoiceStatus] || nirDoc.invoiceStatus}`);
    }
    doc.moveDown();
  }

  // PHASE S6.2 - Tabel linii (cu cantități separate și discount)
  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Produse:', { underline: true });
    doc.moveDown(0.3);

    // PHASE S6.2 - Check if we have quantity tracking (invoiced vs received)
    const hasQuantityTracking = lines.some(line => 
      line.quantityInvoiced !== null && line.quantityInvoiced !== undefined
    );
    const hasDiscount = lines.some(line => 
      line.discountPercentage !== null && line.discountPercentage !== undefined && line.discountPercentage > 0
    );

    // Header tabel - adaptiv bazat pe câmpuri disponibile
    const tableTop = doc.y;
    let itemX = 50;
    let qtyX = 200;
    let unitPriceX = 280;
    let discountX = 340;
    let vatX = 400;
    let totalX = 480;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Nr.', itemX, tableTop);
    itemX += 30;
    doc.text('Produs', itemX, tableTop);
    
    if (hasQuantityTracking) {
      // Tabel cu cantități separate
      qtyX = 220;
      unitPriceX = 300;
      discountX = 360;
      vatX = 420;
      totalX = 500;
      
      doc.text('Cant. Fact.', qtyX, tableTop);
      doc.text('Cant. Prim.', qtyX + 60, tableTop);
      doc.text('Diferență', qtyX + 120, tableTop);
    } else {
      doc.text('Cant.', qtyX, tableTop);
    }
    
    doc.text('Preț Unit.', unitPriceX, tableTop);
    
    if (hasDiscount) {
      doc.text('Discount', discountX, tableTop);
    }
    
    doc.text('TVA%', vatX, tableTop);
    doc.text('Total', totalX, tableTop);

    // Linie separator
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
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

      let x = 50;
      
      // Nr. Crt.
      doc.text(String(index + 1), x, y);
      x += 30;
      
      // Produs (cu cod dacă există)
      const productText = line.productCode 
        ? `${line.productCode} - ${line.productName || 'N/A'}`
        : (line.productName || 'N/A');
      doc.text(productText, x, y, { width: 150 });
      x = hasQuantityTracking ? 220 : 200;
      
      // Cantități
      if (hasQuantityTracking && line.quantityInvoiced !== null && line.quantityInvoiced !== undefined) {
        // Cantitate facturată
        doc.text(line.quantityInvoiced.toFixed(2), x, y);
        x += 60;
        
        // Cantitate primită
        const qtyReceived = line.quantityReceived !== null && line.quantityReceived !== undefined 
          ? line.quantityReceived 
          : line.quantity;
        doc.text(qtyReceived.toFixed(2), x, y);
        x += 60;
        
        // Diferență cu indicator vizual
        const diff = line.quantityDifference !== null && line.quantityDifference !== undefined
          ? line.quantityDifference
          : (qtyReceived - line.quantityInvoiced);
        
        let diffText = diff.toFixed(2);
        if (line.quantityVarianceType === 'excess') {
          diffText = `+${diffText}`;
        } else if (line.quantityVarianceType === 'deficit') {
          diffText = `-${diffText}`;
        }
        doc.text(diffText, x, y);
        x += 60;
      } else {
        // Cantitate simplă (backward compatibility)
        const qty = line.quantityReceived !== null && line.quantityReceived !== undefined 
          ? line.quantityReceived 
          : line.quantity;
        doc.text(qty.toFixed(2), x, y);
        x = 280;
      }
      
      // Preț unitar
      doc.text(line.unitPrice.toFixed(2), x, y);
      x += 60;
      
      // Discount (dacă există)
      if (hasDiscount) {
        if (line.discountPercentage && line.discountPercentage > 0) {
          doc.text(`${line.discountPercentage.toFixed(1)}%`, x, y);
        } else {
          doc.text('-', x, y);
        }
        x += 60;
      }
      
      // TVA%
      doc.text(`${line.vatRate.toFixed(0)}%`, x, y);
      x += 60;
      
      // Total
      doc.text(line.totalWithVat.toFixed(2), x, y);

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

