/**
 * CROSS-CONTAMINATION SERVICE
 * Data: 03 Decembrie 2025
 * Gestionare risc alergeni (cross-contamination)
 */

const db = require('../config/database');

class CrossContaminationService {
  
  async assessRisk(locationId, allergen) {
    // Verifică ce produse se prepară în locația respectivă
    const products = await this.getProductsByLocation(locationId);
    
    // Verifică câte produse conțin alergenul
    const productsWithAllergen = products.filter(p => {
      const allergens = JSON.parse(p.allergens || '[]');
      return allergens.includes(allergen);
    });
    
    // Determină risc
    const riskPercentage = (productsWithAllergen.length / products.length) * 100;
    
    let riskLevel = 'low';
    if (riskPercentage > 50) riskLevel = 'high';
    else if (riskPercentage > 20) riskLevel = 'medium';
    
    return {
      location_id: locationId,
      allergen,
      products_total: products.length,
      products_with_allergen: productsWithAllergen.length,
      risk_percentage: riskPercentage,
      risk_level: riskLevel
    };
  }
  
  async create(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      db.run(`INSERT INTO allergen_cross_contamination (${fields}) VALUES (${placeholders})`, values, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  }
  
  async getProductsByLocation(locationId) {
    // TODO: Implement
    return [];
  }
}

module.exports = new CrossContaminationService();

