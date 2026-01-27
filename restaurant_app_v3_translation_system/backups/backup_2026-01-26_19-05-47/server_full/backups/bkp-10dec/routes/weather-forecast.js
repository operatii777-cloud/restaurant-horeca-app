/**
 * 🌤️ WEATHER-BASED SALES FORECASTING
 * 
 * Funcționalități:
 * - Integrare OpenWeatherMap API
 * - Corelație vânzări-vreme
 * - Predicții pe categorii (înghețate când e cald, supe când e frig)
 * - Recomandări meniu zilnic
 */

const express = require('express');
const router = express.Router();

// Obține conexiunea la DB
const getDb = () => {
  try {
    const { getDbConnection } = require('../database');
    return getDbConnection();
  } catch (e) {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '../restaurant.db');
    return new sqlite3.Database(dbPath);
  }
};

// Weather API Key (trebuie configurat în env)
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo';
const DEFAULT_CITY = 'Bucharest,RO'; // Forțat București
const DEFAULT_LAT = 44.4268; // București latitude
const DEFAULT_LON = 26.1025; // București longitude

/**
 * Helper: Convertește cod OpenWeatherMap în icon
 */
function getWeatherIcon(condition) {
  const icons = {
    'Clear': '☀️',
    'Clouds': '⛅',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  return icons[condition] || '🌤️';
}

/**
 * Helper: Categorizeaz timpul pentru corelații produse
 */
function categorizeWeather(temp, condition) {
  if (temp >= 25) return 'hot';
  if (temp <= 10) return 'cold';
  if (condition && (condition.includes('Rain') || condition.includes('Drizzle'))) return 'rainy';
  if (condition === 'Clear') return 'sunny';
  return 'normal';
}

/**
 * Categorii de produse afectate de vreme
 */
const WEATHER_PRODUCT_CORRELATIONS = {
  hot: { // Când e cald (>25°C)
    boost: ['Înghețată', 'Băuturi Reci', 'Salate', 'Sucuri', 'Smoothie', 'Gelato', 'Limonadă'],
    reduce: ['Supe', 'Ciorbe', 'Tocănițe', 'Ceai Cald', 'Ciocolată Caldă'],
    boostMultiplier: 1.4,
    reduceMultiplier: 0.6,
  },
  cold: { // Când e frig (<10°C)
    boost: ['Supe', 'Ciorbe', 'Tocănițe', 'Ceai Cald', 'Ciocolată Caldă', 'Vin Fiert', 'Grătare'],
    reduce: ['Înghețată', 'Băuturi Reci', 'Salate', 'Smoothie', 'Gelato'],
    boostMultiplier: 1.5,
    reduceMultiplier: 0.5,
  },
  rainy: { // Când plouă
    boost: ['Delivery', 'Comfort Food', 'Supe', 'Deserturi'],
    reduce: ['Terasă', 'Grătar'],
    boostMultiplier: 1.3,
    reduceMultiplier: 0.7,
  },
  sunny: { // Însorit
    boost: ['Terasă', 'Grătar', 'Băuturi Reci', 'Bere'],
    reduce: [],
    boostMultiplier: 1.2,
    reduceMultiplier: 1.0,
  },
};

/**
 * GET /api/weather-forecast/current
 * Obține vremea curentă
 */
router.get('/current', async (req, res) => {
  const { city = DEFAULT_CITY } = req.query;
  
  try {
    let weatherData;
    
    // Încearcă să obții date reale de la OpenWeatherMap
    if (WEATHER_API_KEY !== 'demo') {
      try {
        const fetch = require('node-fetch');
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=ro`);
        const data = await response.json();
        
        if (data && data.main) {
          weatherData = {
            city: 'București',
            temperature: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: getWeatherIcon(data.weather[0].main),
            wind_speed: Math.round(data.wind.speed * 3.6), // m/s to km/h
            condition: data.weather[0].main.toLowerCase(),
            category: categorizeWeather(data.main.temp, data.weather[0].main),
            correlations: WEATHER_PRODUCT_CORRELATIONS[categorizeWeather(data.main.temp, data.weather[0].main)]
          };
        }
      } catch (apiError) {
        console.log('⚠️ Weather API error, using demo data:', apiError.message);
      }
    }
    
    // Fallback la demo data dacă API nu funcționează
    if (!weatherData) {
      weatherData = {
        city: 'București',
        temperature: 22,
        feels_like: 24,
        humidity: 65,
        description: 'Parțial înnorat',
        icon: '⛅',
        wind_speed: 12,
      condition: 'partly_cloudy',
      timestamp: new Date().toISOString(),
    };
    
    // Determină categoria de vreme
    let weatherCategory = 'normal';
    if (weatherData.temperature >= 25) weatherCategory = 'hot';
    else if (weatherData.temperature <= 10) weatherCategory = 'cold';
    if (weatherData.condition && weatherData.condition.includes('rain')) weatherCategory = 'rainy';
    if (weatherData.condition === 'clear') weatherCategory = 'sunny';
    
    res.json({
      success: true,
      weather: {
        ...weatherData,
        category: weatherCategory,
        correlations: WEATHER_PRODUCT_CORRELATIONS[weatherCategory] || {},
      },
      isRealData: weatherData.source && weatherData.source.includes('Live'),
      note: weatherData.source || 'Demo mode - configurați OPENWEATHER_API_KEY pentru date reale',
    });
    
  } catch (error) {
    console.error('❌ Weather API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/weather-forecast/predictions
 * Predicții vânzări bazate pe vreme
 */
router.get('/predictions', async (req, res) => {
  const db = getDb();
  const { temperature = 22, condition = 'normal' } = req.query;
  
  try {
    // Obține categoriile de produse
    const categoriesQuery = `
      SELECT DISTINCT category FROM menu WHERE is_active = 1
    `;
    
    const categories = await new Promise((resolve, reject) => {
      db.all(categoriesQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Obține vânzările medii pe categorie
    const salesQuery = `
      SELECT 
        m.category,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_qty,
        AVG(oi.quantity) as avg_qty_per_order,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM order_items oi
      JOIN menu m ON oi.product_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= DATE('now', '-30 days')
        AND o.status != 'cancelled'
      GROUP BY m.category
    `;
    
    const salesData = await new Promise((resolve, reject) => {
      db.all(salesQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Determină categoria de vreme
    const temp = parseFloat(temperature);
    let weatherCategory = 'normal';
    if (temp >= 25) weatherCategory = 'hot';
    else if (temp <= 10) weatherCategory = 'cold';
    if (condition.includes('rain')) weatherCategory = 'rainy';
    if (condition === 'clear' || condition === 'sunny') weatherCategory = 'sunny';
    
    const correlations = WEATHER_PRODUCT_CORRELATIONS[weatherCategory] || {
      boost: [], reduce: [], boostMultiplier: 1, reduceMultiplier: 1,
    };

    // Aplică multiplicatori
    const predictions = salesData.map(cat => {
      let multiplier = 1;
      let trend = 'stable';
      
      const categoryLower = (cat.category || '').toLowerCase();
      
      if (correlations.boost.some(b => categoryLower.includes(b.toLowerCase()))) {
        multiplier = correlations.boostMultiplier;
        trend = 'increase';
      } else if (correlations.reduce.some(r => categoryLower.includes(r.toLowerCase()))) {
        multiplier = correlations.reduceMultiplier;
        trend = 'decrease';
      }
      
      return {
        category: cat.category,
        baseline_orders: cat.order_count,
        baseline_revenue: parseFloat(cat.total_revenue || 0).toFixed(2),
        predicted_multiplier: multiplier,
        predicted_orders: Math.round(cat.order_count * multiplier),
        predicted_revenue: (cat.total_revenue * multiplier).toFixed(2),
        trend,
        trend_icon: trend === 'increase' ? '📈' : trend === 'decrease' ? '📉' : '➡️',
        recommendation: trend === 'increase' 
          ? 'Pregătiți stoc suplimentar' 
          : trend === 'decrease' 
            ? 'Reduceți porțiile pregătite' 
            : 'Mențineți nivelul normal',
      };
    });

    res.json({
      success: true,
      weather: {
        temperature: temp,
        condition,
        category: weatherCategory,
      },
      predictions: predictions.sort((a, b) => b.predicted_multiplier - a.predicted_multiplier),
      recommendations: {
        boost_categories: correlations.boost,
        reduce_categories: correlations.reduce,
        general_tip: getWeatherTip(weatherCategory),
      },
    });
    
  } catch (error) {
    console.error('❌ Weather Predictions Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/weather-forecast/history
 * Istoricul corelației vânzări-vreme
 */
router.get('/history', async (req, res) => {
  const db = getDb();
  const { days = 30 } = req.query;
  
  try {
    // Obține datele de vânzări pe zile
    const query = `
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as order_count,
        SUM(o.total) as daily_revenue,
        strftime('%w', o.created_at) as day_of_week
      FROM orders o
      WHERE o.created_at >= DATE('now', '-${parseInt(days)} days')
        AND o.status NOT IN ('cancelled', 'draft')
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `;
    
    const history = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Adaugă date simulate de vreme (în producție, ar fi stocate în DB)
    const historyWithWeather = history.map(row => ({
      ...row,
      daily_revenue: parseFloat(row.daily_revenue || 0).toFixed(2),
      weather_temp: 15 + Math.random() * 20, // Simulat
      weather_condition: ['sunny', 'cloudy', 'rainy', 'partly_cloudy'][Math.floor(Math.random() * 4)],
      is_weekend: ['0', '6'].includes(row.day_of_week),
    }));

    res.json({
      success: true,
      period_days: parseInt(days),
      history: historyWithWeather,
      note: 'Date de vreme simulate - configurați weather_data table pentru istoric real',
    });
    
  } catch (error) {
    console.error('❌ Weather History Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper: Obține tip bazat pe vreme
 */
function getWeatherTip(category) {
  const tips = {
    hot: '☀️ Vreme caldă: Promovați băuturile reci și înghețata! Reduceți producția de supe.',
    cold: '❄️ Vreme rece: Promovați supele calde și băuturile fierbinți! Comenzi de delivery crescute.',
    rainy: '🌧️ Ploaie: Așteptați-vă la mai multe comenzi de delivery. Promovați comfort food.',
    sunny: '☀️ Însorit: Pregătiți terasa! Vânzări crescute la băuturi și grătar.',
    normal: '🌤️ Vreme normală: Mențineți producția standard.',
  };
  return tips[category] || tips.normal;
}

module.exports = router;

