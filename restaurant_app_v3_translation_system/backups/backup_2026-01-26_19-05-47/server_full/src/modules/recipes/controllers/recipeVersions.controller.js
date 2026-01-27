const { dbPromise } = require('../../../database');

/**
 * Get all versions for a recipe
 */
async function getRecipeVersions(req, res) {
  try {
    const { recipeId } = req.params;
    const db = await dbPromise;

    const versions = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          id,
          recipe_id,
          version_number,
          recipe_snapshot,
          changed_by,
          changed_at,
          change_description,
          change_reason,
          cost_before,
          cost_after,
          cost_difference_percentage,
          is_active
        FROM recipe_versions
        WHERE recipe_id = ?
        ORDER BY version_number DESC`,
        [recipeId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Parse JSON snapshots
    const parsedVersions = versions.map((v) => ({
      ...v,
      recipe_snapshot: JSON.parse(v.recipe_snapshot || '{}'),
      is_active: Boolean(v.is_active),
    }));

    res.json({ success: true, data: parsedVersions });
  } catch (error) {
    console.error('❌ Error getting recipe versions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get a specific version
 */
async function getRecipeVersion(req, res) {
  try {
    const { recipeId, versionNumber } = req.params;
    const db = await dbPromise;

    const version = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          id,
          recipe_id,
          version_number,
          recipe_snapshot,
          changed_by,
          changed_at,
          change_description,
          change_reason,
          cost_before,
          cost_after,
          cost_difference_percentage,
          is_active
        FROM recipe_versions
        WHERE recipe_id = ? AND version_number = ?`,
        [recipeId, versionNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    version.recipe_snapshot = JSON.parse(version.recipe_snapshot || '{}');
    version.is_active = Boolean(version.is_active);

    res.json({ success: true, data: version });
  } catch (error) {
    console.error('❌ Error getting recipe version:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Create a new version (snapshot current recipe)
 */
async function createRecipeVersion(req, res) {
  try {
    const { recipeId } = req.params;
    const { change_description, change_reason, changed_by } = req.body;
    const db = await dbPromise;

    // Get current recipe with all ingredients
    const recipe = await new Promise((resolve, reject) => {
      db.get(
        `SELECT r.*, p.name as product_name
        FROM recipes r
        JOIN catalog_products p ON r.product_id = p.id
        WHERE r.id = ?`,
        [recipeId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    // Get all ingredients for this recipe
    const ingredients = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          r.id,
          r.ingredient_id,
          r.quantity_needed,
          r.unit,
          r.waste_percentage,
          r.variable_consumption,
          r.item_type,
          i.name as ingredient_name,
          i.cost_per_unit,
          i.unit as ingredient_unit
        FROM recipes r
        LEFT JOIN ingredient_catalog_global i ON r.ingredient_id = i.id
        WHERE r.product_id = ?`,
        [recipe.product_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Calculate current cost
    let costAfter = 0;
    ingredients.forEach((ing) => {
      const quantity = ing.quantity_needed || 0;
      const cost = ing.cost_per_unit || 0;
      const waste = (ing.waste_percentage || 0) / 100;
      costAfter += quantity * cost * (1 + waste);
    });

    // Get previous version to calculate cost difference
    const previousVersion = await new Promise((resolve, reject) => {
      db.get(
        `SELECT cost_after, version_number
        FROM recipe_versions
        WHERE recipe_id = ?
        ORDER BY version_number DESC
        LIMIT 1`,
        [recipeId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const costBefore = previousVersion?.cost_after || 0;
    const costDifference = costAfter - costBefore;
    const costDifferencePercentage = costBefore > 0 ? (costDifference / costBefore) * 100 : 0;

    // Get next version number
    const maxVersion = await new Promise((resolve, reject) => {
      db.get(
        `SELECT MAX(version_number) as max_version
        FROM recipe_versions
        WHERE recipe_id = ?`,
        [recipeId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.max_version || 0);
        }
      );
    });

    const versionNumber = maxVersion + 1;

    // Create snapshot
    const snapshot = {
      recipe: {
        id: recipe.id,
        product_id: recipe.product_id,
        product_name: recipe.product_name,
        servings: recipe.servings || 1,
      },
      ingredients: ingredients.map((ing) => ({
        id: ing.id,
        ingredient_id: ing.ingredient_id,
        ingredient_name: ing.ingredient_name,
        quantity_needed: ing.quantity_needed,
        unit: ing.unit,
        waste_percentage: ing.waste_percentage,
        variable_consumption: ing.variable_consumption,
        item_type: ing.item_type,
        cost_per_unit: ing.cost_per_unit,
        ingredient_unit: ing.ingredient_unit,
      })),
      cost: {
        total: costAfter,
        per_serving: costAfter / (recipe.servings || 1),
      },
      metadata: {
        created_at: new Date().toISOString(),
        version: versionNumber,
      },
    };

    // Deactivate all previous versions
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE recipe_versions
        SET is_active = 0
        WHERE recipe_id = ?`,
        [recipeId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Insert new version
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO recipe_versions (
          recipe_id,
          version_number,
          recipe_snapshot,
          changed_by,
          change_description,
          change_reason,
          cost_before,
          cost_after,
          cost_difference_percentage,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          recipeId,
          versionNumber,
          JSON.stringify(snapshot),
          changed_by || 'system',
          change_description || '',
          change_reason || '',
          costBefore,
          costAfter,
          costDifferencePercentage,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, version_number: versionNumber });
        }
      );
    });

    res.status(201).json({
      success: true,
      data: {
        ...result,
        recipe_snapshot: snapshot,
        cost_before: costBefore,
        cost_after: costAfter,
        cost_difference_percentage: costDifferencePercentage,
      },
      message: `Version ${versionNumber} created successfully`,
    });
  } catch (error) {
    console.error('❌ Error creating recipe version:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Compare two versions
 */
async function compareRecipeVersions(req, res) {
  try {
    const { recipeId, version1, version2 } = req.params;
    const db = await dbPromise;

    const [v1, v2] = await Promise.all([
      new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM recipe_versions
          WHERE recipe_id = ? AND version_number = ?`,
          [recipeId, version1],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM recipe_versions
          WHERE recipe_id = ? AND version_number = ?`,
          [recipeId, version2],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      }),
    ]);

    if (!v1 || !v2) {
      return res.status(404).json({ success: false, error: 'One or both versions not found' });
    }

    const snapshot1 = JSON.parse(v1.recipe_snapshot || '{}');
    const snapshot2 = JSON.parse(v2.recipe_snapshot || '{}');

    // Compare ingredients
    const ingredients1 = snapshot1.ingredients || [];
    const ingredients2 = snapshot2.ingredients || [];

    const added = ingredients2.filter(
      (ing2) => !ingredients1.some((ing1) => ing1.ingredient_id === ing2.ingredient_id)
    );
    const removed = ingredients1.filter(
      (ing1) => !ingredients2.some((ing2) => ing2.ingredient_id === ing1.ingredient_id)
    );
    const modified = ingredients2.filter((ing2) => {
      const ing1 = ingredients1.find((i) => i.ingredient_id === ing2.ingredient_id);
      if (!ing1) return false;
      return (
        ing1.quantity_needed !== ing2.quantity_needed ||
        ing1.unit !== ing2.unit ||
        ing1.waste_percentage !== ing2.waste_percentage
      );
    });

    const comparison = {
      version1: {
        number: v1.version_number,
        changed_at: v1.changed_at,
        changed_by: v1.changed_by,
        cost: snapshot1.cost,
        ingredients_count: ingredients1.length,
      },
      version2: {
        number: v2.version_number,
        changed_at: v2.changed_at,
        changed_by: v2.changed_by,
        cost: snapshot2.cost,
        ingredients_count: ingredients2.length,
      },
      differences: {
        cost: {
          before: v1.cost_after,
          after: v2.cost_after,
          difference: v2.cost_after - v1.cost_after,
          percentage: v1.cost_after > 0 ? ((v2.cost_after - v1.cost_after) / v1.cost_after) * 100 : 0,
        },
        ingredients: {
          added: added.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity_needed,
            unit: ing.unit,
          })),
          removed: removed.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity_needed,
            unit: ing.unit,
          })),
          modified: modified.map((ing) => {
            const oldIng = ingredients1.find((i) => i.ingredient_id === ing.ingredient_id);
            return {
              ingredient_id: ing.ingredient_id,
              ingredient_name: ing.ingredient_name,
              old: {
                quantity: oldIng.quantity_needed,
                unit: oldIng.unit,
                waste_percentage: oldIng.waste_percentage,
              },
              new: {
                quantity: ing.quantity_needed,
                unit: ing.unit,
                waste_percentage: ing.waste_percentage,
              },
            };
          }),
        },
      },
    };

    res.json({ success: true, data: comparison });
  } catch (error) {
    console.error('❌ Error comparing recipe versions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Restore a version (rollback)
 */
async function restoreRecipeVersion(req, res) {
  try {
    const { recipeId, versionNumber } = req.params;
    const { changed_by, change_reason } = req.body;
    const db = await dbPromise;

    // Get the version to restore
    const version = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM recipe_versions
        WHERE recipe_id = ? AND version_number = ?`,
        [recipeId, versionNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    const snapshot = JSON.parse(version.recipe_snapshot || '{}');
    const ingredients = snapshot.ingredients || [];

    // Delete current recipe ingredients
    await new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM recipes WHERE product_id = ?`,
        [snapshot.recipe.product_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Restore ingredients from snapshot
    for (const ing of ingredients) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO recipes (
            product_id,
            ingredient_id,
            quantity_needed,
            unit,
            waste_percentage,
            variable_consumption,
            item_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            snapshot.recipe.product_id,
            ing.ingredient_id,
            ing.quantity_needed,
            ing.unit,
            ing.waste_percentage || 0,
            ing.variable_consumption || 0,
            ing.item_type || 'ingredient',
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Create a new version from the restored state
    const restoreResult = await createRecipeVersion(
      {
        params: { recipeId },
        body: {
          change_description: `Restored from version ${versionNumber}`,
          change_reason: change_reason || 'Rollback',
          changed_by: changed_by || 'system',
        },
      },
      res
    );

    res.json({
      success: true,
      data: restoreResult,
      message: `Recipe restored to version ${versionNumber} and saved as new version`,
    });
  } catch (error) {
    console.error('❌ Error restoring recipe version:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getRecipeVersions,
  getRecipeVersion,
  createRecipeVersion,
  compareRecipeVersions,
  restoreRecipeVersion,
};

