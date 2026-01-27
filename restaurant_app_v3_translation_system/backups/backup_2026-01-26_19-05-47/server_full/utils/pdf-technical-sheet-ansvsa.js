/**
 * PDF GENERATOR - Fișă Tehnică conform Ordin ANSVSA 201/2022
 * Data: 03 Decembrie 2025
 * Conformitate: UE 1169/2011 + Ordin 201/2022
 * 
 * CARACTERISTICI:
 * - Alergeni BOLD + COLOR + UPPERCASE
 * - Ingrediente ordonate descrescător
 * - Valori nutriționale per 100g
 * - Aditivi cu funcție
 * - Semnături electronice
 * - QR code
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

class TechnicalSheetPDFGenerator {
  
  /**
   * Generează PDF fișă tehnică
   * @param {Object} techSheet - Date fișă tehnică
   * @param {string} outputPath - Cale salvare PDF
   * @returns {Promise<string>} Cale către PDF generat
   */
  async generate(techSheet, outputPath = null) {
    if (!outputPath) {
      const dir = path.join(__dirname, '../technical-sheets-pdf');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      outputPath = path.join(dir, `TS-${techSheet.id}-${Date.now()}.pdf`);
    }
    
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // ========== HEADER ==========
        doc.fontSize(24)
          .font('Helvetica-Bold')
          .fillColor('#1e293b')
          .text('FIȘĂ TEHNICĂ DE PRODUS', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(10)
          .font('Helvetica')
          .fillColor('#64748b')
          .text('Conform Ordin ANSVSA 201/2022 + Regulament UE 1169/2011', { align: 'center' });
        
        doc.moveDown(2);
        
        // ========== PRODUS ==========
        doc.fontSize(18)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text(techSheet.name_ro);
        
        if (techSheet.name_en) {
          doc.fontSize(14)
            .font('Helvetica-Oblique')
            .fillColor('#475569')
            .text(`(${techSheet.name_en})`);
        }
        
        doc.moveDown(0.5);
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#64748b')
          .text(`Categorie: ${techSheet.category}`);
        
        doc.moveDown(1.5);
        
        // ========== INGREDIENTE (cu marcaj VIZUAL alergeni) ==========
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('INGREDIENTE:', { underline: true });
        
        doc.moveDown(0.5);
        
        const ingredients = JSON.parse(techSheet.ingredients_ordered || '[]');
        
        ingredients.forEach((ing, idx) => {
          const text = `${idx + 1}. ${ing.name} (${ing.quantity} ${ing.unit})`;
          
          // ⚠️ MARCAJ VIZUAL ALERGENI (conform legislație UE 1169/2011)
          if (ing.is_allergen && ing.allergens && ing.allergens.length > 0) {
            // IMPLEMENTARE REALĂ: BOLD + RED + UPPERCASE
            doc.fontSize(12)
              .font('Helvetica-Bold') // BOLD pentru alergeni
              .fillColor('red') // RED color
              .text(text.toUpperCase()); // UPPERCASE
            
            // Reset la font normal pentru următorul ingredient
            doc.font('Helvetica').fillColor('#1e293b');
          } else {
            // Ingrediente normale (fără alergeni)
            doc.fontSize(12)
              .font('Helvetica')
              .fillColor('#1e293b')
              .text(text);
          }
        });
        
        doc.moveDown(1.5);
        
        // ========== ALERGENI (secțiune separată cu WARNING) ==========
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#dc2626')
          .text('⚠️ ALERGENI:', { underline: true });
        
        doc.moveDown(0.5);
        
        const allergens = JSON.parse(techSheet.allergens || '[]');
        
        if (allergens.length > 0) {
          // IMPLEMENTARE REALĂ: WARNING BOX cu BOLD + RED
          doc.fontSize(13)
            .font('Helvetica-Bold')
            .fillColor('red') // RED explicit
            .text(`Conține: ${allergens.join(', ').toUpperCase()}`);
          
          // Reset font
          doc.font('Helvetica').fillColor('#1e293b');
        } else {
          doc.fontSize(12)
            .font('Helvetica')
            .fillColor('green') // GREEN pentru "no allergens"
            .text('✓ Nu conține alergeni majori');
          
          // Reset
          doc.fillColor('#1e293b');
        }
        
        // Alergeni traces (cross-contamination)
        if (techSheet.allergens_traces) {
          const traces = JSON.parse(techSheet.allergens_traces || '[]');
          if (traces.length > 0) {
            doc.moveDown(0.3);
            doc.fontSize(11)
              .font('Helvetica-Oblique')
              .fillColor('#ea580c')
              .text(`⚠️ Poate conține urme de: ${traces.join(', ')}`);
          }
        }
        
        doc.moveDown(1.5);
        
        // ========== ADITIVI ALIMENTARI ==========
        if (techSheet.additives) {
          const additives = JSON.parse(techSheet.additives || '[]');
          
          if (additives.length > 0) {
            doc.fontSize(14)
              .font('Helvetica-Bold')
              .fillColor('#0f172a')
              .text('ADITIVI ALIMENTARI:', { underline: true });
            
            doc.moveDown(0.5);
            
            additives.forEach(add => {
              doc.fontSize(12)
                .font('Helvetica')
                .fillColor('#1e293b')
                .text(`${add.code} - ${add.name} (${add.function})`);
            });
            
            doc.moveDown(1.5);
          }
        }
        
        // ========== VALORI NUTRIȚIONALE (tabel) ==========
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('VALORI NUTRIȚIONALE (per 100g):', { underline: true });
        
        doc.moveDown(0.5);
        
        const nutritionTable = [
          ['Energie', `${techSheet.energy_kcal || 0} kcal / ${techSheet.energy_kj || 0} kJ`],
          ['Grăsimi', `${techSheet.fat || 0} g`, `  din care saturate: ${techSheet.saturated_fat || 0} g`],
          ['Glucide', `${techSheet.carbs || 0} g`, `  din care zaharuri: ${techSheet.sugars || 0} g`],
          ['Proteine', `${techSheet.protein || 0} g`],
          ['Sare', `${techSheet.salt || 0} g`],
          ['Fibre', `${techSheet.fiber || 0} g`]
        ];
        
        nutritionTable.forEach(row => {
          doc.fontSize(12)
            .font('Helvetica')
            .fillColor('#1e293b')
            .text(row.join(' - '));
        });
        
        doc.moveDown(1.5);
        
        // ========== GRAMAJ & CONDIȚII ==========
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('INFORMAȚII TEHNICE:', { underline: true });
        
        doc.moveDown(0.5);
        
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#1e293b')
          .text(`Gramaj porție: ${techSheet.portion_size_grams} g`);
        
        if (techSheet.serving_temperature) {
          doc.text(`Temperatura servire: ${techSheet.serving_temperature}`);
        }
        
        if (techSheet.storage_conditions) {
          doc.text(`Condiții păstrare: ${techSheet.storage_conditions}`);
        }
        
        if (techSheet.shelf_life) {
          doc.text(`Valabilitate: ${techSheet.shelf_life}`);
        }
        
        doc.moveDown(1.5);
        
        // ========== SEMNĂTURI ==========
        if (techSheet.status === 'approved' || techSheet.status === 'locked') {
          doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#0f172a')
            .text('APROBĂRI:', { underline: true });
          
          doc.moveDown(0.5);
          
          if (techSheet.approved_by_chef) {
            doc.fontSize(11)
              .font('Helvetica')
              .fillColor('#1e293b')
              .text(`✓ Chef: ${techSheet.approved_by_chef} - ${new Date(techSheet.approved_by_chef_at).toLocaleDateString('ro-RO')}`);
          }
          
          if (techSheet.approved_by_manager) {
            doc.fontSize(11)
              .text(`✓ Manager: ${techSheet.approved_by_manager} - ${new Date(techSheet.approved_by_manager_at).toLocaleDateString('ro-RO')}`);
          }
          
          doc.moveDown(1.5);
        }
        
        // ========== QR CODE ==========
        if (techSheet.qr_code_url) {
          try {
            const qrBuffer = await QRCode.toBuffer(techSheet.qr_code_url, {
              width: 150,
              margin: 1
            });
            
            doc.image(qrBuffer, doc.x, doc.y, { width: 100 });
            doc.moveDown(6);
            doc.fontSize(10)
              .font('Helvetica')
              .fillColor('#64748b')
              .text('Scanează pentru mai multe informații', { align: 'left' });
          } catch (qrError) {
            console.error('❌ QR code generation error:', qrError);
          }
        }
        
        // ========== FOOTER ==========
        doc.fontSize(8)
          .font('Helvetica')
          .fillColor('#94a3b8')
          .text('Fișă tehnică generată conform Ordin ANSVSA 201/2022 și Regulament UE 1169/2011', {
            align: 'center'
          });
        
        doc.text(`Generat: ${new Date().toLocaleDateString('ro-RO')} ${new Date().toLocaleTimeString('ro-RO')}`, {
          align: 'center'
        });
        
        if (techSheet.status === 'locked') {
          doc.fillColor('#dc2626')
            .text('✓ DOCUMENT LOCKED - Nu poate fi modificat', {
              align: 'center'
            });
        }
        
        // Finalizează PDF
        doc.end();
        
        stream.on('finish', () => {
          console.log(`✅ PDF generat: ${outputPath}`);
          resolve(outputPath);
        });
        
        stream.on('error', reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Generează PDF simplificat (fără cost - pentru clienți)
   */
  async generatePublic(techSheet, outputPath) {
    // Similar cu generate() dar exclude:
    // - Cost per portion
    // - Suggested price
    // - Margin percentage
    // - Internal notes
    
    // TODO: Implement
    return this.generate(techSheet, outputPath);
  }
}

module.exports = new TechnicalSheetPDFGenerator();

