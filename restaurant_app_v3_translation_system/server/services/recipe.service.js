/**
 * RECIPE SERVICE - Complete Recipe Management
 * Data: 03 Decembrie 2025
 * Include: Scaling, Sub-recipes, Version Control
 */

const db = require('../config/database');

class RecipeService {
  
  /**
   * Recipe Scaling - Scalează rețeta pentru N porții
   * @param {number} recipeId 
   * @param {number} targetPortions - Număr porții dorit
   * @returns {Promise<Object>} Rețetă scalată
   */
  async scaleRecipe(recipeId, targetPortions) {
    const recipe = await this.getById(recipeId);
    const ingredients = await this.getIngredients(recipeId);
    
    const basePortions = recipe.base_portions || 1;
    const scaleFactor = targetPortions / basePortions;
    
    const scaledIngredients = ingredients.map(ing => ({
      ...ing,
      quantity_gross_scaled: ing.quantity_gross * scaleFactor,
      quantity_net_scaled: ing.quantity_net * scaleFactor
    }));
    
    // Recalculează cost
    const scaledCost = (recipe.cost_per_portion || 0) * targetPortions;
    
    return {
      ...recipe,
      target_portions: targetPortions,
      scale_factor: scaleFactor,
      ingredients: scaledIngredients,
      total_cost: scaledCost
    };
  }
  
  /**
   * Sub-recipes - Rețetă în rețetă (ex: sos de roșii în pizza)
   * FIX: Folosește ingredient_id pentru a stoca sub_recipe_id
   */
  async addSubRecipe(parentRecipeId, subRecipeId, quantity, unit) {
    // Adaugă sub-recipe ca ingredient special
    // Folosim ingredient_id = -subRecipeId pentru a marca că e sub-recipe
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO recipe_ingredients (
          recipe_id, ingredient_id,
          quantity_gross, quantity_net, unit
        ) VALUES (?, ?, ?, ?, ?)
      `, [parentRecipeId, -subRecipeId, quantity, quantity, unit], function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, sub_recipe_id: subRecipeId });
      });
    });
  }
  
  /**
   * Calculează cost rețetă (inclusiv sub-recipes)
   */
  async calculateTotalCost(recipeId, method = 'FIFO') {
    const ingredients = await this.getIngredients(recipeId);
    let totalCost = 0;
    
    for (const ing of ingredients) {
      if (ing.is_sub_recipe) {
        // Calculează cost sub-recipe recursiv
        const subRecipeCost = await this.calculateTotalCost(ing.sub_recipe_id, method);
        totalCost += subRecipeCost * ing.quantity_net;
      } else {
        // Cost ingredient normal (FIFO/LIFO/Average)
        const ingCost = await this.getIngredientCost(ing.ingredient_id, ing.quantity_net, method);
        totalCost += ingCost;
      }
    }
    
    return totalCost;
  }
  
  /**
   * Version Control - Creează versiune nouă
   */
  async createVersion(recipeId, changedBy, changeDescription, changeReason) {
    const recipe = await this.getById(recipeId);
    const ingredients = await this.getIngredients(recipeId);
    
    // Calculează cost înainte
    const costBefore = await this.calculateTotalCost(recipeId);
    
    // Obține numărul versiunii curente
    const currentVersion = await this.getCurrentVersion(recipeId);
    const newVersionNumber = (currentVersion?.version_number || 0) + 1;
    
    // Creează snapshot
    const snapshot = {
      recipe,
      ingredients,
      cost: costBefore,
      timestamp: new Date().toISOString()
    };
    
    // Salvează versiunea
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO recipe_versions (
          recipe_id, version_number, recipe_snapshot,
          changed_by, change_description, change_reason,
          cost_before, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        recipeId, newVersionNumber, JSON.stringify(snapshot),
        changedBy, changeDescription, changeReason,
        costBefore
      ], function(err) {
        if (err) return reject(err);
        
        // Dezactivează versiunea veche
        db.run(`
          UPDATE recipe_versions 
          SET is_active = 0 
          WHERE recipe_id = ? AND id != ?
        `, [recipeId, this.lastID], (err2) => {
          if (err2) console.error('Error deactivating old version:', err2);
        });
        
        resolve({ id: this.lastID, version_number: newVersionNumber });
      });
    });
  }
  
  /**
   * Restore versiune veche
   */
  async restoreVersion(versionId) {
    const version = await this.getVersionById(versionId);
    const snapshot = JSON.parse(version.recipe_snapshot);
    
    // Restaurează datele din snapshot
    await this.update(snapshot.recipe.id, snapshot.recipe);
    
    // Șterge ingredientele curente
    await this.deleteIngredients(snapshot.recipe.id);
    
    // Restaurează ingredientele din snapshot
    for (const ing of snapshot.ingredients) {
      await this.addIngredient(snapshot.recipe.id, ing);
    }
    
    console.log(`✅ Restored recipe ${snapshot.recipe.id} to version ${version.version_number}`);
    
    return snapshot.recipe;
  }
  
  // CRUD
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
        SELECT ri.*, i.name as ingredient_name, i.unit as ingredient_unit
        FROM recipe_ingredients ri
        LEFT JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE ri.recipe_id = ?
        ORDER BY ri.sort_order
      `, [recipeId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      db.run(`UPDATE recipes SET ${fields} WHERE id = ?`, values, (err) => {
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
        ORDER BY version_number DESC LIMIT 1
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
    // TODO: Implement FIFO/LIFO/Average cost calculation
    return 0;
  }
  
  async deleteIngredients(recipeId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipeId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  async addIngredient(recipeId, ingredientData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(ingredientData).join(', ');
      const placeholders = Object.keys(ingredientData).map(() => '?').join(', ');
      const values = Object.values(ingredientData);
      
      db.run(`INSERT INTO recipe_ingredients (recipe_id, ${fields}) VALUES (?, ${placeholders})`, [recipeId, ...values], function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  }
}

module.exports = new RecipeService();

