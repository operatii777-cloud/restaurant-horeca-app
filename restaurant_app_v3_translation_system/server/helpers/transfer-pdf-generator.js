/**
 * 📄 TRANSFER PDF GENERATOR
 * 
 * Generează PDF-uri pentru:
 * - Aviz Transfer (pentru gestiunea sursă - document de ieșire)
 * - NIR Transfer (pentru gestiunea destinație - document de intrare)
 * 
 * @version 1.0.0
 * @date 29 Octombrie 2025
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Paths pentru fonturile Times New Roman (Windows) - Suport UTF-8 complet
const FONTS = {
    regular: 'C:\\Windows\\Fonts\\times.ttf',
    bold: 'C:\\Windows\\Fonts\\timesbd.ttf',
    italic: 'C:\\Windows\\Fonts\\timesi.ttf'
};

/**
 * Sanitizează text românesc pentru PDF (elimină diacritice dacă e necesar)
 */
function sanitizeRomanianText(text) {
    if (!text) return '';
    // PDFKit suportă UTF-8, deci păstrăm diacriticele
    // Dar ne asigurăm că convertim la string
    return text.toString();
}

/**
 * Formatează dată în format RO (DD.MM.YYYY)
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Formatează valoare monetară
 */
function formatCurrency(value) {
    return parseFloat(value || 0).toFixed(2) + ' RON';
}

/**
 * Generează PDF Aviz Transfer
 * 
 * @param {Object} transfer - Datele transferului
 * @param {Array} items - Items din transfer
 * @param {Object} fromLocation - Gestiunea sursă
 * @param {Object} toLocation - Gestiunea destinație
 * @returns {Promise<Buffer>} Buffer cu PDF-ul generat
 */
async function generateAvizTransferPDF(transfer, items, fromLocation, toLocation) {
    return new Promise((resolve, reject) => {
        try {
            // Creează document PDF A4
            const doc = new PDFDocument({ 
                size: 'A4', 
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            
            // Înregistrează fonturile Times New Roman (suport diacritice)
            doc.registerFont('TimesRoman', FONTS.regular);
            doc.registerFont('TimesRomanBold', FONTS.bold);
            
            // Buffer pentru a colecta PDF-ul
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // ==================== HEADER ====================
            
            // Titlu
            doc.fontSize(20).font('TimesRomanBold');
            doc.text('AVIZ DE TRANSFER', { align: 'center' });
            doc.moveDown(0.5);
            
            // Nr. Aviz
            doc.fontSize(12).font('TimesRoman');
            doc.text(`Nr. Aviz: ${sanitizeRomanianText(transfer.transfer_number)}`, { align: 'center' });
            doc.text(`Data: ${formatDate(transfer.transfer_date)}`, { align: 'center' });
            doc.moveDown(1);
            
            // ==================== INFO GESTIUNI ====================
            
            const leftX = 50;
            const rightX = 320;
            const startY = doc.y;
            
            // Gestiune SURSĂ (Stânga)
            doc.font('TimesRomanBold').fontSize(11);
            doc.text('DE LA (GESTIUNE SURSĂ):', leftX, startY);
            doc.font('TimesRoman').fontSize(10);
            doc.text(`Nume: ${sanitizeRomanianText(fromLocation.name)}`, leftX, doc.y + 5);
            doc.text(`Tip: ${fromLocation.type === 'warehouse' ? 'Depozit' : 'Operațional'}`, leftX, doc.y + 5);
            if (fromLocation.manager_name) {
                doc.text(`Manager: ${sanitizeRomanianText(fromLocation.manager_name)}`, leftX, doc.y + 5);
            }
            
            // Gestiune DESTINAȚIE (Dreapta)
            doc.font('TimesRomanBold').fontSize(11);
            doc.text('CĂTRE (GESTIUNE DESTINAȚIE):', rightX, startY);
            doc.font('TimesRoman').fontSize(10);
            doc.text(`Nume: ${sanitizeRomanianText(toLocation.name)}`, rightX, startY + 15);
            doc.text(`Tip: ${toLocation.type === 'warehouse' ? 'Depozit' : 'Operațional'}`, rightX, doc.y + 5);
            if (toLocation.manager_name) {
                doc.text(`Manager: ${sanitizeRomanianText(toLocation.manager_name)}`, rightX, doc.y + 5);
            }
            
            doc.moveDown(2);
            
            // ==================== LINIE SEPARATOR ====================
            doc.strokeColor('#333333').lineWidth(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);
            
            // ==================== TABEL ITEMS ====================
            
            doc.font('TimesRomanBold').fontSize(10);
            
            // Header tabel
            const tableTop = doc.y;
            const colWidths = {
                nr: 30,
                name: 200,
                quantity: 60,
                unit: 50,
                price: 70,
                total: 85
            };
            
            let currentX = 50;
            doc.text('Nr.', currentX, tableTop);
            currentX += colWidths.nr;
            doc.text('Denumire Produs', currentX, tableTop);
            currentX += colWidths.name;
            doc.text('Cantitate', currentX, tableTop);
            currentX += colWidths.quantity;
            doc.text('U.M.', currentX, tableTop);
            currentX += colWidths.unit;
            doc.text('Preț unitar', currentX, tableTop);
            currentX += colWidths.price;
            doc.text('Valoare totală', currentX, tableTop);
            
            // Linie sub header
            doc.moveDown(0.5);
            doc.strokeColor('#333333').lineWidth(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            
            // Items
            doc.font('TimesRoman').fontSize(9);
            let totalValue = 0;
            
            items.forEach((item, index) => {
                const rowY = doc.y;
                
                // Verifică dacă mai încape pe pagină
                if (rowY > 700) {
                    doc.addPage();
                    doc.y = 50;
                }
                
                currentX = 50;
                
                // Nr. crt
                doc.text(String(index + 1), currentX, doc.y, { width: colWidths.nr });
                currentX += colWidths.nr;
                
                // Denumire
                const itemName = sanitizeRomanianText(item.ingredient_name || 'N/A');
                doc.text(itemName, currentX, rowY, { width: colWidths.name - 5 });
                currentX += colWidths.name;
                
                // Cantitate
                doc.text(item.quantity.toFixed(2), currentX, rowY, { width: colWidths.quantity });
                currentX += colWidths.quantity;
                
                // U.M.
                doc.text(sanitizeRomanianText(item.unit), currentX, rowY, { width: colWidths.unit });
                currentX += colWidths.unit;
                
                // Preț unitar
                doc.text(item.unit_cost.toFixed(2), currentX, rowY, { width: colWidths.price });
                currentX += colWidths.price;
                
                // Valoare totală
                const itemTotal = item.total_cost || (item.quantity * item.unit_cost);
                doc.text(itemTotal.toFixed(2) + ' RON', currentX, rowY, { width: colWidths.total });
                
                totalValue += itemTotal;
                
                doc.moveDown(0.8);
            });
            
            // ==================== TOTAL ====================
            
            doc.moveDown(0.5);
            doc.strokeColor('#333333').lineWidth(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            
            doc.font('TimesRomanBold').fontSize(11);
            doc.text(`TOTAL VALOARE: ${formatCurrency(totalValue)}`, 360, doc.y, { width: 185, align: 'right' });
            
            doc.moveDown(1);
            
            // ==================== INFO SUPLIMENTARE ====================
            
            doc.font('TimesRoman').fontSize(9);
            
            if (transfer.requested_by) {
                doc.text(`Solicitat de: ${sanitizeRomanianText(transfer.requested_by)}`, 50, doc.y);
            }
            
            if (transfer.approved_by) {
                doc.text(`Aprobat de: ${sanitizeRomanianText(transfer.approved_by)}`, 50, doc.y + 15);
            }
            
            if (transfer.notes) {
                doc.moveDown(1);
                doc.font('TimesRomanBold').fontSize(10);
                doc.text('Observații:', 50, doc.y);
                doc.font('TimesRoman').fontSize(9);
                doc.text(sanitizeRomanianText(transfer.notes), 50, doc.y + 5, { width: 495 });
            }
            
            // ==================== FOOTER - SEMNĂTURI ====================
            
            // Plasează semnăturile în partea de jos a paginii
            const signatureY = 720;
            
            doc.fontSize(9);
            doc.text('Predare:', 50, signatureY);
            doc.text('_____________________', 50, signatureY + 15);
            doc.text('(Semnătură și ștampilă)', 50, signatureY + 30, { width: 150, fontSize: 7 });
            
            doc.text('Primire:', 320, signatureY);
            doc.text('_____________________', 320, signatureY + 15);
            doc.text('(Semnătură și ștampilă)', 320, signatureY + 30, { width: 150, fontSize: 7 });
            
            // ==================== FOOTER - DATA GENERARE ====================
            
            doc.fontSize(7).font('TimesRoman');
            doc.text(
                `Document generat automat la ${new Date().toLocaleString('ro-RO')}`, 
                50, 
                780, 
                { align: 'center', width: 495 }
            );
            
            // Finalizează PDF
            doc.end();
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generează PDF NIR Transfer (Notă Intrare Recepție pentru gestiunea destinație)
 * 
 * @param {Object} transfer - Datele transferului
 * @param {Array} items - Items din transfer
 * @param {Object} fromLocation - Gestiunea sursă
 * @param {Object} toLocation - Gestiunea destinație
 * @returns {Promise<Buffer>} Buffer cu PDF-ul generat
 */
async function generateNIRTransferPDF(transfer, items, fromLocation, toLocation) {
    return new Promise((resolve, reject) => {
        try {
            // Creează document PDF A4
            const doc = new PDFDocument({ 
                size: 'A4', 
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });
            
            // Înregistrează fonturile Times New Roman (suport diacritice)
            doc.registerFont('TimesRoman', FONTS.regular);
            doc.registerFont('TimesRomanBold', FONTS.bold);
            
            // Buffer pentru a colecta PDF-ul
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // ==================== HEADER ====================
            
            // Titlu
            doc.fontSize(20).font('TimesRomanBold');
            doc.text('NOTĂ DE INTRARE-RECEPȚIE', { align: 'center' });
            doc.fontSize(14).font('TimesRoman');
            doc.text('(Transfer Intern între Gestiuni)', { align: 'center' });
            doc.moveDown(0.5);
            
            // Nr. NIR
            doc.fontSize(12).font('TimesRoman');
            doc.text(`Nr. NIR: ${sanitizeRomanianText(transfer.transfer_number)}`, { align: 'center' });
            doc.text(`Data intrare: ${formatDate(transfer.completed_at || transfer.transfer_date)}`, { align: 'center' });
            doc.moveDown(1);
            
            // ==================== INFO GESTIUNI ====================
            
            const leftX = 50;
            const rightX = 320;
            const startY = doc.y;
            
            // Gestiune SURSĂ (Stânga)
            doc.font('TimesRomanBold').fontSize(11);
            doc.text('PROVENIT DIN:', leftX, startY);
            doc.font('TimesRoman').fontSize(10);
            doc.text(`Nume: ${sanitizeRomanianText(fromLocation.name)}`, leftX, doc.y + 5);
            doc.text(`Tip: ${fromLocation.type === 'warehouse' ? 'Depozit' : 'Operațional'}`, leftX, doc.y + 5);
            if (fromLocation.manager_name) {
                doc.text(`Manager: ${sanitizeRomanianText(fromLocation.manager_name)}`, leftX, doc.y + 5);
            }
            
            // Gestiune DESTINAȚIE (Dreapta)
            doc.font('TimesRomanBold').fontSize(11);
            doc.text('INTRAT ÎN GESTIUNEA:', rightX, startY);
            doc.font('TimesRoman').fontSize(10);
            doc.text(`Nume: ${sanitizeRomanianText(toLocation.name)}`, rightX, startY + 15);
            doc.text(`Tip: ${toLocation.type === 'warehouse' ? 'Depozit' : 'Operațional'}`, rightX, doc.y + 5);
            if (toLocation.manager_name) {
                doc.text(`Manager: ${sanitizeRomanianText(toLocation.manager_name)}`, rightX, doc.y + 5);
            }
            
            doc.moveDown(2);
            
            // ==================== LINIE SEPARATOR ====================
            doc.strokeColor('#333333').lineWidth(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);
            
            // ==================== TABEL ITEMS ====================
            
            doc.font('TimesRomanBold').fontSize(10);
            
            // Header tabel
            const tableTop = doc.y;
            const colWidths = {
                nr: 30,
                name: 180,
                quantity: 60,
                unit: 50,
                price: 70,
                total: 105
            };
            
            let currentX = 50;
            doc.text('Nr.', currentX, tableTop);
            currentX += colWidths.nr;
            doc.text('Denumire Produs', currentX, tableTop);
            currentX += colWidths.name;
            doc.text('Cantitate', currentX, tableTop);
            currentX += colWidths.quantity;
            doc.text('U.M.', currentX, tableTop);
            currentX += colWidths.unit;
            doc.text('Preț unitar', currentX, tableTop);
            currentX += colWidths.price;
            doc.text('Valoare totală', currentX, tableTop);
            
            // Linie sub header
            doc.moveDown(0.5);
            doc.strokeColor('#333333').lineWidth(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            
            // Items
            doc.font('TimesRoman').fontSize(9);
            let totalValue = 0;
            
            items.forEach((item, index) => {
                const rowY = doc.y;
                
                // Verifică dacă mai încape pe pagină
                if (rowY > 700) {
                    doc.addPage();
                    doc.y = 50;
                }
                
                currentX = 50;
                
                // Nr. crt
                doc.text(String(index + 1), currentX, doc.y, { width: colWidths.nr });
                currentX += colWidths.nr;
                
                // Denumire
                const itemName = sanitizeRomanianText(item.ingredient_name || 'N/A');
                doc.text(itemName, currentX, rowY, { width: colWidths.name - 5 });
                currentX += colWidths.name;
                
                // Cantitate
                doc.text(item.quantity.toFixed(2), currentX, rowY, { width: colWidths.quantity });
                currentX += colWidths.quantity;
                
                // U.M.
                doc.text(sanitizeRomanianText(item.unit), currentX, rowY, { width: colWidths.unit });
                currentX += colWidths.unit;
                
                // Preț unitar
                doc.text(item.unit_cost.toFixed(2), currentX, rowY, { width: colWidths.price });
                currentX += colWidths.price;
                
                // Valoare totală
                const itemTotal = item.total_cost || (item.quantity * item.unit_cost);
                doc.text(itemTotal.toFixed(2) + ' RON', currentX, rowY, { width: colWidths.total });
                
                totalValue += itemTotal;
                
                doc.moveDown(0.8);
                
                // Afișează batch și expiry dacă există
                if (item.batch_number || item.expiry_date) {
                    doc.fontSize(7).fillColor('#666666');
                    let batchInfo = '';
                    if (item.batch_number) batchInfo += `Lot: ${item.batch_number}`;
                    if (item.expiry_date) batchInfo += (batchInfo ? ' | ' : '') + `Expirare: ${formatDate(item.expiry_date)}`;
                    doc.text(batchInfo, 80, doc.y, { width: 450 });
                    doc.fillColor('#000000').fontSize(9);
                    doc.moveDown(0.3);
                }
            });
            
            // ==================== TOTAL ====================
            
            doc.moveDown(0.5);
            doc.strokeColor('#333333').lineWidth(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            
            doc.font('TimesRomanBold').fontSize(11);
            doc.text(`TOTAL VALOARE: ${formatCurrency(totalValue)}`, 340, doc.y, { width: 205, align: 'right' });
            
            doc.moveDown(1);
            
            // ==================== INFO SUPLIMENTARE ====================
            
            doc.font('TimesRoman').fontSize(9);
            
            if (transfer.requested_by) {
                doc.text(`Solicitat de: ${sanitizeRomanianText(transfer.requested_by)}`, 50, doc.y);
            }
            
            if (transfer.approved_by) {
                doc.text(`Aprobat de: ${sanitizeRomanianText(transfer.approved_by)}`, 50, doc.y + 15);
            }
            
            if (transfer.completed_at) {
                doc.text(`Finalizat la: ${formatDate(transfer.completed_at)}`, 50, doc.y + 15);
            }
            
            if (transfer.notes) {
                doc.moveDown(1);
                doc.font('TimesRomanBold').fontSize(10);
                doc.text('Observații:', 50, doc.y);
                doc.font('TimesRoman').fontSize(9);
                doc.text(sanitizeRomanianText(transfer.notes), 50, doc.y + 5, { width: 495 });
            }
            
            // ==================== INFO RECEPȚIE ====================
            
            doc.moveDown(1);
            doc.fontSize(8).fillColor('#666666');
            doc.text(
                'Toate produsele au fost verificate și acceptate la recepție.',
                50,
                doc.y,
                { width: 495 }
            );
            doc.fillColor('#000000');
            
            // ==================== FOOTER - SEMNĂTURI ====================
            
            // Plasează semnăturile în partea de jos a paginii
            const signatureY = 700;
            
            doc.fontSize(9);
            doc.text('Expediat de:', 50, signatureY);
            doc.text('_____________________', 50, signatureY + 15);
            doc.text('(Semnătură și ștampilă)', 50, signatureY + 30, { width: 150, fontSize: 7 });
            doc.text(sanitizeRomanianText(fromLocation.name), 50, signatureY + 45, { width: 150, fontSize: 8 });
            
            doc.text('Recepționat de:', 320, signatureY);
            doc.text('_____________________', 320, signatureY + 15);
            doc.text('(Semnătură și ștampilă)', 320, signatureY + 30, { width: 150, fontSize: 7 });
            doc.text(sanitizeRomanianText(toLocation.name), 320, signatureY + 45, { width: 150, fontSize: 8 });
            
            // ==================== FOOTER - DATA GENERARE ====================
            
            doc.fontSize(7).font('TimesRoman');
            doc.text(
                `Document generat automat la ${new Date().toLocaleString('ro-RO')}`, 
                50, 
                780, 
                { align: 'center', width: 495 }
            );
            
            // Finalizează PDF
            doc.end();
            
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateAvizTransferPDF,
    generateNIRTransferPDF
};

