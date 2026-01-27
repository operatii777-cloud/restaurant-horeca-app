/**
 * ETAPA 3: INVENTORY PDF GENERATOR
 * =================================
 * 
 * Generează rapoarte PDF pentru sesiuni de inventar:
 * - Raport inventar cu breakdown per gestiune
 * - Diferențe și ajustări
 * - Valoare totală
 * 
 * @created 29 Octombrie 2025
 * @version 1.0.0
 */

const PDFDocument = require('pdfkit');
const { dbPromise } = require('../database');
const fs = require('fs');
const path = require('path');

// Paths pentru fonturile Times New Roman (Windows)
const FONTS = {
    regular: 'C:\\Windows\\Fonts\\times.ttf',
    bold: 'C:\\Windows\\Fonts\\timesbd.ttf',
    italic: 'C:\\Windows\\Fonts\\timesi.ttf'
};

/**
 * Generează PDF pentru raport inventar
 * @param {string} sessionId - ID sesiune inventar
 * @param {object} res - Express response object
 */
async function generateInventoryPDF(sessionId, res) {
    const db = await dbPromise;
    
    try {
        // Obține detaliile sesiunii
        const session = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM inventory_sessions WHERE id = ?`, [sessionId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!session) {
            throw new Error('Sesiunea nu există');
        }
        
        // Parse gestiuni selectate
        let locationIds = [];
        if (session.selected_locations) {
            locationIds = JSON.parse(session.selected_locations);
        } else {
            const allLocations = await new Promise((resolve, reject) => {
                db.all(`SELECT id FROM management_locations WHERE is_active = 1`, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            locationIds = allLocations.map(loc => loc.id);
        }
        
        // Obține numărătorile
        const counts = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ic.*,
                    i.name as ingredient_name,
                    i.unit,
                    i.category,
                    i.current_stock as theoretical_stock,
                    i.cost_per_unit,
                    ml.name as location_name,
                    ml.type as location_type
                FROM inventory_counts ic
                JOIN ingredients i ON ic.ingredient_id = i.id
                LEFT JOIN management_locations ml ON ic.location_id = ml.id
                WHERE ic.session_id = ?
                ORDER BY ml.name, i.category, i.name
            `, [sessionId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        // Creează PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        // Înregistrează fonturile Times New Roman (suport diacritice)
        doc.registerFont('TimesRoman', FONTS.regular);
        doc.registerFont('TimesRomanBold', FONTS.bold);
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Inventar-${sessionId}.pdf`);
        
        // Pipe PDF la response
        doc.pipe(res);
        
        // === HEADER ===
        doc.fontSize(20).font('TimesRomanBold').text('RAPORT INVENTAR', { align: 'center' });
        doc.moveDown(0.5);
        
        // Informații sesiune
        doc.fontSize(10).font('TimesRoman');
        doc.text(`Sesiune: ${sessionId}`);
        doc.text(`Tip: ${session.session_type === 'daily' ? 'Zilnic' : 'Lunar'}`);
        doc.text(`Scope: ${session.scope || 'global'}`);
        doc.text(`Început: ${new Date(session.started_at).toLocaleString('ro-RO')}`);
        if (session.completed_at) {
            doc.text(`Finalizat: ${new Date(session.completed_at).toLocaleString('ro-RO')}`);
        }
        doc.text(`Status: ${session.status === 'completed' ? 'FINALIZAT' : 'ÎN PROGRES'}`);
        doc.moveDown();
        
        // Linie separator
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();
        
        // === DETALII PER GESTIUNE ===
        
        // Grupează numărătorile per gestiune
        const byLocation = {};
        for (const count of counts) {
            const locName = count.location_name || 'Fără locație';
            if (!byLocation[locName]) {
                byLocation[locName] = {
                    items: [],
                    totalDifference: 0,
                    totalValue: 0
                };
            }
            
            const difference = (count.counted_stock || 0) - (count.theoretical_stock || 0);
            const differenceValue = difference * (count.cost_per_unit || 0);
            
            byLocation[locName].items.push({
                ...count,
                difference,
                differenceValue
            });
            
            byLocation[locName].totalDifference += Math.abs(difference);
            byLocation[locName].totalValue += differenceValue;
        }
        
        // Renderează fiecare gestiune
        for (const [locationName, data] of Object.entries(byLocation)) {
            // Check pentru pagină nouă
            if (doc.y > 700) {
                doc.addPage();
            }
            
            doc.fontSize(14).font('TimesRomanBold').text(`📍 ${locationName}`, { underline: true });
            doc.moveDown(0.5);
            
            // Header tabel
            doc.fontSize(8).font('TimesRomanBold');
            const startY = doc.y;
            doc.text('Ingredient', 50, startY, { width: 120 });
            doc.text('UM', 170, startY, { width: 30 });
            doc.text('Teoretic', 200, startY, { width: 50, align: 'right' });
            doc.text('Numărat', 250, startY, { width: 50, align: 'right' });
            doc.text('Dif.', 300, startY, { width: 40, align: 'right' });
            doc.text('Cost/UM', 340, startY, { width: 60, align: 'right' });
            doc.text('Val. Dif.', 400, startY, { width: 60, align: 'right' });
            
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            
            // Rânduri tabel
            doc.font('TimesRoman').fontSize(8);
            for (const item of data.items) {
                // Check pentru pagină nouă
                if (doc.y > 720) {
                    doc.addPage();
                    // Reprint header
                    doc.fontSize(14).font('TimesRomanBold').text(`📍 ${locationName} (continuare)`, { underline: true });
                    doc.moveDown(0.5);
                    doc.fontSize(8).font('TimesRomanBold');
                    const headerY = doc.y;
                    doc.text('Ingredient', 50, headerY, { width: 120 });
                    doc.text('UM', 170, headerY, { width: 30 });
                    doc.text('Teoretic', 200, headerY, { width: 50, align: 'right' });
                    doc.text('Numărat', 250, headerY, { width: 50, align: 'right' });
                    doc.text('Dif.', 300, headerY, { width: 40, align: 'right' });
                    doc.text('Cost/UM', 340, headerY, { width: 60, align: 'right' });
                    doc.text('Val. Dif.', 400, headerY, { width: 60, align: 'right' });
                    doc.moveDown();
                    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                    doc.moveDown(0.3);
                    doc.font('TimesRoman').fontSize(8);
                }
                
                const rowY = doc.y;
                const name = item.ingredient_name.length > 18 ? item.ingredient_name.substring(0, 18) + '...' : item.ingredient_name;
                doc.text(name, 50, rowY, { width: 120 });
                doc.text(item.unit, 170, rowY, { width: 30 });
                doc.text((item.theoretical_stock || 0).toFixed(2), 200, rowY, { width: 50, align: 'right' });
                doc.text((item.counted_stock || 0).toFixed(2), 250, rowY, { width: 50, align: 'right' });
                
                // Diferență cu culoare
                const diffText = item.difference >= 0 ? `+${item.difference.toFixed(2)}` : item.difference.toFixed(2);
                doc.fillColor(item.difference >= 0 ? 'green' : 'red');
                doc.text(diffText, 300, rowY, { width: 40, align: 'right' });
                doc.fillColor('black');
                
                doc.text((item.cost_per_unit || 0).toFixed(2), 340, rowY, { width: 60, align: 'right' });
                
                // Valoare diferență cu culoare
                const valText = item.differenceValue >= 0 ? `+${item.differenceValue.toFixed(2)}` : item.differenceValue.toFixed(2);
                doc.fillColor(item.differenceValue >= 0 ? 'green' : 'red');
                doc.text(valText, 400, rowY, { width: 60, align: 'right' });
                doc.fillColor('black');
                
                doc.moveDown(0.5);
            }
            
            // Subtotal pentru gestiune
            doc.moveDown(0.3);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            
            doc.fontSize(9).font('TimesRomanBold');
            const subtotalY = doc.y;
            doc.text(`SUBTOTAL ${locationName}:`, 50, subtotalY, { width: 280 });
            doc.text(`${data.totalValue.toFixed(2)} RON`, 400, subtotalY, { width: 60, align: 'right' });
            
            doc.moveDown(1.5);
        }
        
        // === TOTAL GENERAL ===
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(2).stroke();
        doc.moveDown(0.5);
        
        doc.fontSize(12).font('TimesRomanBold');
        const totalY = doc.y;
        doc.text('TOTAL DIFERENȚĂ:', 50, totalY, { width: 280 });
        doc.fillColor(session.total_difference_value >= 0 ? 'green' : 'red');
        doc.text(`${(session.total_difference_value || 0).toFixed(2)} RON`, 400, totalY, { width: 60, align: 'right' });
        doc.fillColor('black');
        
        // === FOOTER ===
        doc.moveDown(2);
        doc.fontSize(8).font('TimesRoman');
        doc.text(`Document generat: ${new Date().toLocaleString('ro-RO')}`, { align: 'center' });
        doc.text(`Powered by Restaurant Management System`, { align: 'center' });
        
        // Finalizează PDF
        doc.end();
        
        console.log(`✅ [PDF] Raport inventar generat pentru sesiunea ${sessionId}`);
        
    } catch (error) {
        console.error(`❌ [PDF] Eroare la generare raport inventar:`, error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Eroare la generare PDF',
                details: error.message
            });
        }
    }
}

module.exports = {
    generateInventoryPDF
};

