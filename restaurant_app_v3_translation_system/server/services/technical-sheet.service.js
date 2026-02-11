/**
 * TECHNICAL SHEET SERVICE - Business Logic pentru Fișe Tehnice
 * Data: 03 Decembrie 2025
 * Conformitate: Ordin ANSVSA 201/2022 + UE 1169/2011
 */

const { dbPromise } = require('../database');

const recipeService = require('../src/modules/recipes/recipe.service');


class TechnicalSheetService {

  /**
   * Generează fișă tehnică AUTOMAT din rețetă
   * @param {number} productId 
   * @param {number} recipeId 
   * @returns {Promise<Object>}
   */
  async generateFromRecipe(productId, recipeId) {
    // 1. Obține rețeta
    const recipe = await this.getRecipeWithIngredients(productId);

    // 2. Calculează ingrediente ordonate descrescător
    const ingredientsOrdered = this.orderIngredientsByQuantity(recipe.ingredients);

    // 3. Extrage alergeni din ingredient_catalog
    const allergens = await this.extractAllergens(recipe.ingredients);

    // 4. Extrage aditivi din ingredient_catalog
    const additives = await this.extractAdditives(recipe.ingredients);

    // 5. Calculează valori nutriționale per 100g
    const nutrition = await this.calculateNutritionalValues(recipe.ingredients, recipe.portion_size);

    // 6. Calculează cost FIFO
    const costing = await this.calculateFIFOCost(recipe.ingredients);

    // 7. Creează fișa tehnică
    return this.create({
      product_id: productId,
      recipe_id: recipeId,
      name_ro: recipe.name,
      name_en: recipe.name_en,
      category: recipe.category,
      ingredients_ordered: JSON.stringify(ingredientsOrdered),
      allergens: JSON.stringify(allergens),
      allergens_traces: JSON.stringify([]), // TODO: detect cross-contamination
      allergens_visual_markup: JSON.stringify(this.createAllergenMarkup(ingredientsOrdered, allergens)),
      additives: JSON.stringify(additives),
      portion_size_grams: recipe.portion_size || 350,
      ...nutrition,
      ...costing,
      status: 'draft'
    });
  }

  /**
   * Ordonează ingrediente descrescător după cantitate
   */
  orderIngredientsByQuantity(ingredients) {
    return ingredients
      .sort((a, b) => b.quantity_net - a.quantity_net)
      .map((ing, idx) => ({
        position: idx + 1,
        ingredient_id: ing.ingredient_id,
        name: ing.ingredient_name,
        quantity: ing.quantity_net,
        unit: ing.unit,
        is_allergen: ing.allergens && ing.allergens.length > 0,
        allergens: ing.allergens || []
      }));
  }

  /**
   * Extrage alergeni din ingrediente
   */
  async extractAllergens(ingredients) {
    const allergenSet = new Set();

    for (const ing of ingredients) {
      if (ing.allergens) {
        const allergens = JSON.parse(ing.allergens || '[]');
        allergens.forEach(a => allergenSet.add(a));
      }
    }

    return Array.from(allergenSet).sort();
  }

  /**
   * Extrage aditivi din ingrediente
   */
  async extractAdditives(ingredients) {
    const additives = [];

    for (const ing of ingredients) {
      if (ing.additives) {
        const ingAdditives = JSON.parse(ing.additives || '[]');
        additives.push(...ingAdditives);
      }
    }

    // Remove duplicates by code
    const uniqueAdditives = additives.reduce((acc, add) => {
      if (!acc.find(a => a.code === add.code)) {
        acc.push(add);
      }
      return acc;
    }, []);

    return uniqueAdditives.sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Calculează valori nutriționale per 100g
   */
  async calculateNutritionalValues(ingredients, portionSizeGrams) {
    let totals = {
      energy_kcal: 0,
      energy_kj: 0,
      protein: 0,
      carbs: 0,
      sugars: 0,
      fat: 0,
      saturated_fat: 0,
      fiber: 0,
      salt: 0
    };

    let totalWeight = 0;

    for (const ing of ingredients) {
      // Obține valori nutriționale din catalog
      const catalog = await this.getIngredientFromCatalog(ing.ingredient_id);

      if (catalog) {
        // Calculează proporțional la cantitatea folosită
        const factor = ing.quantity_net / 100; // Valorile sunt per 100g în catalog

        totals.energy_kcal += (catalog.energy_kcal || 0) * factor;
        totals.energy_kj += (catalog.energy_kj || 0) * factor;
        totals.protein += (catalog.protein || 0) * factor;
        totals.carbs += (catalog.carbs || 0) * factor;
        totals.sugars += (catalog.sugars || 0) * factor;
        totals.fat += (catalog.fat || 0) * factor;
        totals.saturated_fat += (catalog.saturated_fat || 0) * factor;
        totals.fiber += (catalog.fiber || 0) * factor;
        totals.salt += (catalog.salt || 0) * factor;
      }

      totalWeight += ing.quantity_net;
    }

    // Normalizează la 100g
    const normalizationFactor = 100 / totalWeight;

    Object.keys(totals).forEach(key => {
      totals[key] = parseFloat((totals[key] * normalizationFactor).toFixed(2));
    });

    return totals;
  }

  /**
   * Calculează cost FIFO
   */
  async calculateFIFOCost(ingredients) {
    let totalCost = 0;
    let minCost = 0;
    let maxCost = 0;

    for (const ing of ingredients) {
      // Obține cost FIFO (cele mai vechi loturi)
      const fifoCost = await this.getFIFOCostForIngredient(ing.ingredient_id, ing.quantity_net);

      totalCost += fifoCost.average;
      minCost += fifoCost.min;
      maxCost += fifoCost.max;
    }

    return {
      cost_per_portion: parseFloat(totalCost.toFixed(2)),
      cost_per_portion_min: parseFloat(minCost.toFixed(2)),
      cost_per_portion_max: parseFloat(maxCost.toFixed(2))
    };
  }

  /**
   * Creează marcaj vizual pentru alergeni
   */
  createAllergenMarkup(ingredients, allergens) {
    return ingredients
      .filter(ing => ing.is_allergen)
      .map(ing => ({
        ingredient: ing.name,
        allergen: ing.allergens[0], // Primul alergen
        position: ing.position,
        bold: true,
        color: 'red',
        uppercase: true
      }));
  }

  /**
   * Workflow aprobare - Chef
   */
  async approveByChef(techSheetId, chefName, notes) {
    const sheet = await this.getById(techSheetId);

    if (sheet.status === 'locked') {
      throw new Error('Fișa tehnică este LOCKED și nu poate fi modificată');
    }

    const updates = {
      approved_by_chef: chefName,
      approved_by_chef_at: new Date().toISOString(),
      chef_notes: notes
    };

    // Dacă și manager-ul a aprobat, schimbă status
    if (sheet.approved_by_manager) {
      updates.status = 'approved';
    }

    await this.update(techSheetId, updates);

    // Log în history
    await this.logChange(techSheetId, 'approve_chef', chefName, 'Chef approved technical sheet');

    return this.getById(techSheetId);
  }

  /**
   * Workflow aprobare - Manager
   */
  async approveByManager(techSheetId, managerName, notes) {
    const sheet = await this.getById(techSheetId);

    if (sheet.status === 'locked') {
      throw new Error('Fișa tehnică este LOCKED și nu poate fi modificată');
    }

    const updates = {
      approved_by_manager: managerName,
      approved_by_manager_at: new Date().toISOString(),
      manager_notes: notes
    };

    // Dacă și chef-ul a aprobat, schimbă status
    if (sheet.approved_by_chef) {
      updates.status = 'approved';

      // Generează PDF automat
      await this.generatePDF(techSheetId);
    }

    await this.update(techSheetId, updates);

    // Log în history
    await this.logChange(techSheetId, 'approve_manager', managerName, 'Manager approved technical sheet');

    return this.getById(techSheetId);
  }

  /**
   * Lock fișă tehnică (nu mai poate fi modificată)
   */
  async lock(techSheetId, lockedBy, reason) {
    const sheet = await this.getById(techSheetId);

    if (sheet.status !== 'approved') {
      throw new Error('Doar fișele APPROVED pot fi LOCKED');
    }

    await this.update(techSheetId, {
      status: 'locked',
      locked_at: new Date().toISOString(),
      locked_by: lockedBy,
      locked_reason: reason
    });

    // Log în history
    await this.logChange(techSheetId, 'lock', lockedBy, reason);

    return this.getById(techSheetId);
  }

  /**
   * CRUD Operations
   */
  async create(data) {
    const db = await dbPromise;
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    // database.js run returns { lastID, changes }
    const result = await db.run(`INSERT INTO technical_sheets (${fields}) VALUES (${placeholders})`, values);
    return { id: result.lastID, ...data };
  }

  async getById(id) {
    const db = await dbPromise;
    return await db.get('SELECT * FROM technical_sheets WHERE id = ?', [id]);
  }

  async update(id, updates) {
    const db = await dbPromise;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.run(`UPDATE technical_sheets SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
  }

  async logChange(techSheetId, changeType, changedBy, description) {
    const sheet = await this.getById(techSheetId);
    const db = await dbPromise;

    await db.run(`
      INSERT INTO technical_sheet_history (
        technical_sheet_id, snapshot_data, changed_by, change_type, change_description
      ) VALUES (?, ?, ?, ?, ?)
    `, [techSheetId, JSON.stringify(sheet), changedBy, changeType, description]);
  }

  // Helper methods (simplified for now)
  async getRecipeWithIngredients(recipeId) {
    const productId = recipeId;
    const { recipe, errors } = await recipeService.getValidatedRecipe(productId);

    if (!recipe) {
      throw new Error(`Recipe not found for product ${productId}. Errors: ${errors.join(', ')}`);
    }

    const db = await dbPromise;

    // Fallback for product info if missing in MasterData
    let productPoints = recipe.product;
    if (!productPoints) {
      productPoints = await db.get('SELECT * FROM products WHERE id = ?', [recipe.productId]);
    }

    // Map ingredients with fallback to DB
    const ingredients = await Promise.all(recipe.lines.map(async line => {
      let ing = line.ingredient;

      // Fallback: Fetch from Catalog/Ingredients if missing
      if (!ing) {
        // Prefer catalog for allergens info
        const catalogIng = await db.get('SELECT * FROM ingredient_catalog_global WHERE id = ?', [line.ingredientId]);
        if (catalogIng) {
          ing = catalogIng;
          // Parse allergens if they are strings (DB format)
          if (typeof ing.allergens === 'string') {
            try { ing.allergens = JSON.parse(ing.allergens); } catch (e) { ing.allergens = []; }
          }
          if (typeof ing.additives === 'string') {
            try { ing.additives = JSON.parse(ing.additives); } catch (e) { ing.additives = []; }
          }
        } else {
          // Fallback to basic ingredients table
          ing = await db.get('SELECT * FROM ingredients WHERE id = ?', [line.ingredientId]);
        }
      }

      ing = ing || {};

      return {
        ingredient_id: ing.id || line.ingredientId,
        ingredient_name: ing.name_ro || ing.name || `Ingredient ${line.ingredientId}`,
        quantity_net: line.quantityNet || line.quantity,
        unit: line.unit,
        allergens: JSON.stringify(ing.allergens || []),
        additives: JSON.stringify(ing.additives || [])
      };
    }));

    return {
      id: recipe.id,
      name: productPoints ? productPoints.name : 'Unknown Product',
      name_en: (productPoints && productPoints.name_en) || '',
      category: (productPoints && productPoints.category) || 'General',
      ingredients: ingredients,
      portion_size: recipe.yieldQuantity || 350
    };
  }

  async getIngredientFromCatalog(ingredientId) {
    const db = await dbPromise;
    return await db.get('SELECT * FROM ingredient_catalog_global WHERE id = ?', [ingredientId]);
  }

  async getFIFOCostForIngredient(ingredientId, quantity) {
    // TODO: Implement FIFO cost calculation
    return { average: 0, min: 0, max: 0 };
  }

  async generatePDF(techSheetId) {
    // TODO: Implement PDF generation
    console.log(`📄 Generating PDF for technical sheet ${techSheetId}...`);
    return true;
  }
}

module.exports = new TechnicalSheetService();

