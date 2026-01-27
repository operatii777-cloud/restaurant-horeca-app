/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI/ML SERVICE - Integrare Prophet ML pentru predicții
 * 
 * Funcționalități:
 * - Previziuni vânzări
 * - Smart restock
 * - Forecast cashflow
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { dbPromise } = require('../../../database');

const execAsync = promisify(exec);

class AIMLService {
  /**
   * Previziuni vânzări folosind Prophet ML
   * @param {Object} options - Opțiuni pentru predicție
   * @returns {Promise<Object>} Predicții
   */
  async forecastSales(options = {}) {
    const {
      daysAhead = 14,
      historicalDays = 30,
      productId = null,
    } = options;

    try {
      const db = await dbPromise;
      
      // Obține date istorice
      const historicalData = await new Promise((resolve, reject) => {
        let query = `
          SELECT 
            DATE(timestamp) as date,
            SUM(total) as revenue,
            COUNT(*) as order_count
          FROM orders
          WHERE status IN ('paid', 'completed', 'delivered')
            AND timestamp >= datetime('now', '-' || ? || ' days')
        `;
        const params = [historicalDays];
        
        if (productId) {
          query += ` AND EXISTS (
            SELECT 1 FROM json_each(items) item
            WHERE json_extract(item.value, '$.productId') = ?
          )`;
          params.push(productId);
        }
        
        query += ` GROUP BY DATE(timestamp) ORDER BY date`;
        
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      if (historicalData.length < 7) {
        throw new Error('Insufficient historical data (minimum 7 days required)');
      }

      // Format pentru Prophet
      const prophetData = historicalData.map(row => ({
        date: row.date,
        consumption: row.revenue || 0,
      }));

      // Rulează scriptul Python
      const scriptPath = path.join(__dirname, '../../../python-scripts/stock-forecast-ml.py');
      
      if (!fs.existsSync(scriptPath)) {
        // Fallback la predicție simplă
        return this.simpleForecast(prophetData, daysAhead);
      }

      const input = JSON.stringify({
        ingredient_id: productId || 1,
        historical_data: prophetData,
        days_ahead: daysAhead,
      });

      try {
        const { stdout, stderr } = await execAsync(
          `python3 "${scriptPath}"`,
          { input, maxBuffer: 10 * 1024 * 1024 }
        );

        if (stderr && !stderr.includes('Warning')) {
          console.warn('Python script warnings:', stderr);
        }

        const result = JSON.parse(stdout);
        return {
          success: true,
          predictions: result.predictions || [],
          dates: result.dates || [],
          model_type: result.model_type || 'Prophet',
          historical_data: prophetData,
        };
      } catch (pythonError) {
        console.warn('Python script failed, using simple forecast:', pythonError.message);
        return this.simpleForecast(prophetData, daysAhead);
      }
    } catch (error) {
      console.error('❌ Error in forecastSales:', error);
      throw error;
    }
  }

  /**
   * Predicție simplă (fallback)
   */
  simpleForecast(historicalData, daysAhead) {
    if (historicalData.length === 0) {
      return {
        success: true,
        predictions: [],
        dates: [],
        model_type: 'Simple Average',
      };
    }

    // Media simplă
    const avgRevenue = historicalData.reduce((sum, row) => sum + (row.consumption || 0), 0) / historicalData.length;
    
    // Trend simplu (ultimele 7 zile vs primele 7 zile)
    const recent = historicalData.slice(-7);
    const older = historicalData.slice(0, 7);
    const recentAvg = recent.reduce((sum, row) => sum + (row.consumption || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, row) => sum + (row.consumption || 0), 0) / older.length;
    const trend = (recentAvg - olderAvg) / olderAvg; // % change

    // Predicții
    const predictions = [];
    const dates = [];
    const lastDate = new Date(historicalData[historicalData.length - 1].date);
    
    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      dates.push(futureDate.toISOString().split('T')[0]);
      
      // Aplică trend
      const predicted = avgRevenue * (1 + trend * (i / daysAhead));
      predictions.push(Math.max(0, predicted)); // Nu permite valori negative
    }

    return {
      success: true,
      predictions,
      dates,
      model_type: 'Simple Trend',
      historical_data: historicalData,
      trend_percent: (trend * 100).toFixed(2),
    };
  }

  /**
   * Smart restock - analiză inteligentă pentru restock
   */
  async smartRestock(options = {}) {
    const { days = 30, forecastDays = 14 } = options;

    try {
      const db = await dbPromise;
      
      // Obține produse best-seller
      const bestSellers = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            json_extract(item.value, '$.productId') as product_id,
            json_extract(item.value, '$.name') as product_name,
            COUNT(*) as order_count,
            SUM(json_extract(item.value, '$.quantity')) as total_quantity_sold
          FROM orders o
          CROSS JOIN json_each(o.items) item
          WHERE o.status IN ('paid', 'completed', 'delivered')
            AND o.timestamp >= datetime('now', '-' || ? || ' days')
            AND json_extract(item.value, '$.productId') IS NOT NULL
          GROUP BY json_extract(item.value, '$.productId')
          ORDER BY total_quantity_sold DESC
          LIMIT 50
        `, [days], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Pentru fiecare produs, obține stocul actual
      const restockRecommendations = await Promise.all(
        bestSellers.map(async (product) => {
          const stock = await new Promise((resolve, reject) => {
            db.get(`
              SELECT 
                SUM(CASE WHEN type = 'in' THEN quantity ELSE -quantity END) as current_stock
              FROM stock_moves
              WHERE product_id = ?
            `, [product.product_id], (err, row) => {
              if (err) reject(err);
              else resolve(row?.current_stock || 0);
            });
          });

          // Calculare consum mediu zilnic
          const avgDailyConsumption = (product.total_quantity_sold || 0) / days;
          
          // Calculare stoc necesar pentru forecastDays
          const requiredStock = avgDailyConsumption * forecastDays * 1.2; // 20% buffer
          
          // Recomandare
          const restockNeeded = requiredStock > stock;
          const restockQuantity = Math.max(0, requiredStock - stock);

          return {
            product_id: product.product_id,
            product_name: product.product_name,
            current_stock: stock,
            avg_daily_consumption: avgDailyConsumption,
            required_stock: requiredStock,
            restock_needed: restockNeeded,
            restock_quantity: Math.ceil(restockQuantity),
            priority: restockNeeded ? (restockQuantity > avgDailyConsumption * 7 ? 'HIGH' : 'MEDIUM') : 'LOW',
          };
        })
      );

      return {
        success: true,
        recommendations: restockRecommendations.filter(r => r.restock_needed),
        all_products: restockRecommendations,
      };
    } catch (error) {
      console.error('❌ Error in smartRestock:', error);
      throw error;
    }
  }

  /**
   * Forecast cashflow
   */
  async forecastCashflow(options = {}) {
    const { daysAhead = 30, historicalDays = 90 } = options;

    try {
      const db = await dbPromise;
      
      // Obține date istorice pentru cashflow
      const historicalCashflow = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            DATE(timestamp) as date,
            SUM(total) as revenue,
            COUNT(*) as order_count
          FROM orders
          WHERE status IN ('paid', 'completed', 'delivered')
            AND timestamp >= datetime('now', '-' || ? || ' days')
          GROUP BY DATE(timestamp)
          ORDER BY date
        `, [historicalDays], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Folosește forecastSales pentru predicții
      const forecast = await this.forecastSales({
        daysAhead,
        historicalDays,
      });

      // Calculare cashflow acumulat
      let cumulativeCashflow = 0;
      const cashflowForecast = forecast.predictions.map((prediction, index) => {
        cumulativeCashflow += prediction;
        return {
          date: forecast.dates[index],
          daily_revenue: prediction,
          cumulative_cashflow: cumulativeCashflow,
        };
      });

      return {
        success: true,
        forecast: cashflowForecast,
        total_forecast: cumulativeCashflow,
        historical_data: historicalCashflow,
        model_type: forecast.model_type,
      };
    } catch (error) {
      console.error('❌ Error in forecastCashflow:', error);
      throw error;
    }
  }
}

module.exports = new AIMLService();
