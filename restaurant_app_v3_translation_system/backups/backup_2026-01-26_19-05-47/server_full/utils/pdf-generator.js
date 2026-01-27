// PDF Generator - Unified Engine for AdminV4 Reports
// Purpose: Generate professional PDF reports with Dark-Navy branding
// Created: 3 Dec 2025

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF report
 * @param {Object} options - Report configuration
 * @param {string} options.title - Report title
 * @param {Array} options.columns - Table columns [{label, field, width}]
 * @param {Array} options.rows - Table rows (array of objects)
 * @param {string} options.subtitle - Optional subtitle
 * @param {Object} options.summary - Optional summary stats
 * @returns {Promise<string>} - Path to generated PDF
 */
async function generatePdfReport(options) {
  const { title, columns, rows, subtitle, summary } = options;
  
  return new Promise((resolve, reject) => {
    try {
      // Create temp directory if not exists
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const filename = `${Date.now()}_${title.replace(/\s+/g, '_')}.pdf`;
      const filepath = path.join(tempDir, filename);
      
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      // HEADER - Logo & Branding
      doc
        .fontSize(10)
        .fillColor('#64748b')
        .text('Restaurant App V3 - Admin Panel', 50, 50, { align: 'right' })
        .text(`Generated: ${new Date().toLocaleString('ro-RO')}`, 50, 65, { align: 'right' });
      
      // TITLE
      doc
        .fontSize(24)
        .fillColor('#020617')
        .font('Helvetica-Bold')
        .text(title, 50, 100, { align: 'center' });
      
      // SUBTITLE
      if (subtitle) {
        doc
          .fontSize(12)
          .fillColor('#64748b')
          .font('Helvetica')
          .text(subtitle, 50, 130, { align: 'center' });
      }
      
      doc.moveDown(2);
      
      // SUMMARY STATS (if provided)
      if (summary && Object.keys(summary).length > 0) {
        let yPos = doc.y;
        
        doc
          .fontSize(10)
          .fillColor('#0f172a')
          .font('Helvetica-Bold');
        
        Object.entries(summary).forEach(([key, value], index) => {
          const xPos = 50 + (index % 3) * 170;
          if (index % 3 === 0 && index > 0) {
            yPos += 40;
          }
          
          // Box
          doc
            .rect(xPos, yPos, 160, 35)
            .fillAndStroke('#e2e8f0', '#cbd5e1');
          
          // Label
          doc
            .fillColor('#64748b')
            .font('Helvetica')
            .fontSize(8)
            .text(key, xPos + 8, yPos + 6, { width: 144 });
          
          // Value
          doc
            .fillColor('#020617')
            .font('Helvetica-Bold')
            .fontSize(14)
            .text(String(value), xPos + 8, yPos + 18, { width: 144 });
        });
        
        doc.moveDown(3);
      }
      
      // TABLE HEADER
      const startY = doc.y + 20;
      const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
      
      doc
        .rect(50, startY, tableWidth, 25)
        .fill('#0f172a');
      
      doc
        .fontSize(9)
        .fillColor('#94a3b8')
        .font('Helvetica-Bold');
      
      let xPos = 55;
      columns.forEach(col => {
        doc.text(col.label.toUpperCase(), xPos, startY + 8, { 
          width: col.width - 10,
          ellipsis: true
        });
        xPos += col.width;
      });
      
      // TABLE ROWS
      let yPos = startY + 25;
      
      doc
        .fontSize(9)
        .fillColor('#1e293b')
        .font('Helvetica');
      
      rows.forEach((row, rowIndex) => {
        // Check if need new page
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        
        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc
            .rect(50, yPos, tableWidth, 20)
            .fill('#f8fafc');
        }
        
        xPos = 55;
        columns.forEach(col => {
          const value = String(row[col.field] || '-');
          doc
            .fillColor('#1e293b')
            .text(value, xPos, yPos + 5, {
              width: col.width - 10,
              ellipsis: true
            });
          xPos += col.width;
        });
        
        yPos += 20;
      });
      
      // FOOTER
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor('#94a3b8')
          .text(
            `Pagina ${i + 1} din ${pages.count} | Restaurant App V3 - Powered by QrOMS`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }
      
      doc.end();
      
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePdfReport };

