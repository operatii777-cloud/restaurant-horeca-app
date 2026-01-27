/**
 * PHASE S5.2 - Factură Template
 * PHASE S6.3 - Enhanced with complete standard RO fields
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';
import { FacturaDocument } from '../../models/factura.types';

export interface FacturaTemplateData {
  document: TipizatBase | FacturaDocument;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render Factură document template
 */
export function renderFacturaTemplate(doc: PDFDocument, data: FacturaTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;
  const facturaDoc = document as FacturaDocument;

  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('FACTURĂ FISCALĂ', { align: 'center' });
  doc.moveDown(0.5);

  // PHASE S6.3 - Informații document (extinse)
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.fontSize(10).font('Helvetica');
  doc.text(`Data Emiterii: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  if (facturaDoc.paymentDueDate) {
    doc.text(`Data Scadenței: ${new Date(facturaDoc.paymentDueDate).toLocaleDateString('ro-RO')}`);
  }
  
  // PHASE S6.3 - Tip Factură & Tip Vânzare
  if (facturaDoc.facturaType) {
    const typeMap: Record<string, string> = {
      'normal': 'Normală',
      'simplified': 'Simplificată',
      'proforma': 'Proforma'
    };
    doc.text(`Tip Factură: ${typeMap[facturaDoc.facturaType] || facturaDoc.facturaType}`);
  }
  if (facturaDoc.saleType) {
    const saleMap: Record<string, string> = {
      'b2b': 'B2B',
      'b2c': 'B2C',
      'b2b2c': 'B2B2C'
    };
    doc.text(`Tip Vânzare: ${saleMap[facturaDoc.saleType] || facturaDoc.saleType}`);
  }
  
  // PHASE S6.3 - Status
  const statusMap: Record<string, string> = {
    'DRAFT': 'Draft',
    'EMITTED': 'Emisă',
    'PARTIALLY_PAID': 'Plată Parțială',
    'PAID': 'Plătită',
    'CANCELLED': 'Anulată',
    'SIGNED': 'Semnată',
    'LOCKED': 'Blocată'
  };
  doc.text(`Status: ${statusMap[document.status] || document.status}`);
  doc.moveDown();

  // PHASE S6.3 - Header fiscal - Furnizor (extins complet)
  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('FURNIZOR (EMITENT):', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Denumire: ${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    if (fiscalHeader.regCom) doc.text(`Reg. Com.: ${fiscalHeader.regCom}`);
    
    // PHASE S6.3 - Adresă completă (cu separare)
    let addressParts = [];
    if (fiscalHeader.companyAddress) addressParts.push(fiscalHeader.companyAddress);
    if (fiscalHeader.companyCity) addressParts.push(fiscalHeader.companyCity);
    if (fiscalHeader.companyPostalCode) addressParts.push(fiscalHeader.companyPostalCode);
    if (fiscalHeader.companyCountry) addressParts.push(fiscalHeader.companyCountry);
    if (addressParts.length > 0) {
      doc.text(`Adresă: ${addressParts.join(', ')}`);
    }
    
    if (fiscalHeader.companyPhone) doc.text(`Telefon: ${fiscalHeader.companyPhone}`);
    if (fiscalHeader.companyEmail) doc.text(`Email: ${fiscalHeader.companyEmail}`);
    if (fiscalHeader.representative) doc.text(`Reprezentant: ${fiscalHeader.representative}`);
    if (fiscalHeader.bankAccount) doc.text(`IBAN: ${fiscalHeader.bankAccount}`);
    doc.moveDown();
  }

  // PHASE S6.3 - Client (extins complet)
  if (facturaDoc.clientName) {
    doc.fontSize(11).font('Helvetica-Bold').text('CLIENT (CUMPĂRĂTOR):', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Denumire: ${facturaDoc.clientName}`);
    if (facturaDoc.clientCUI) doc.text(`CUI: ${facturaDoc.clientCUI}`);
    
    // PHASE S6.3 - Adresă completă client
    let clientAddressParts = [];
    if (facturaDoc.clientAddress) clientAddressParts.push(facturaDoc.clientAddress);
    if (facturaDoc.clientCity) clientAddressParts.push(facturaDoc.clientCity);
    if (facturaDoc.clientPostalCode) clientAddressParts.push(facturaDoc.clientPostalCode);
    if (facturaDoc.clientCountry) clientAddressParts.push(facturaDoc.clientCountry);
    if (clientAddressParts.length > 0) {
      doc.text(`Adresă: ${clientAddressParts.join(', ')}`);
    }
    
    if (facturaDoc.clientPhone) doc.text(`Telefon: ${facturaDoc.clientPhone}`);
    if (facturaDoc.clientEmail) doc.text(`Email: ${facturaDoc.clientEmail}`);
    if (facturaDoc.clientRepresentative) doc.text(`Reprezentant: ${facturaDoc.clientRepresentative}`);
    if (facturaDoc.clientType) {
      const typeMap: Record<string, string> = {
        'juridic': 'Persoană Juridică',
        'fizic': 'Persoană Fizică'
      };
      doc.text(`Tip: ${typeMap[facturaDoc.clientType] || facturaDoc.clientType}`);
    }
    if (facturaDoc.clientStatus) {
      const statusMap: Record<string, string> = {
        'regular': 'Client Regular',
        'vip': 'Client VIP',
        'inactive': 'Inactiv'
      };
      doc.text(`Status: ${statusMap[facturaDoc.clientStatus] || facturaDoc.clientStatus}`);
    }
    doc.moveDown();
  }

  // PHASE S6.3 - Tabel linii (cu discount și cod produs)
  if (lines && lines.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('Produse/Servicii:', { underline: true });
    doc.moveDown(0.3);

    // PHASE S6.3 - Check if we have discount
    const hasDiscount = lines.some(line => 
      line.discountPercentage !== null && line.discountPercentage !== undefined && line.discountPercentage > 0
    );

    const tableTop = doc.y;
    let itemX = 50;
    let codeX = 120;
    let qtyX = 200;
    let unitPriceX = 260;
    let discountX = 320;
    let vatX = 360;
    let totalX = 480;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Nr.', itemX, tableTop);
    itemX += 30;
    doc.text('Produs', itemX, tableTop);
    
    if (hasDiscount) {
      codeX = 150;
      qtyX = 220;
      unitPriceX = 280;
      discountX = 340;
      vatX = 380;
      totalX = 500;
      doc.text('Cod', codeX, tableTop);
    }
    
    doc.text('Cant.', qtyX, tableTop);
    doc.text('Preț Unit.', unitPriceX, tableTop);
    
    if (hasDiscount) {
      doc.text('Discount', discountX, tableTop);
    }
    
    doc.text('TVA%', vatX, tableTop);
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

      let x = 50;
      
      // Nr. Crt.
      doc.text(String(index + 1), x, y);
      x += 30;
      
      // Produs (cu cod dacă există)
      const productText = line.productCode 
        ? `${line.productCode} - ${line.productName || 'N/A'}`
        : (line.productName || 'N/A');
      if (line.isPromotional) {
        doc.text(`${productText} [PROMO]`, x, y, { width: hasDiscount ? 100 : 150 });
      } else {
        doc.text(productText, x, y, { width: hasDiscount ? 100 : 150 });
      }
      
      if (hasDiscount) {
        x = codeX;
        doc.text(line.productCode || '-', x, y);
        x = qtyX;
      } else {
        x = qtyX;
      }
      
      doc.text(line.quantity.toFixed(2), x, y);
      x = unitPriceX;
      doc.text(line.unitPrice.toFixed(2), x, y);
      
      if (hasDiscount) {
        x = discountX;
        if (line.discountPercentage && line.discountPercentage > 0) {
          doc.text(`${line.discountPercentage.toFixed(1)}%`, x, y);
        } else {
          doc.text('-', x, y);
        }
        x = vatX;
      } else {
        x = vatX;
      }
      
      doc.text(`${line.vatRate.toFixed(0)}%`, x, y);
      x = totalX;
      doc.text(line.totalWithVat.toFixed(2), x, y);

      y += 15;
    });

    doc.y = y;
    doc.moveDown();
  }

  // PHASE S6.3 - Totaluri (cu monedă și curs)
  doc.moveDown();
  doc.fontSize(10).font('Helvetica');
  const currency = facturaDoc.currency || 'RON';
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'RON';
  
  doc.text(`Subtotal: ${totals.subtotal?.toFixed(2) || '0.00'} ${currencySymbol}`, { align: 'right' });
  doc.text(`TVA: ${totals.vatAmount?.toFixed(2) || '0.00'} ${currencySymbol}`, { align: 'right' });
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`TOTAL: ${totals.total?.toFixed(2) || '0.00'} ${currencySymbol}`, { align: 'right' });
  
  // PHASE S6.3 - Curs de schimb (dacă nu e RON)
  if (currency !== 'RON' && facturaDoc.currencyRate) {
    doc.fontSize(9).font('Helvetica');
    doc.text(`Curs: 1 ${currency} = ${facturaDoc.currencyRate.toFixed(4)} RON`, { align: 'right' });
    doc.text(`Total în RON: ${(totals.total * facturaDoc.currencyRate).toFixed(2)} RON`, { align: 'right' });
  }
  
  // PHASE S6.3 - Status plată
  if (facturaDoc.paymentStatus) {
    doc.moveDown();
    doc.fontSize(10).font('Helvetica-Bold');
    const paymentStatusMap: Record<string, string> = {
      'unpaid': 'Neplată',
      'partial': 'Plată Parțială',
      'paid': 'Plătită'
    };
    doc.text(`Status Plată: ${paymentStatusMap[facturaDoc.paymentStatus] || facturaDoc.paymentStatus}`, { align: 'right' });
    
    if (facturaDoc.amountPaid !== null && facturaDoc.amountPaid !== undefined) {
      doc.fontSize(9).font('Helvetica');
      doc.text(`Sumă Plătită: ${facturaDoc.amountPaid.toFixed(2)} ${currencySymbol}`, { align: 'right' });
    }
    if (facturaDoc.amountRemaining !== null && facturaDoc.amountRemaining !== undefined) {
      doc.text(`Sumă Rămasă: ${facturaDoc.amountRemaining.toFixed(2)} ${currencySymbol}`, { align: 'right' });
    }
  }
  
  doc.moveDown();
  
  // PHASE S6.3 - Conturi Bancare
  if (facturaDoc.bankAccountNumber || fiscalHeader.bankAccount) {
    doc.moveDown();
    doc.fontSize(10).font('Helvetica-Bold').text('CONTURI BANCARE:', { underline: true });
    doc.fontSize(9).font('Helvetica');
    const iban = facturaDoc.bankAccountNumber || fiscalHeader.bankAccount;
    if (iban) doc.text(`IBAN: ${iban}`);
    if (facturaDoc.bankName) doc.text(`Bancă: ${facturaDoc.bankName}`);
    if (facturaDoc.bankSwift) doc.text(`SWIFT: ${facturaDoc.bankSwift}`);
    if (facturaDoc.bankBranch) doc.text(`Filială: ${facturaDoc.bankBranch}`);
    doc.moveDown();
  }
  
  // PHASE S6.3 - E-Factura Info
  if (facturaDoc.eFacturaStatus) {
    doc.moveDown();
    doc.fontSize(9).font('Helvetica');
    const eFacturaStatusMap: Record<string, string> = {
      'pending': 'În așteptare',
      'submitted': 'Trimisă la ANAF',
      'approved': 'Aprobată de ANAF',
      'rejected': 'Respinsă de ANAF'
    };
    doc.text(`E-Factură: ${eFacturaStatusMap[facturaDoc.eFacturaStatus] || facturaDoc.eFacturaStatus}`, { align: 'right' });
    if (facturaDoc.eFacturaId) {
      doc.text(`ID ANAF: ${facturaDoc.eFacturaId}`, { align: 'right' });
    }
    if (facturaDoc.eFacturaSubmittedAt) {
      doc.text(`Trimisă la: ${new Date(facturaDoc.eFacturaSubmittedAt).toLocaleString('ro-RO')}`, { align: 'right' });
    }
  }

  // Bloc legal complet (Legea 227/2015 - Codul Fiscal)
  doc.moveDown();
  doc.fontSize(8).font('Helvetica');
  doc.text('Acest document fiscal este emis în conformitate cu Legea nr. 227/2015 privind Codul fiscal și cu normele metodologice de aplicare.', { align: 'center' });
  doc.moveDown(0.3);
  doc.text('Factura se păstrează timp de 5 ani de la data emiterii, conform art. 155 alin. (1) din Codul fiscal.', { align: 'center' });
  doc.moveDown(0.3);
  doc.text('Beneficiarul are dreptul de a solicita factură fiscală conform art. 319 din Codul fiscal.', { align: 'center' });
  doc.moveDown(0.3);
  doc.text(`ID Document: ${document.id} | Versiune: ${document.version || '1.0'}`, { align: 'center' });
}

