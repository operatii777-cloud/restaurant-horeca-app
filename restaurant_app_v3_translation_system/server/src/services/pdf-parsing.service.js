const pdf = require('pdf-parse');
const fs = require('fs');

/**
 * Service to parse invoice PDFs and extract NIR data
 */
class PdfParsingService {
    /**
     * Parse an invoice PDF buffer
     * @param {Buffer} dataBuffer 
     * @returns {Promise<Object>} Extracted NIR-ready data
     */
    async parseInvoicePdf(dataBuffer) {
        try {
            const data = await pdf(dataBuffer);
            const text = data.text;

            return this.extractNirDataFromText(text);
        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw new Error('Could not parse PDF file: ' + error.message);
        }
    }

    /**
     * Extract NIR data using regex and heuristics
     * @param {string} text 
     */
    extractNirDataFromText(text) {
        const result = {
            supplierName: '',
            cui: '',
            invoiceNumber: '',
            date: new Date().toISOString().split('T')[0],
            items: [],
            totalBase: 0,
            totalVat: 0,
            totalIncVat: 0
        };

        // 1. Try to find CUI (RO followed by digits)
        const cuiMatch = text.match(/CUI:?[\s]*([A-Z0-9]+)/i) || text.match(/CIF:?[\s]*([A-Z0-9]+)/i);
        if (cuiMatch) result.cui = cuiMatch[1];

        // 2. Try to find Supplier Name (heuristic: often at the beginning or near CUI)
        // This is hard without a template, but let's try to find lines with "FURNIZOR"
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const supplierIndex = lines.findIndex(l => l.toUpperCase().includes('FURNIZOR'));
        if (supplierIndex !== -1 && lines[supplierIndex + 1]) {
            result.supplierName = lines[supplierIndex + 1];
        }

        // 3. Invoice Number / Date
        const invMatch = text.match(/FACTURA[\s]*NR\.?[\s]*([A-Z0-9\-\/]+)/i);
        if (invMatch) result.invoiceNumber = invMatch[1];

        const dateMatch = text.match(/DATA:?[\s]*([\d]{2}\.[\d]{2}\.[\d]{4})/);
        if (dateMatch) {
            const parts = dateMatch[1].split('.');
            result.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        // 4. Items (Very heuristic table parsing)
        // We look for lines that have multiple numeric values at the end (Qty, Unit Price, Total)
        lines.forEach(line => {
            // Example: "Rosii Kg 10.00 5.50 9% 55.00 4.95"
            // Regex for sequence of numbers at end
            const parts = line.split(/\s+/);
            if (parts.length >= 4) {
                const lastThree = parts.slice(-3);
                const values = lastThree.map(p => parseFloat(p.replace(',', '.')));

                if (!values.some(isNaN) && values[0] > 0) {
                    // Looks like a table row
                    const namePart = parts.slice(0, -3).join(' ');
                    // Basic clean up: if name starts with a number (item index), remove it
                    const cleanName = namePart.replace(/^\d+[\.\s]*/, '');

                    if (cleanName.length > 3 && !['TOTAL', 'SUBTOTAL', 'TVA'].includes(cleanName.toUpperCase())) {
                        result.items.push({
                            name: cleanName,
                            qtyReceived: values[0],
                            priceExVat: values[1],
                            vatRate: 11, // Default or try to extract
                            valueExVat: values[2]
                        });
                    }
                }
            }
        });

        // 5. Totals
        const totalMatch = text.match(/TOTAL[\s\:]+([0-9.,]+)/i);
        if (totalMatch) result.totalIncVat = parseFloat(totalMatch[1].replace(',', '.'));

        return result;
    }
}

module.exports = new PdfParsingService();
