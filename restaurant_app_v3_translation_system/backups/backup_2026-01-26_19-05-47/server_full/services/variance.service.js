/**
 * VARIANCE SERVICE - Theoretical vs Actual Usage
 * Data: 03 Decembrie 2025
 * Detectează pierderi, furt, erori în rețete
 */

const db = require('../config/database');

class VarianceService {
  
  /**
   * Calculează variance pentru o zi
   * @param {string} date - Format: YYYY-MM-DD
   * @param {number} locationId - Gestiune (opțional)
   */
  async calculateDailyVariance(date, locationId = null) {
    console.log(`📊 Calculating variance for ${date}...`);
    
    // Obține toate comenzile din ziua respectivă
    const orders = await this.getOrdersByDate(date);
    
    // Pentru fiecare ingredient folosit
    const ingredientUsage = {};
    
    for (const order of orders) {
      const orderIngredients = await this.getOrderIngredients(order.id);
      
      for (const ing of orderIngredients) {
        if (!ingredientUsage[ing.ingredient_id]) {
          ingredientUsage[ing.ingredient_id] = {
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.ingredient_name,
            theoretical: 0,
            actual: 0
          };
        }
        
        ingredientUsage[ing.ingredient_id].theoretical += ing.quantity_needed;
      }
    }
    
    // Obține consumul ACTUAL din stock_movements
    const actualUsage = await this.getActualUsageByDate(date, locationId);
    
    actualUsage.forEach(usage => {
      if (ingredientUsage[usage.ingredient_id]) {
        ingredientUsage[usage.ingredient_id].actual = usage.total_quantity;
      }
    });
    
    // Calculează variance
    const variances = [];
    
    for (const [ingredientId, usage] of Object.entries(ingredientUsage)) {
      const varianceQty = usage.actual - usage.theoretical;
      const variancePercentage = usage.theoretical > 0 
        ? (varianceQty / usage.theoretical) * 100 
        : 0;
      
      // Determină tipul variance
      let varianceType = 'acceptable';
      let requiresInvestigation = false;
      
      const threshold = 5.0; // ±5% toleranță
      
      if (Math.abs(variancePercentage) > threshold) {
        requiresInvestigation = true;
        varianceType = varianceQty > 0 ? 'surplus' : 'shortage';
      }
      
      // Calculează cost
      const theoreticalCost = usage.theoretical * (usage.avg_cost || 0);
      const actualCost = usage.actual * (usage.avg_cost || 0);
      const varianceCost = actualCost - theoreticalCost;
      
      // Salvează variance
      const variance = await this.createVariance({
        variance_date: date,
        location_id: locationId || 1,
        ingredient_id: usage.ingredient_id,
        ingredient_name: usage.ingredient_name,
        theoretical_usage: usage.theoretical,
        theoretical_cost: theoreticalCost,
        actual_usage: usage.actual,
        actual_cost: actualCost,
        variance_quantity: varianceQty,
        variance_percentage: variancePercentage,
        variance_cost: varianceCost,
        variance_type: varianceType,
        acceptable_threshold: threshold,
        requires_investigation: requiresInvestigation ? 1 : 0
      });
      
      variances.push(variance);
    }
    
    console.log(`✅ Calculated variance for ${Object.keys(ingredientUsage).length} ingredients`);
    
    // Identifică cauze posibile pentru variances mari
    const highVariances = variances.filter(v => v.requires_investigation);
    
    for (const variance of highVariances) {
      await this.suggestPossibleCauses(variance);
    }
    
    return variances;
  }
  
  /**
   * Sugerează cauze posibile pentru variance
   */
  async suggestPossibleCauses(variance) {
    const causes = [];
    
    if (variance.variance_type === 'shortage') {
      // Lipsă (mai mult consumat decât teoretic)
      causes.push('Waste (deșeuri mai mari decât estimate)');
      causes.push('Portioning inconsistent (porții mai mari)');
      causes.push('Recipe error (cantități greșite în rețetă)');
      causes.push('Theft (furt)');
      causes.push('Spillage (vărsare/pierdere)');
    } else if (variance.variance_type === 'surplus') {
      // Surplus (mai puțin consumat decât teoretic)
      causes.push('Portioning inconsistent (porții mai mici)');
      causes.push('Recipe error (cantități prea mari în rețetă)');
      causes.push('Inventory count error (eroare la inventar)');
      causes.push('Unreported usage (consum neraportat)');
    }
    
    // Update variance cu cauze posibile
    await this.updateVariance(variance.id, {
      possible_causes: JSON.stringify(causes)
    });
    
    return causes;
  }
  
  /**
   * Creează sub-recipe (rețetă componentă)
   * Ex: "Sos de roșii" este sub-recipe pentru "Pizza Margherita"
   */
  async createSubRecipe(name, ingredients, yieldQuantity, yieldUnit) {
    // Creează rețeta
    const recipe = await this.create({
      name,
      is_sub_recipe: 1,
      yield_quantity: yieldQuantity,
      yield_unit: yieldUnit
    });
    
    // Adaugă ingredientele
    for (const ing of ingredients) {
      await this.addIngredient(recipe.id, ing);
    }
    
    return recipe;
  }
  
  /**
   * Expandează rețeta (include sub-recipes)
   */
  async expandRecipe(recipeId) {
    const ingredients = await this.getIngredients(recipeId);
    const expanded = [];
    
    for (const ing of ingredients) {
      if (ing.is_sub_recipe) {
        // Expandează sub-recipe recursiv
        const subIngredients = await this.expandRecipe(ing.sub_recipe_id);
        
        // Scalează cantitățile
        subIngredients.forEach(subIng => {
          subIng.quantity_gross *= ing.quantity_net;
          subIng.quantity_net *= ing.quantity_net;
          subIng.from_sub_recipe = ing.sub_recipe_name;
        });
        
        expanded.push(...subIngredients);
      } else {
        expanded.push(ing);
      }
    }
    
    return expanded;
  }
  
  // CRUD
  async create(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      db.run(`INSERT INTO recipes (${fields}) VALUES (${placeholders})`, values, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
  
  async getIngredients(recipeId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM recipe_ingredients 
        WHERE recipe_id = ?
        ORDER BY sort_order
      `, [recipeId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async addIngredient(recipeId, ingredientData) {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO recipe_ingredients (
          recipe_id, ingredient_id, quantity_gross, quantity_net, unit
        ) VALUES (?, ?, ?, ?, ?)
      `, [recipeId, ingredientData.ingredient_id, ingredientData.quantity_gross, ingredientData.quantity_net, ingredientData.unit], function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  }
  
  // Helpers (REAL IMPLEMENTATION)
  async getOrdersByDate(date) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE DATE(timestamp) = ? AND status = 'completed'
      `, [date], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async getOrderIngredients(orderId) {
    return new Promise((resolve, reject) => {
      // Obține items din comandă
      db.get('SELECT items FROM orders WHERE id = ?', [orderId], async (err, order) => {
        if (err) return reject(err);
        if (!order) return resolve([]);
        
        try {
          const items = JSON.parse(order.items || '[]');
          const allIngredients = [];
          
          // Pentru fiecare produs din comandă
          for (const item of items) {
            const productId = item.product_id || item.id;
            
            // Găsește rețeta produsului
            const recipe = await new Promise((res, rej) => {
              db.get(`
                SELECT r.* FROM recipes r
                JOIN products p ON p.base_recipe_id = r.id
                WHERE p.id = ?
              `, [productId], (err2, row) => {
                if (err2) rej(err2);
                else res(row);
              });
            });
            
            if (recipe) {
              // Obține ingredientele rețetei
              const recipeIngredients = await new Promise((res, rej) => {
                db.all(`
                  SELECT ri.*, i.name as ingredient_name, i.unit
                  FROM recipe_ingredients ri
                  JOIN ingredients i ON i.id = ri.ingredient_id
                  WHERE ri.recipe_id = ?
                `, [recipe.id], (err3, rows) => {
                  if (err3) rej(err3);
                  else res(rows || []);
                });
              });
              
              // Adaugă la listă cu cantitatea multiplicată
              recipeIngredients.forEach(ing => {
                allIngredients.push({
                  ingredient_id: ing.ingredient_id,
                  ingredient_name: ing.ingredient_name,
                  quantity_needed: (ing.quantity_gross || ing.quantity) * item.quantity,
                  unit: ing.unit
                });
              });
            }
          }
          
          resolve(allIngredients);
          
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }
  
  async getActualUsageByDate(date, locationId) {
    return new Promise((resolve, reject) => {
      const query = locationId
        ? `SELECT 
             ingredient_id,
             SUM(ABS(quantity)) as total_quantity,
             AVG(unit_cost) as avg_cost
           FROM stock_movements
           WHERE DATE(movement_date) = ? 
             AND location_id = ?
             AND movement_type IN ('consume', 'adjustment_negative')
           GROUP BY ingredient_id`
        : `SELECT 
             ingredient_id,
             SUM(ABS(quantity)) as total_quantity,
             AVG(unit_cost) as avg_cost
           FROM stock_movements
           WHERE DATE(movement_date) = ?
             AND movement_type IN ('consume', 'adjustment_negative')
           GROUP BY ingredient_id`;
      
      const params = locationId ? [date, locationId] : [date];
      
      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async createVariance(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      db.run(`INSERT INTO stock_variance (${fields}) VALUES (${placeholders})`, values, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  }
  
  async updateVariance(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      db.run(`UPDATE stock_variance SET ${fields} WHERE id = ?`, values, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  async getCurrentVersion(recipeId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM recipe_versions 
        WHERE recipe_id = ? AND is_active = 1
        LIMIT 1
      `, [recipeId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
  
  async getVersionById(versionId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM recipe_versions WHERE id = ?', [versionId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
  
  async getIngredientCost(ingredientId, quantity, method) {
    // TODO: Implement
    return 0;
  }
}

module.exports = new RecipeService();

