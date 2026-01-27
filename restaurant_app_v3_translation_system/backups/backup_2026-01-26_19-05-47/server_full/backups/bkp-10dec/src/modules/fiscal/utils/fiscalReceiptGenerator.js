/**
 * PHASE E10.1 - Fiscal Receipt Generator
 * 
 * Generates ANAF-compliant fiscal receipt data (XML/JSON).
 */

const { getVatRate, calculateVatAmount } = require('../../../config/vat.rules');

class FiscalReceiptGenerator {
  /**
   * Generate fiscal receipt data
   */
  generate({ order, totals, paymentMethod, timestamp }) {
    const fiscalNumber = this.generateFiscalNumber();
    const receiptNumber = this.generateReceiptNumber();

    // Build receipt data structure (ANAF format)
    const receiptData = {
      fiscalNumber,
      receiptNumber,
      timestamp: timestamp.toISOString(),
      company: {
        name: this.getCompanyName(),
        cui: this.getCompanyCUI(),
        address: this.getCompanyAddress(),
        phone: this.getCompanyPhone()
      },
      order: {
        id: order.id,
        tableNumber: order.table_number,
        customerName: order.customer_name
      },
      items: order.items.map(item => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        vatRate: item.vat_rate || 19,
        vatAmount: calculateVatAmount(item.price * item.quantity, item.vat_rate || 19)
      })),
      totals: {
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        paymentMethod,
        cashAmount: totals.payments.cashAmount,
        cardAmount: totals.payments.cardAmount,
        voucherAmount: totals.payments.voucherAmount,
        change: totals.change
      }
    };

    // Generate XML (ANAF format)
    const xml = this.generateXML(receiptData);

    // Generate JSON (ANAF format)
    const json = JSON.stringify(receiptData, null, 2);

    return {
      orderId: order.id,
      fiscalNumber,
      receiptNumber,
      data: receiptData,
      xml,
      json,
      total: totals.total,
      vatAmount: totals.vatAmount
    };
  }

  /**
   * Generate fiscal number (unique per receipt)
   */
  generateFiscalNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `FISC-${timestamp}-${random}`;
  }

  /**
   * Generate receipt number (sequential)
   */
  generateReceiptNumber() {
    // In real implementation, this would be sequential from database
    const timestamp = Date.now();
    return `RCP-${timestamp}`;
  }

  /**
   * Generate XML (ANAF format)
   */
  generateXML(receiptData) {
    // Simplified XML structure - in production, use proper XML builder
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<FiscalReceipt>\n';
    xml += `  <FiscalNumber>${receiptData.fiscalNumber}</FiscalNumber>\n`;
    xml += `  <ReceiptNumber>${receiptData.receiptNumber}</ReceiptNumber>\n`;
    xml += `  <Timestamp>${receiptData.timestamp}</Timestamp>\n`;
    xml += '  <Company>\n';
    xml += `    <Name>${this.escapeXML(receiptData.company.name)}</Name>\n`;
    xml += `    <CUI>${receiptData.company.cui}</CUI>\n`;
    xml += `    <Address>${this.escapeXML(receiptData.company.address)}</Address>\n`;
    xml += '  </Company>\n';
    xml += '  <Items>\n';
    
    receiptData.items.forEach(item => {
      xml += '    <Item>\n';
      xml += `      <ProductName>${this.escapeXML(item.productName)}</ProductName>\n`;
      xml += `      <Quantity>${item.quantity}</Quantity>\n`;
      xml += `      <UnitPrice>${item.unitPrice}</UnitPrice>\n`;
      xml += `      <TotalPrice>${item.totalPrice}</TotalPrice>\n`;
      xml += `      <VATRate>${item.vatRate}</VATRate>\n`;
      xml += `      <VATAmount>${item.vatAmount}</VATAmount>\n`;
      xml += '    </Item>\n';
    });
    
    xml += '  </Items>\n';
    xml += '  <Totals>\n';
    xml += `    <Subtotal>${receiptData.totals.subtotal}</Subtotal>\n`;
    xml += `    <VATAmount>${receiptData.totals.vatAmount}</VATAmount>\n`;
    xml += `    <Total>${receiptData.totals.total}</Total>\n`;
    xml += `    <PaymentMethod>${receiptData.totals.paymentMethod}</PaymentMethod>\n`;
    xml += '  </Totals>\n';
    xml += '</FiscalReceipt>';
    
    return xml;
  }

  /**
   * Escape XML special characters
   */
  escapeXML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Get company name from config
   */
  getCompanyName() {
    // In real implementation, get from fiscal config
    return process.env.COMPANY_NAME || 'Restaurant Name';
  }

  getCompanyCUI() {
    return process.env.COMPANY_CUI || '';
  }

  getCompanyAddress() {
    return process.env.COMPANY_ADDRESS || '';
  }

  getCompanyPhone() {
    return process.env.COMPANY_PHONE || '';
  }
}

module.exports = { FiscalReceiptGenerator };

