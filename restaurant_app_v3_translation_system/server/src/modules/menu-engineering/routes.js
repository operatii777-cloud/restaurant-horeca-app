/**
 * Menu Engineering Module
 * 
 * Provides menu analysis with correct Contribution Margin calculation.
 * 
 * Formula: CM = (Selling Price - Taxes/TVA) - Real Food Cost
 * 
 * Classification:
 * - STAR: High popularity, High profitability
 * - PUZZLE: Low popularity, High profitability  
 * - PLOWHORSE: High popularity, Low profitability
 * - DOG: Low popularity, Low profitability
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');

// Default VAT rate in Romania
const DEFAULT_VAT_RATE = 0.21; // 21%

/**
 * GET /api/menu-engineering/analysis
 * 
 * Menu engineering analysis with correct CM formula
 */
router.get('/analysis', async (req, res) => {
  try {
    const db = await dbPromise;
    const { 
      startDate, 
      endDate, 
      category,
      vatRate = DEFAULT_VAT_RATE 
    } = req.query;
    
    // Default to last 30 days
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateStart = startDate || thirtyDaysAgo;
    const dateEnd = endDate || today;
    
    // Get sales data with recipe costs
    const salesData = await new Promise((resolve, reject) => {
      let query = `
        SELECT 
          m.id,
          m.name,
          m.category,
          m.price as selling_price,
          COALESCE(SUM(oi.quantity), 0) as quantity_sold,
          COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
          COALESCE(recipe_cost.cost, 0) as food_cost
        FROM menu m
        LEFT JOIN order_items oi ON m.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('paid', 'completed', 'delivered')
          AND DATE(o.timestamp) >= DATE(?)
          AND DATE(o.timestamp) <= DATE(?)
        LEFT JOIN (
          SELECT 
            r.product_id,
            SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0) * (1 + COALESCE(r.waste_percentage, 0) / 100.0)) as cost
          FROM recipes r
          LEFT JOIN ingredients i ON r.ingredient_id = i.id
          WHERE r.ingredient_id IS NOT NULL
          GROUP BY r.product_id
        ) recipe_cost ON m.id = recipe_cost.product_id
        WHERE m.is_active = 1
      `;
      
      const params = [dateStart, dateEnd];
      
      if (category) {
        query += ' AND m.category = ?';
        params.push(category);
      }
      
      query += ' GROUP BY m.id ORDER BY total_revenue DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculate averages for classification thresholds
    const totalItems = salesData.length;
    const totalQuantitySold = salesData.reduce((sum, item) => sum + item.quantity_sold, 0);
    const avgQuantitySold = totalItems > 0 ? totalQuantitySold / totalItems : 0;
    
    // Calculate Contribution Margin for each item
    // CM = (Selling Price - VAT) - Food Cost
    const vatMultiplier = parseFloat(vatRate);
    
    const analysisResults = salesData.map(item => {
      // Price without VAT
      const priceWithoutVat = item.selling_price / (1 + vatMultiplier);
      
      // Contribution Margin = Price without VAT - Food Cost
      const contributionMargin = priceWithoutVat - item.food_cost;
      
      // Contribution Margin % (relative to price without VAT)
      const cmPercentage = priceWithoutVat > 0 
        ? (contributionMargin / priceWithoutVat) * 100 
        : 0;
      
      // Total contribution from sales
      const totalContribution = contributionMargin * item.quantity_sold;
      
      // Food Cost % (relative to selling price with VAT - industry standard display)
      const foodCostPercentage = item.selling_price > 0 
        ? (item.food_cost / item.selling_price) * 100 
        : 0;
      
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        selling_price: Math.round(item.selling_price * 100) / 100,
        price_without_vat: Math.round(priceWithoutVat * 100) / 100,
        food_cost: Math.round(item.food_cost * 100) / 100,
        contribution_margin: Math.round(contributionMargin * 100) / 100,
        cm_percentage: Math.round(cmPercentage * 100) / 100,
        food_cost_percentage: Math.round(foodCostPercentage * 100) / 100,
        quantity_sold: item.quantity_sold,
        total_revenue: Math.round(item.total_revenue * 100) / 100,
        total_contribution: Math.round(totalContribution * 100) / 100
      };
    });
    
    // Calculate average CM for classification
    const avgCM = analysisResults.length > 0
      ? analysisResults.reduce((sum, item) => sum + item.contribution_margin, 0) / analysisResults.length
      : 0;
    
    // Classify items using BCG Matrix (Menu Engineering Matrix)
    const classifiedResults = analysisResults.map(item => {
      const isHighPopularity = item.quantity_sold >= avgQuantitySold;
      const isHighProfitability = item.contribution_margin >= avgCM;
      
      let classification;
      let color;
      let recommendation;
      
      if (isHighPopularity && isHighProfitability) {
        classification = 'STAR';
        color = '#22c55e'; // Green
        recommendation = 'Maintain quality, consider slight price increase';
      } else if (!isHighPopularity && isHighProfitability) {
        classification = 'PUZZLE';
        color = '#eab308'; // Yellow
        recommendation = 'Increase visibility, improve marketing, reposition on menu';
      } else if (isHighPopularity && !isHighProfitability) {
        classification = 'PLOWHORSE';
        color = '#3b82f6'; // Blue
        recommendation = 'Reduce food cost, increase price, or re-engineer recipe';
      } else {
        classification = 'DOG';
        color = '#ef4444'; // Red
        recommendation = 'Consider removing from menu or complete overhaul';
      }
      
      return {
        ...item,
        classification,
        color,
        recommendation,
        is_high_popularity: isHighPopularity,
        is_high_profitability: isHighProfitability
      };
    });
    
    // Summary statistics
    const summary = {
      period: { start: dateStart, end: dateEnd },
      vat_rate: vatMultiplier,
      total_items: totalItems,
      total_revenue: Math.round(classifiedResults.reduce((sum, i) => sum + i.total_revenue, 0) * 100) / 100,
      total_contribution: Math.round(classifiedResults.reduce((sum, i) => sum + i.total_contribution, 0) * 100) / 100,
      avg_quantity_sold: Math.round(avgQuantitySold * 100) / 100,
      avg_contribution_margin: Math.round(avgCM * 100) / 100,
      classification_counts: {
        star: classifiedResults.filter(i => i.classification === 'STAR').length,
        puzzle: classifiedResults.filter(i => i.classification === 'PUZZLE').length,
        plowhorse: classifiedResults.filter(i => i.classification === 'PLOWHORSE').length,
        dog: classifiedResults.filter(i => i.classification === 'DOG').length
      },
      thresholds: {
        popularity: avgQuantitySold,
        profitability: avgCM
      }
    };
    
    // Get top performers
    const topByRevenue = [...classifiedResults].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);
    const topByMargin = [...classifiedResults].sort((a, b) => b.contribution_margin - a.contribution_margin).slice(0, 5);
    const bottomPerformers = classifiedResults.filter(i => i.classification === 'DOG').slice(0, 5);
    
    res.json({
      success: true,
      data: {
        items: classifiedResults,
        summary,
        insights: {
          top_by_revenue: topByRevenue,
          top_by_margin: topByMargin,
          bottom_performers: bottomPerformers
        }
      }
    });
    
  } catch (error) {
    console.error('Error in menu engineering analysis:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/menu-engineering/matrix
 * 
 * Returns data formatted for the Menu Engineering Matrix visualization
 */
router.get('/matrix', async (req, res) => {
  try {
    // Reuse analysis endpoint logic but format for chart
    const analysisUrl = `${req.protocol}://${req.get('host')}/api/menu-engineering/analysis?${new URLSearchParams(req.query).toString()}`;
    
    // For simplicity, just call the analysis and reformat
    const { default: axios } = await import('axios');
    const response = await axios.get(analysisUrl);
    
    if (!response.data.success) {
      return res.json(response.data);
    }
    
    const items = response.data.data.items;
    const thresholds = response.data.data.summary.thresholds;
    
    // Format for scatter plot
    const matrixData = items.map(item => ({
      x: item.quantity_sold, // Popularity (X-axis)
      y: item.contribution_margin, // Profitability (Y-axis)
      name: item.name,
      category: item.category,
      classification: item.classification,
      color: item.color,
      size: Math.max(10, Math.min(50, item.total_revenue / 100)) // Bubble size based on revenue
    }));
    
    res.json({
      success: true,
      data: {
        points: matrixData,
        thresholds: {
          x: thresholds.popularity,
          y: thresholds.profitability
        },
        quadrants: {
          star: { label: 'STAR', color: '#22c55e', description: 'High Popularity, High Margin' },
          puzzle: { label: 'PUZZLE', color: '#eab308', description: 'Low Popularity, High Margin' },
          plowhorse: { label: 'PLOWHORSE', color: '#3b82f6', description: 'High Popularity, Low Margin' },
          dog: { label: 'DOG', color: '#ef4444', description: 'Low Popularity, Low Margin' }
        }
      }
    });
    
  } catch (error) {
    console.error('Error in menu engineering matrix:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/menu-engineering/recommendations
 * 
 * Get actionable recommendations based on analysis
 */
router.get('/recommendations', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Get items with issues
    const issues = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          m.id,
          m.name,
          m.category,
          m.price as selling_price,
          COALESCE(recipe_cost.cost, 0) as food_cost,
          CASE 
            WHEN m.price > 0 THEN COALESCE(recipe_cost.cost, 0) / m.price * 100
            ELSE 0 
          END as food_cost_percentage
        FROM menu m
        LEFT JOIN (
          SELECT r.product_id, SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0)) as cost
          FROM recipes r LEFT JOIN ingredients i ON r.ingredient_id = i.id
          WHERE r.ingredient_id IS NOT NULL GROUP BY r.product_id
        ) recipe_cost ON m.id = recipe_cost.product_id
        WHERE m.is_active = 1
        AND COALESCE(recipe_cost.cost, 0) / NULLIF(m.price, 0) * 100 > 35
        ORDER BY food_cost_percentage DESC
        LIMIT 20
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const recommendations = issues.map(item => ({
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      current_food_cost_percentage: Math.round(item.food_cost_percentage * 100) / 100,
      target_food_cost_percentage: 30,
      priority: item.food_cost_percentage > 50 ? 'HIGH' : item.food_cost_percentage > 40 ? 'MEDIUM' : 'LOW',
      actions: [
        `Reduce food cost from ${Math.round(item.food_cost * 100) / 100} to ${Math.round(item.selling_price * 0.30 * 100) / 100}`,
        `Or increase price from ${item.selling_price} to ${Math.round(item.food_cost / 0.30 * 100) / 100}`,
        'Review recipe for cheaper ingredient alternatives',
        'Consider portion size adjustment'
      ]
    }));
    
    res.json({
      success: true,
      data: {
        high_priority: recommendations.filter(r => r.priority === 'HIGH'),
        medium_priority: recommendations.filter(r => r.priority === 'MEDIUM'),
        low_priority: recommendations.filter(r => r.priority === 'LOW'),
        total_issues: recommendations.length
      }
    });
    
  } catch (error) {
    console.error('Error in menu engineering recommendations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;

