/**
 * PHASE E10.1 - Receipt Formatter
 * 
 * Maps order data to ANAF-compliant fiscal XML.
 */

/**
 * Build fiscal XML from order and payment
 */
function buildFiscalXML(order, payment) {
  const timestamp = new Date().toISOString();
  const fiscalNumber = generateFiscalNumber();
  
  return `
<FiscalReceipt>
  <Header>
    <Operator>POS</Operator>
    <Timestamp>${timestamp}</Timestamp>
    <FiscalNumber>${fiscalNumber}</FiscalNumber>
  </Header>
  <Items>
    ${order.items.map(item => `
    <Item 
      name="${escapeXML(item.product_name)}" 
      qty="${item.quantity}" 
      price="${item.price}" 
      vat="${item.vat_rate || 19}" 
      total="${item.price * item.quantity}" />
    `).join('')}
  </Items>
  <Payments>
    <Payment type="${payment.type}" amount="${payment.amount}" />
  </Payments>
  <Totals>
    <Subtotal>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</Subtotal>
    <VATAmount>${order.items.reduce((sum, item) => {
      const vatRate = item.vat_rate || 19;
      return sum + (item.price * item.quantity * vatRate / 100);
    }, 0)}</VATAmount>
    <Total>${order.total || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</Total>
  </Totals>
</FiscalReceipt>`;
}

/**
 * Generate fiscal number
 */
function generateFiscalNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `FISC-${timestamp}-${random}`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  buildFiscalXML,
  generateFiscalNumber,
  escapeXML
};

