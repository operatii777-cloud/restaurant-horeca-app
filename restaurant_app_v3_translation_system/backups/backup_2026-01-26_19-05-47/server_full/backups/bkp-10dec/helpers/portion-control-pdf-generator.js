/**
 * ETAPA 6: PORTION CONTROL PDF GENERATOR
 * =======================================
 * 
 * Generează rapoarte PDF pentru conformitatea porțiilor:
 * - Raport de conformitate per perioadă
 * - Statistici generale
 * - Top deviații per produs/ingredient
 * - Analiza tendințelor
 * 
 * @created 29 Octombrie 2025
 * @version 1.0.0
 */

const PDFDocument = require('pdfkit');
const { dbPromise } = require('../database');

// Paths pentru fonturile Times New Roman (Windows)
const FONTS = {
    regular: 'C:\\Windows\\Fonts\\times.ttf',
    bold: 'C:\\Windows\\Fonts\\timesbd.ttf',
    italic: 'C:\\Windows\\Fonts\\timesi.ttf'
};

/**
 * Generează PDF pentru raportul de conformitate porții
 * @param {object} filters - Filtre pentru raport (dateFrom, dateTo, location_id, product_id)
 * @param {object} res - Express response object
 */
async function generateCompliancePDF(filters, res) {
    const db = await dbPromise;
    
    try {
        // Obține datele pentru raport
        const complianceData = await getComplianceData(db, filters);
        const statistics = await getStatistics(db, filters);
        const topDeviations = await getTopDeviations(db, filters);
        const locationInfo = filters.location_id ? await getLocationInfo(db, filters.location_id) : null;
        
        // Creează documentul PDF
        const doc = new PDFDocument({ 
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        // Înregistrează fonturile Times New Roman
        doc.registerFont('TimesRoman', FONTS.regular);
        doc.registerFont('TimesRomanBold', FONTS.bold);
        doc.registerFont('TimesRomanItalic', FONTS.italic);
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=raport-conformitate-portii-${Date.now()}.pdf`);
        
        // Pipe documentul la response
        doc.pipe(res);
        
        // ========== HEADER ==========
        doc.font('TimesRomanBold').fontSize(20).text('RAPORT CONFORMITATE PORȚII', { align: 'center' });
        doc.moveDown(0.5);
        
        // Perioada și filtre
        doc.font('TimesRoman').fontSize(10);
        doc.text(`Perioadă: ${filters.dateFrom || 'Început'} - ${filters.dateTo || 'Sfârșit'}`, { align: 'center' });
        
        if (locationInfo) {
            doc.text(`Gestiune: ${locationInfo.name}`, { align: 'center' });
        }
        
        doc.text(`Data generare: ${new Date().toLocaleString('ro-RO')}`, { align: 'center' });
        doc.moveDown(1);
        
        // Linie separator
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);
        
        // ========== STATISTICI GENERALE ==========
        doc.font('TimesRomanBold').fontSize(14).text('📊 Statistici Generale');
        doc.moveDown(0.5);
        
        const statsStartY = doc.y;
        const colWidth = 160;
        
        // Coloană 1: Compliant
        doc.font('TimesRomanBold').fontSize(11).text('Conforme:', 50, statsStartY);
        doc.font('TimesRoman').fontSize(10).text(`${statistics.compliant} (${((statistics.compliant / statistics.total) * 100).toFixed(1)}%)`, 50, doc.y);
        if (statistics.compliantDetails) {
            doc.fontSize(9).fillColor('#666666')
               .text(`Media: ${statistics.compliantDetails.avgVariance.toFixed(2)}%`, 50, doc.y);
            doc.fillColor('#000000');
        }
        
        // Coloană 2: Warning
        const col2X = 50 + colWidth;
        doc.font('TimesRomanBold').fontSize(11).text('Avertizări:', col2X, statsStartY);
        doc.font('TimesRoman').fontSize(10).text(`${statistics.warning} (${((statistics.warning / statistics.total) * 100).toFixed(1)}%)`, col2X, statsStartY + 15);
        if (statistics.warningDetails) {
            doc.fontSize(9).fillColor('#FF8C00')
               .text(`Media: ${statistics.warningDetails.avgVariance.toFixed(2)}%`, col2X, doc.y);
            doc.fillColor('#000000');
        }
        
        // Coloană 3: Critical
        const col3X = 50 + colWidth * 2;
        doc.font('TimesRomanBold').fontSize(11).text('Critice:', col3X, statsStartY);
        doc.font('TimesRoman').fontSize(10).text(`${statistics.critical} (${((statistics.critical / statistics.total) * 100).toFixed(1)}%)`, col3X, statsStartY + 15);
        if (statistics.criticalDetails) {
            doc.fontSize(9).fillColor('#FF0000')
               .text(`Media: ${statistics.criticalDetails.avgVariance.toFixed(2)}%`, col3X, doc.y);
            doc.fillColor('#000000');
        }
        
        doc.moveDown(2);
        
        // Total
        doc.font('TimesRomanBold').fontSize(11).text(`Total înregistrări: ${statistics.total}`);
        doc.moveDown(1);
        
        // Linie separator
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);
        
        // ========== TOP DEVIAȚII ==========
        doc.font('TimesRomanBold').fontSize(14).text('🚨 Top 10 Deviații (Produse și Ingrediente)');
        doc.moveDown(0.5);
        
        if (topDeviations.length === 0) {
            doc.font('TimesRomanItalic').fontSize(10).fillColor('#999999')
               .text('Nu există deviații înregistrate în această perioadă.');
            doc.fillColor('#000000');
        } else {
            // Tabel header
            const tableTop = doc.y;
            const tableHeaderY = tableTop;
            
            doc.font('TimesRomanBold').fontSize(9);
            doc.text('#', 50, tableHeaderY, { width: 20 });
            doc.text('Produs', 75, tableHeaderY, { width: 120 });
            doc.text('Ingredient', 200, tableHeaderY, { width: 100 });
            doc.text('Variație Medie', 305, tableHeaderY, { width: 70, align: 'right' });
            doc.text('Critice', 380, tableHeaderY, { width: 45, align: 'right' });
            doc.text('Avert.', 430, tableHeaderY, { width: 45, align: 'right' });
            doc.text('Conf.', 480, tableHeaderY, { width: 45, align: 'right' });
            
            doc.moveDown(0.3);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            
            // Tabel rows
            doc.font('TimesRoman').fontSize(8);
            
            topDeviations.forEach((deviation, index) => {
                if (doc.y > 700) { // Pagină nouă dacă nu mai avem spațiu
                    doc.addPage();
                    doc.font('TimesRomanBold').fontSize(9);
                    doc.text('#', 50, 50, { width: 20 });
                    doc.text('Produs', 75, 50, { width: 120 });
                    doc.text('Ingredient', 200, 50, { width: 100 });
                    doc.text('Variație Medie', 305, 50, { width: 70, align: 'right' });
                    doc.text('Critice', 380, 50, { width: 45, align: 'right' });
                    doc.text('Avert.', 430, 50, { width: 45, align: 'right' });
                    doc.text('Conf.', 480, 50, { width: 45, align: 'right' });
                    doc.moveDown(0.5);
                    doc.font('TimesRoman').fontSize(8);
                }
                
                const rowY = doc.y;
                
                // Colorare variație
                let varianceColor = '#000000';
                if (Math.abs(deviation.avg_variance_percentage) > 10) {
                    varianceColor = '#FF0000'; // Roșu pentru > 10%
                } else if (Math.abs(deviation.avg_variance_percentage) > 5) {
                    varianceColor = '#FF8C00'; // Portocaliu pentru > 5%
                }
                
                doc.text(`${index + 1}`, 50, rowY, { width: 20 });
                doc.text(deviation.product_name || 'N/A', 75, rowY, { width: 120 });
                doc.text(deviation.ingredient_name || 'N/A', 200, rowY, { width: 100 });
                doc.fillColor(varianceColor);
                doc.text(`${deviation.avg_variance_percentage > 0 ? '+' : ''}${deviation.avg_variance_percentage.toFixed(2)}%`, 305, rowY, { width: 70, align: 'right' });
                doc.fillColor('#000000');
                doc.text(`${deviation.critical_count}`, 380, rowY, { width: 45, align: 'right' });
                doc.text(`${deviation.warning_count}`, 430, rowY, { width: 45, align: 'right' });
                doc.text(`${deviation.compliant_count}`, 480, rowY, { width: 45, align: 'right' });
                
                doc.moveDown(0.7);
            });
        }
        
        doc.moveDown(1);
        
        // Linie separator
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);
        
        // ========== DETALII CONFORMITATE (primele 50 înregistrări) ==========
        if (complianceData.length > 0) {
            doc.font('TimesRomanBold').fontSize(14).text('📋 Detalii Conformitate (Primele 50)');
            doc.moveDown(0.5);
            
            // Tabel header
            doc.font('TimesRomanBold').fontSize(8);
            doc.text('Data', 50, doc.y, { width: 70 });
            doc.text('Produs', 125, doc.y, { width: 100 });
            doc.text('Ingredient', 230, doc.y, { width: 90 });
            doc.text('Așteptat', 325, doc.y, { width: 50, align: 'right' });
            doc.text('Actual', 380, doc.y, { width: 50, align: 'right' });
            doc.text('Variație', 435, doc.y, { width: 50, align: 'right' });
            doc.text('Status', 490, doc.y, { width: 50, align: 'center' });
            
            doc.moveDown(0.3);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            
            // Tabel rows
            doc.font('TimesRoman').fontSize(7);
            
            const maxRows = Math.min(complianceData.length, 50);
            
            for (let i = 0; i < maxRows; i++) {
                const entry = complianceData[i];
                
                if (doc.y > 720) { // Pagină nouă
                    doc.addPage();
                    doc.font('TimesRomanBold').fontSize(8);
                    doc.text('Data', 50, 50, { width: 70 });
                    doc.text('Produs', 125, 50, { width: 100 });
                    doc.text('Ingredient', 230, 50, { width: 90 });
                    doc.text('Așteptat', 325, 50, { width: 50, align: 'right' });
                    doc.text('Actual', 380, 50, { width: 50, align: 'right' });
                    doc.text('Variație', 435, 50, { width: 50, align: 'right' });
                    doc.text('Status', 490, 50, { width: 50, align: 'center' });
                    doc.moveDown(0.5);
                    doc.font('TimesRoman').fontSize(7);
                }
                
                const rowY = doc.y;
                
                // Status color
                let statusColor = '#000000';
                let statusText = '';
                if (entry.compliance_status === 'compliant') {
                    statusColor = '#008000';
                    statusText = 'OK';
                } else if (entry.compliance_status === 'warning') {
                    statusColor = '#FF8C00';
                    statusText = 'AVERT';
                } else if (entry.compliance_status === 'critical') {
                    statusColor = '#FF0000';
                    statusText = 'CRITIC';
                }
                
                doc.text(entry.timestamp ? entry.timestamp.split(' ')[0] : 'N/A', 50, rowY, { width: 70 });
                doc.text(entry.product_name || 'N/A', 125, rowY, { width: 100 });
                doc.text(entry.ingredient_name || 'N/A', 230, rowY, { width: 90 });
                doc.text(`${entry.expected_quantity} ${entry.ingredient_unit || ''}`, 325, rowY, { width: 50, align: 'right' });
                doc.text(`${entry.actual_quantity} ${entry.ingredient_unit || ''}`, 380, rowY, { width: 50, align: 'right' });
                doc.text(`${entry.variance_percentage > 0 ? '+' : ''}${entry.variance_percentage.toFixed(1)}%`, 435, rowY, { width: 50, align: 'right' });
                doc.fillColor(statusColor);
                doc.text(statusText, 490, rowY, { width: 50, align: 'center' });
                doc.fillColor('#000000');
                
                doc.moveDown(0.6);
            }
            
            if (complianceData.length > 50) {
                doc.moveDown(0.5);
                doc.font('TimesRomanItalic').fontSize(8).fillColor('#999999')
                   .text(`* Afișate primele 50 din ${complianceData.length} înregistrări. Pentru lista completă, accesați raportul online.`, { align: 'center' });
                doc.fillColor('#000000');
            }
        }
        
        // ========== FOOTER ==========
        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        
        doc.font('TimesRomanItalic').fontSize(8).fillColor('#666666')
           .text('Acest raport a fost generat automat de sistemul de management al restaurantului.', { align: 'center' });
        doc.text('Pentru detalii suplimentare, contactați administratorul.', { align: 'center' });
        doc.fillColor('#000000');
        
        // Finalizează PDF
        doc.end();
        
    } catch (error) {
        console.error('❌ [PDF] Eroare la generare raport conformitate:', error);
        throw error;
    }
}

/**
 * Obține datele de conformitate din baza de date
 */
async function getComplianceData(db, filters) {
    let query = `
        SELECT 
            pcl.*,
            m.name as product_name,
            i.name as ingredient_name,
            i.unit as ingredient_unit,
            ml.name as location_name
        FROM portion_compliance_log pcl
        LEFT JOIN menu m ON pcl.product_id = m.id
        LEFT JOIN ingredients i ON pcl.ingredient_id = i.id
        LEFT JOIN management_locations ml ON pcl.location_id = ml.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.dateFrom) {
        query += ` AND date(pcl.timestamp) >= date(?)`;
        params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
        query += ` AND date(pcl.timestamp) <= date(?)`;
        params.push(filters.dateTo);
    }
    
    if (filters.product_id) {
        query += ` AND pcl.product_id = ?`;
        params.push(filters.product_id);
    }
    
    if (filters.location_id) {
        query += ` AND pcl.location_id = ?`;
        params.push(filters.location_id);
    }
    
    query += ` ORDER BY pcl.timestamp DESC LIMIT 100`;
    
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

/**
 * Obține statisticile de conformitate
 */
async function getStatistics(db, filters) {
    let query = `
        SELECT 
            compliance_status,
            COUNT(*) as count,
            AVG(variance_percentage) as avg_variance_percentage,
            MIN(variance_percentage) as min_variance_percentage,
            MAX(variance_percentage) as max_variance_percentage
        FROM portion_compliance_log
        WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.dateFrom) {
        query += ` AND date(timestamp) >= date(?)`;
        params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
        query += ` AND date(timestamp) <= date(?)`;
        params.push(filters.dateTo);
    }
    
    if (filters.product_id) {
        query += ` AND product_id = ?`;
        params.push(filters.product_id);
    }
    
    if (filters.location_id) {
        query += ` AND location_id = ?`;
        params.push(filters.location_id);
    }
    
    query += ` GROUP BY compliance_status`;
    
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else {
                const stats = {
                    compliant: 0,
                    warning: 0,
                    critical: 0,
                    total: 0,
                    compliantDetails: null,
                    warningDetails: null,
                    criticalDetails: null
                };
                
                rows.forEach(row => {
                    stats[row.compliance_status] = row.count;
                    stats[`${row.compliance_status}Details`] = {
                        count: row.count,
                        avgVariance: row.avg_variance_percentage,
                        minVariance: row.min_variance_percentage,
                        maxVariance: row.max_variance_percentage
                    };
                    stats.total += row.count;
                });
                
                resolve(stats);
            }
        });
    });
}

/**
 * Obține top deviațiile
 */
async function getTopDeviations(db, filters) {
    let query = `
        SELECT 
            pcl.product_id,
            pcl.ingredient_id,
            m.name as product_name,
            i.name as ingredient_name,
            COUNT(*) as occurrence_count,
            AVG(pcl.variance_percentage) as avg_variance_percentage,
            SUM(CASE WHEN pcl.compliance_status = 'critical' THEN 1 ELSE 0 END) as critical_count,
            SUM(CASE WHEN pcl.compliance_status = 'warning' THEN 1 ELSE 0 END) as warning_count,
            SUM(CASE WHEN pcl.compliance_status = 'compliant' THEN 1 ELSE 0 END) as compliant_count
        FROM portion_compliance_log pcl
        LEFT JOIN menu m ON pcl.product_id = m.id
        LEFT JOIN ingredients i ON pcl.ingredient_id = i.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.dateFrom) {
        query += ` AND date(pcl.timestamp) >= date(?)`;
        params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
        query += ` AND date(pcl.timestamp) <= date(?)`;
        params.push(filters.dateTo);
    }
    
    if (filters.location_id) {
        query += ` AND pcl.location_id = ?`;
        params.push(filters.location_id);
    }
    
    query += `
        GROUP BY pcl.product_id, pcl.ingredient_id
        ORDER BY ABS(avg_variance_percentage) DESC
        LIMIT 10
    `;
    
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

/**
 * Obține informații despre gestiune
 */
async function getLocationInfo(db, locationId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id, name, type FROM management_locations WHERE id = ?`,
            [locationId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

module.exports = {
    generateCompliancePDF
};

