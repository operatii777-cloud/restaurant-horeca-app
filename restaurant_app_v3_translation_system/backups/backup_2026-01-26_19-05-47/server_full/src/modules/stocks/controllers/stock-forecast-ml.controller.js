/**
 * Stock Forecast ML Controller
 * 
 * Endpoint-uri pentru predicții ML avansate de stoc
 * Folosește Python (Prophet) pentru predicții mai precise decât media simplă
 */

const { executePythonScript, checkPythonAvailable, scriptExists } = require('../../../utils/python-executor');
const { logger } = require('../../../utils/logger');
const { asyncHandler } = require('../../../utils/asyncHandler');
const { dbPromise } = require('../../../../database');

/**
 * Helper: Extrage date istorice pentru un ingredient
 */
async function getHistoricalConsumption(ingredientId, days = 180) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        DATE(date) as date,
        SUM(ABS(quantity_out)) as consumption
      FROM stock_moves
      WHERE ingredient_id = ?
        AND type = 'CONSUME'
        AND quantity_out > 0
        AND date >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(date)
      ORDER BY date ASC
    `, [ingredientId, days], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * GET /api/stocks/:id/forecast-ml
 * Predicție ML pentru un ingredient specific
 * 
 * Query params:
 *   - days_ahead: Număr zile pentru predicție (default: 14)
 *   - historical_days: Număr zile istorice pentru training (default: 180)
 */
async function getIngredientForecastML(req, res) {
  try {
    const { id } = req.params;
    const { days_ahead = 14, historical_days = 180 } = req.query;
    
    const ingredientId = parseInt(id);
    const daysAhead = parseInt(days_ahead);
    const historicalDays = parseInt(historical_days);
    
    if (!ingredientId) {
      return res.status(400).json({
        success: false,
        error: 'ID ingredient invalid'
      });
    }
    
    // Verifică dacă Python este disponibil
    const isAvailable = await checkPythonAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        error: 'Python nu este disponibil. Instalează Python 3.11+ pentru predicții ML.',
        fallback: 'Folosește endpoint-ul standard /api/reports/stock-prediction pentru predicții simple'
      });
    }
    
    // Verifică dacă scriptul există
    if (!scriptExists('stock-forecast-ml.py')) {
      return res.status(404).json({
        success: false,
        error: 'Script Python nu există. Verifică că stock-forecast-ml.py este în python-scripts/'
      });
    }
    
    // Extrage date istorice
    const historicalData = await getHistoricalConsumption(ingredientId, historicalDays);
    
    if (historicalData.length < 7) {
      return res.status(400).json({
        success: false,
        error: `Date insuficiente pentru predicție ML. Minim 7 zile necesare, găsite ${historicalData.length} zile.`,
        suggestion: 'Așteaptă mai multe zile de consum înainte de a folosi predicții ML.'
      });
    }
    
    // Obține informații ingredient
    const db = await dbPromise;
    const ingredient = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, unit, current_stock, min_stock, cost_per_unit
        FROM ingredients
        WHERE id = ?
      `, [ingredientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        error: 'Ingredient nu a fost găsit'
      });
    }
    
    // Execută scriptul Python
    const forecast = await executePythonScript(
      'stock-forecast-ml.py',
      [],
      {
        ingredient_id: ingredientId,
        historical_data: historicalData,
        days_ahead: daysAhead
      },
      { timeout: 60000 } // 60 secunde pentru ML
    );
    
    // Calculează predicții pentru stoc
    const currentStock = ingredient.current_stock || 0;
    const minStock = ingredient.min_stock || 0;
    const totalPredictedConsumption = forecast.total_predicted_consumption || 
      forecast.forecast.predictions.reduce((sum, p) => sum + (typeof p === 'number' ? p : 0), 0);
    
    const predictedStock = currentStock - totalPredictedConsumption;
    
    // Zile până la stoc minim
    const avgDailyPredicted = forecast.avg_predicted_daily || totalPredictedConsumption / daysAhead;
    const daysUntilMin = avgDailyPredicted > 0 
      ? Math.max(0, Math.floor((currentStock - minStock) / avgDailyPredicted))
      : 999;
    
    // Recomandare
    let recommendation = 'OK';
    if (predictedStock < 0) {
      recommendation = 'URGENT: Comandă imediată necesară';
    } else if (predictedStock < minStock) {
      recommendation = 'Recomandat: Comandă în următoarele zile';
    } else if (daysUntilMin < 7) {
      recommendation = 'Monitorizare: Stoc scăzut în apropierea minimului';
    }
    
    logger.info('Stock ML forecast generated', {
      ingredient_id: ingredientId,
      days_ahead: daysAhead,
      model_type: forecast.forecast?.model_type || 'unknown'
    });
    
    res.json({
      success: true,
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        current_stock: currentStock,
        min_stock: minStock
      },
      forecast: {
        ...forecast.forecast,
        days_ahead: daysAhead
      },
      predictions: {
        total_predicted_consumption: totalPredictedConsumption,
        predicted_stock: predictedStock,
        days_until_min_stock: daysUntilMin,
        avg_daily_predicted: avgDailyPredicted,
        recommendation: recommendation
      },
      historical_data_count: historicalData.length,
      model_info: {
        type: forecast.forecast?.model_type || 'unknown',
        accuracy: forecast.forecast?.accuracy_metrics || null,
        trend: forecast.forecast?.trend || null
      }
    });
    
  } catch (error) {
    logger.error('Stock ML forecast error', {
      error: error.message,
      stack: error.stack,
      ingredient_id: req.params.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * GET /api/stocks/forecast-ml/batch
 * Predicții ML pentru multiple ingrediente (batch processing)
 * 
 * Query params:
 *   - days_ahead: Număr zile pentru predicție (default: 14)
 *   - ingredient_ids: Coma-separated IDs (opțional, altfel toate ingredientele)
 *   - limit: Limită număr ingrediente (default: 50)
 */
async function getBatchForecastML(req, res) {
  try {
    const { days_ahead = 14, ingredient_ids, limit = 50 } = req.query;
    
    // Verifică Python
    const isAvailable = await checkPythonAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        error: 'Python nu este disponibil pentru predicții ML'
      });
    }
    
    const db = await dbPromise;
    
    // Obține ingrediente
    let ingredientsQuery = `
      SELECT id, name, unit, current_stock, min_stock
      FROM ingredients
      WHERE current_stock IS NOT NULL
        AND is_hidden = 0
    `;
    
    const queryParams = [];
    if (ingredient_ids) {
      const ids = ingredient_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (ids.length > 0) {
        ingredientsQuery += ` AND id IN (${ids.map(() => '?').join(',')})`;
        queryParams.push(...ids);
      }
    }
    
    ingredientsQuery += ` LIMIT ?`;
    queryParams.push(parseInt(limit));
    
    const ingredients = await new Promise((resolve, reject) => {
      db.all(ingredientsQuery, queryParams, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Predicții pentru primele 10 ingrediente (pentru demo, batch complet ar dura prea mult)
    const predictions = [];
    const maxConcurrent = 10;
    
    for (let i = 0; i < Math.min(ingredients.length, maxConcurrent); i++) {
      const ingredient = ingredients[i];
      
      try {
        const historicalData = await getHistoricalConsumption(ingredient.id, 180);
        
        if (historicalData.length >= 7) {
          const forecast = await executePythonScript(
            'stock-forecast-ml.py',
            [],
            {
              ingredient_id: ingredient.id,
              historical_data: historicalData,
              days_ahead: parseInt(days_ahead)
            },
            { timeout: 30000 }
          );
          
          const totalPredicted = forecast.total_predicted_consumption || 0;
          const predictedStock = (ingredient.current_stock || 0) - totalPredicted;
          
          predictions.push({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            current_stock: ingredient.current_stock || 0,
            predicted_consumption: totalPredicted,
            predicted_stock: predictedStock,
            model_type: forecast.forecast?.model_type || 'unknown'
          });
        }
      } catch (error) {
        logger.warn('Failed to forecast ingredient', {
          ingredient_id: ingredient.id,
          error: error.message
        });
        // Continuă cu următorul ingredient
      }
    }
    
    res.json({
      success: true,
      total_ingredients: ingredients.length,
      forecasted: predictions.length,
      days_ahead: parseInt(days_ahead),
      predictions: predictions
    });
    
  } catch (error) {
    logger.error('Batch ML forecast error', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/stocks/forecast-ml/compare
 * Compară predicția ML cu predicția simplă (media)
 * 
 * Query params:
 *   - ingredient_id: ID ingredient (obligatoriu)
 *   - days_ahead: Număr zile (default: 14)
 */
async function compareForecasts(req, res) {
  try {
    const { ingredient_id, days_ahead = 14 } = req.query;
    
    if (!ingredient_id) {
      return res.status(400).json({
        success: false,
        error: 'ingredient_id este obligatoriu'
      });
    }
    
    const db = await dbPromise;
    
    // Predicție simplă (media actuală)
    const simpleForecast = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COALESCE(AVG(daily_consumption), 0) as avg_daily_consumption
        FROM (
          SELECT 
            DATE(date) as date,
            SUM(ABS(quantity_out)) as daily_consumption
          FROM stock_moves
          WHERE ingredient_id = ?
            AND type = 'CONSUME'
            AND date >= datetime('now', '-30 days')
          GROUP BY DATE(date)
        )
      `, [ingredient_id], (err, row) => {
        if (err) reject(err);
        else resolve(row?.avg_daily_consumption || 0);
      });
    });
    
    const totalSimplePrediction = simpleForecast * parseInt(days_ahead);
    
    // Predicție ML (dacă e disponibil)
    let mlForecast = null;
    const isPythonAvailable = await checkPythonAvailable();
    
    if (isPythonAvailable && scriptExists('stock-forecast-ml.py')) {
      try {
        const historicalData = await getHistoricalConsumption(parseInt(ingredient_id), 180);
        
        if (historicalData.length >= 7) {
          mlForecast = await executePythonScript(
            'stock-forecast-ml.py',
            [],
            {
              ingredient_id: parseInt(ingredient_id),
              historical_data: historicalData,
              days_ahead: parseInt(days_ahead)
            },
            { timeout: 60000 }
          );
        }
      } catch (error) {
        logger.warn('ML forecast failed in compare', { error: error.message });
      }
    }
    
    res.json({
      success: true,
      ingredient_id: parseInt(ingredient_id),
      days_ahead: parseInt(days_ahead),
      simple_forecast: {
        method: 'Average (30 days)',
        avg_daily_consumption: simpleForecast,
        total_predicted_consumption: totalSimplePrediction
      },
      ml_forecast: mlForecast ? {
        method: mlForecast.forecast?.model_type || 'ML',
        total_predicted_consumption: mlForecast.total_predicted_consumption || 0,
        avg_daily_predicted: mlForecast.avg_predicted_daily || 0,
        accuracy_metrics: mlForecast.forecast?.accuracy_metrics || null
      } : null,
      comparison: mlForecast ? {
        difference: mlForecast.total_predicted_consumption - totalSimplePrediction,
        difference_percent: ((mlForecast.total_predicted_consumption - totalSimplePrediction) / totalSimplePrediction * 100).toFixed(2) + '%',
        ml_available: true
      } : {
        ml_available: false,
        message: 'ML forecast not available'
      }
    });
    
  } catch (error) {
    logger.error('Compare forecasts error', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getIngredientForecastML: asyncHandler(getIngredientForecastML),
  getBatchForecastML: asyncHandler(getBatchForecastML),
  compareForecasts: asyncHandler(compareForecasts)
};

