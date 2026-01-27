/**
 * 🌤️ WEATHER-BASED SALES FORECASTING
 * 
 * Funcționalități:
 * - Integrare Open-Meteo API (gratuit, fără API key)
 * - Corelație vânzări-vreme
 * - Predicții pe categorii (înghețate când e cald, supe când e frig)
 * - Recomandări meniu zilnic
 * 
 * Open-Meteo: https://open-meteo.com/
 */

const express = require('express');
const router = express.Router();

// Obține conexiunea la DB
const { dbPromise } = require('../database');

const getDb = async () => {
  return await dbPromise;
};

// Open-Meteo API (gratuit, fără API key necesar)
const DEFAULT_CITY = 'București, RO';
const DEFAULT_LAT = 44.4268; // București latitude
const DEFAULT_LON = 26.1025; // București longitude
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Helper: Convertește cod weathercode Open-Meteo în condiție
 */
function getWeatherConditionFromCode(code) {
  // Open-Meteo weathercode: https://open-meteo.com/en/docs
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Clouds';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code >= 85 && code <= 86) return 'Snow';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clouds';
}

/**
 * Helper: Convertește condiție în icon
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
  // Obține coordonatele din query sau din setări salvate
  let lat = req.query.lat ? parseFloat(req.query.lat) : null;
  let lon = req.query.lon ? parseFloat(req.query.lon) : null;
  let city = req.query.city || null;
  
  // Dacă nu sunt în query, încarcă din setări
  if (!lat || !lon) {
    try {
      const db = await getDb();
      const settings = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            weather_latitude as lat,
            weather_longitude as lon,
            weather_city as city
          FROM restaurant_settings
          WHERE id = 1
        `, [], (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
      
      if (settings) {
        lat = settings.lat || DEFAULT_LAT;
        lon = settings.lon || DEFAULT_LON;
        city = settings.city || DEFAULT_CITY;
      } else {
        lat = DEFAULT_LAT;
        lon = DEFAULT_LON;
        city = DEFAULT_CITY;
      }
    } catch (error) {
      // Fallback la default
      lat = lat || DEFAULT_LAT;
      lon = lon || DEFAULT_LON;
      city = city || DEFAULT_CITY;
    }
  }
  
  try {
    let weatherData;
    let isRealData = false;
    
    // Obține date reale de la Open-Meteo (gratuit, fără API key)
    try {
      // Use built-in fetch (Node.js 18+) or https module
      let fetch;
      try {
        fetch = require('node-fetch');
      } catch (e) {
        // Node.js 18+ has built-in fetch
        fetch = global.fetch || (async (url) => {
          const https = require('https');
          return new Promise((resolve, reject) => {
            https.get(url, (res) => {
              let data = '';
              res.on('data', (chunk) => data += chunk);
              res.on('end', () => {
                try {
                  resolve({ json: () => JSON.parse(data), ok: res.statusCode === 200 });
                } catch (e) {
                  reject(e);
                }
              });
            }).on('error', reject);
          });
        });
      }
      
      const url = `${OPEN_METEO_BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe/Bucharest`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.current) {
        const current = data.current;
        const temp = Math.round(current.temperature_2m);
        const condition = getWeatherConditionFromCode(current.weather_code);
        
        weatherData = {
          city: DEFAULT_CITY,
          temperature: temp,
          feels_like: temp, // Open-Meteo nu oferă "feels_like", folosim temperatura reală
          humidity: Math.round(current.relative_humidity_2m),
          description: condition === 'Clear' ? 'Senin' : 
                       condition === 'Clouds' ? 'Înnorat' :
                       condition === 'Rain' ? 'Ploaie' :
                       condition === 'Snow' ? 'Zăpadă' :
                       condition === 'Thunderstorm' ? 'Furtună' : 'Parțial înnorat',
          icon: getWeatherIcon(condition),
          wind_speed: Math.round(current.wind_speed_10m * 3.6), // m/s to km/h
          condition: condition.toLowerCase(),
          category: categorizeWeather(temp, condition),
          correlations: WEATHER_PRODUCT_CORRELATIONS[categorizeWeather(temp, condition)],
          source: 'Live Open-Meteo API',
          timestamp: new Date().toISOString()
        };
        isRealData = true;
      }
    } catch (apiError) {
      console.log('⚠️ Open-Meteo API error, using demo data:', apiError.message);
    }
    
    // Fallback la demo data dacă API nu funcționează
    if (!weatherData) {
      weatherData = {
        city: DEFAULT_CITY,
        temperature: 22,
        feels_like: 24,
        humidity: 65,
        description: 'Parțial înnorat',
        icon: '⛅',
        wind_speed: 12,
        condition: 'partly_cloudy',
        timestamp: new Date().toISOString(),
        source: 'Demo mode'
      };
    }
    
    // Determină categoria de vreme
    let weatherCategory = 'normal';
    if (weatherData.temperature >= 25) weatherCategory = 'hot';
    else if (weatherData.temperature <= 10) weatherCategory = 'cold';
    if (weatherData.condition && weatherData.condition.includes('rain')) weatherCategory = 'rainy';
    if (weatherData.condition === 'clear' || weatherData.condition === 'sunny') weatherCategory = 'sunny';
    
    res.json({
      success: true,
      weather: {
        ...weatherData,
        category: weatherCategory,
        correlations: WEATHER_PRODUCT_CORRELATIONS[weatherCategory] || {},
      },
      isRealData: isRealData,
      note: isRealData ? 'Date meteo reale de la Open-Meteo (gratuit)' : 'Demo mode - verifică conexiunea la internet',
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
  const { temperature = 22, condition = 'normal' } = req.query;
  
  try {
    const db = await getDb();
    
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
      WHERE o.timestamp >= DATE('now', '-30 days')
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
  const { days = 30 } = req.query;
  
  try {
    const db = await getDb();
    
    // Obține datele de vânzări pe zile
    const query = `
      SELECT 
        DATE(o.timestamp) as date,
        COUNT(DISTINCT o.id) as order_count,
        SUM(o.total) as daily_revenue,
        strftime('%w', o.timestamp) as day_of_week
      FROM orders o
      WHERE DATE(o.timestamp) >= DATE('now', '-' || ? || ' days')
        AND o.status NOT IN ('cancelled', 'draft')
      GROUP BY DATE(o.timestamp)
      ORDER BY date ASC
    `;
    
    const history = await new Promise((resolve, reject) => {
      db.all(query, [parseInt(days)], (err, rows) => {
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

/**
 * GET /api/weather-forecast/settings
 * Obține setările de locație pentru weather forecast
 */
router.get('/settings', async (req, res) => {
  try {
    const db = await getDb();
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS restaurant_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          weather_latitude REAL,
          weather_longitude REAL,
          weather_city TEXT
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Obține setările din baza de date (sau folosește default)
    const settings = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          weather_latitude as lat,
          weather_longitude as lon,
          weather_city as city
        FROM restaurant_settings
        WHERE id = 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
    
    // Dacă nu există setări, returnează default
    if (!settings || (!settings.lat && !settings.lon)) {
      return res.json({
        success: true,
        settings: {
          lat: DEFAULT_LAT,
          lon: DEFAULT_LON,
          city: DEFAULT_CITY
        }
      });
    }
    
    res.json({
      success: true,
      settings: {
        lat: settings.lat || DEFAULT_LAT,
        lon: settings.lon || DEFAULT_LON,
        city: settings.city || DEFAULT_CITY
      }
    });
  } catch (error) {
    console.error('❌ Error getting weather settings:', error);
    // Returnează default dacă există eroare
    res.json({
      success: true,
      settings: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        city: DEFAULT_CITY
      }
    });
  }
});

/**
 * POST /api/weather-forecast/settings
 * Salvează setările de locație pentru weather forecast
 */
router.post('/settings', async (req, res) => {
  try {
    const { lat, lon, city } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitudinea și longitudinea sunt obligatorii'
      });
    }
    
    const db = await getDb();
    
    // Creează tabela dacă nu există
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS restaurant_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          weather_latitude REAL,
          weather_longitude REAL,
          weather_city TEXT
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Adaugă coloanele dacă nu există (ignoră erorile dacă există deja)
    try {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE restaurant_settings ADD COLUMN weather_latitude REAL`, (err) => {
          if (err && !err.message.includes('duplicate column')) reject(err);
          else resolve();
        });
      });
    } catch (e) {}
    
    try {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE restaurant_settings ADD COLUMN weather_longitude REAL`, (err) => {
          if (err && !err.message.includes('duplicate column')) reject(err);
          else resolve();
        });
      });
    } catch (e) {}
    
    try {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE restaurant_settings ADD COLUMN weather_city TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) reject(err);
          else resolve();
        });
      });
    } catch (e) {}
    
    // Salvează setările
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO restaurant_settings (id, weather_latitude, weather_longitude, weather_city)
        VALUES (1, ?, ?, ?)
      `, [parseFloat(lat), parseFloat(lon), city || DEFAULT_CITY], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      message: 'Setările au fost salvate cu succes',
      settings: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        city: city || DEFAULT_CITY
      }
    });
  } catch (error) {
    console.error('❌ Error saving weather settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

