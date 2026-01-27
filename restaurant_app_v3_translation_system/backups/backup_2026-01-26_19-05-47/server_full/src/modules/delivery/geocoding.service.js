/**
 * FAZA 2.D - Geocoding Service
 * 
 * Converts delivery addresses to lat/lng coordinates using Nominatim (OpenStreetMap)
 */

const axios = require('axios');

const NOMINATIM_CONFIG = {
  baseUrl: 'https://nominatim.openstreetmap.org',
  timeout: 10000,
  userAgent: 'RestaurantAppV3/1.0', // Required by Nominatim
};

/**
 * Geocode an address to lat/lng
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    return null;
  }
  
  try {
    const response = await axios.get(`${NOMINATIM_CONFIG.baseUrl}/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        countrycodes: 'ro', // Limit to Romania
      },
      headers: {
        'User-Agent': NOMINATIM_CONFIG.userAgent,
      },
      timeout: NOMINATIM_CONFIG.timeout,
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Geocoding] Error geocoding address:', error.message);
    return null;
  }
}

/**
 * Geocode and save coordinates for an order
 */
async function geocodeAndSaveOrder(orderId, address) {
  const { dbPromise } = require('../../../database');
  const db = await dbPromise;
  
  // Check if already geocoded
  const order = await new Promise((resolve, reject) => {
    db.get(
      'SELECT delivery_lat, delivery_lng FROM orders WHERE id = ?',
      [orderId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  if (order && order.delivery_lat && order.delivery_lng) {
    return { lat: order.delivery_lat, lng: order.delivery_lng, cached: true };
  }
  
  // Geocode address
  const coords = await geocodeAddress(address);
  
  if (coords) {
    // Save to database
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET delivery_lat = ?, delivery_lng = ? WHERE id = ?',
        [coords.lat, coords.lng, orderId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    return { lat: coords.lat, lng: coords.lng, cached: false };
  }
  
  return null;
}

module.exports = {
  geocodeAddress,
  geocodeAndSaveOrder,
};

