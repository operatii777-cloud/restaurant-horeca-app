/**
 * RECIPE SCALING ROUTES - API pentru scalare rețete
 * Data: 03 Decembrie 2025
 */

const express = require('express');
const router = express.Router();
const RecipeService = require('../services/recipe.service');

// POST /api/recipes/:id/scale
router.post('/:id/scale', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const { targetPortions } = req.body;
    
    if (!targetPortions || targetPortions < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'targetPortions must be >= 1' 
      });
    }
    
    const scaled = await RecipeService.scaleRecipe(recipeId, targetPortions);
    
    res.json({ success: true, data: scaled });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

