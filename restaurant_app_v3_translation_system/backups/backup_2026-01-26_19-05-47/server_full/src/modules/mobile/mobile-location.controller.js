/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOBILE APP LOCATION CONTROLLER
 * 
 * Servicii bazate pe locație pentru aplicația mobilă:
 * - Găsire restaurant apropiat
 * - Verificare disponibilitate delivery
 * - Geofencing
 * - Estimare timp livrare
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');

/**
 * Calculează distanța între două coordonate (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raza Pământului în km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distanță în km
}

/**
 * GET /api/mobile/location/nearest-restaurants
 * Găsește restaurantele cele mai apropiate de locația utilizatorului
 */
async function getNearestRestaurants(req, res, next) {
  try {
    const db = await dbPromise;
    const { latitude, longitude, radius = 10 } = req.query; // radius în km
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);
    
    // Obține toate locațiile/restaurantele
    const locations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          name,
          address,
          latitude,
          longitude,
          phone,
          email,
          is_active,
          delivery_radius_km,
          delivery_enabled
        FROM locations
        WHERE is_active = 1
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculează distanța pentru fiecare locație
    const restaurantsWithDistance = locations.map(location => {
      const distance = calculateDistance(
        userLat, userLon,
        parseFloat(location.latitude), parseFloat(location.longitude)
      );
      
      return {
        ...location,
        distance_km: parseFloat(distance.toFixed(2)),
        distance_m: Math.round(distance * 1000),
        is_within_radius: distance <= radiusKm,
        delivery_available: distance <= (location.delivery_radius_km || 5) && location.delivery_enabled === 1
      };
    });
    
    // Sortează după distanță
    restaurantsWithDistance.sort((a, b) => a.distance_km - b.distance_km);
    
    // Filtrează doar cele din rază
    const restaurantsInRadius = restaurantsWithDistance.filter(r => r.is_within_radius);
    
    res.json({
      success: true,
      user_location: {
        latitude: userLat,
        longitude: userLon
      },
      radius_km: radiusKm,
      restaurants: restaurantsInRadius.map(r => ({
        id: r.id,
        name: r.name,
        address: r.address,
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
        phone: r.phone,
        email: r.email,
        distance_km: r.distance_km,
        distance_m: r.distance_m,
        delivery_available: r.delivery_available,
        delivery_radius_km: r.delivery_radius_km || 5,
        estimated_delivery_time_minutes: Math.round(r.distance_km * 2 + 15) // Estimare simplă: 2 min/km + 15 min pregătire
      })),
      total_found: restaurantsInRadius.length,
      nearest: restaurantsInRadius.length > 0 ? restaurantsInRadius[0] : null
    });
  } catch (error) {
    console.error('❌ Error in getNearestRestaurants:', error);
    next(error);
  }
}

/**
 * POST /api/mobile/location/delivery-availability
 * Verifică dacă delivery este disponibil la o adresă specifică
 */
async function checkDeliveryAvailability(req, res, next) {
  try {
    const db = await dbPromise;
    const { latitude, longitude, address, restaurant_id } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    
    // Dacă e specificat restaurant_id, verifică doar acel restaurant
    let locations;
    if (restaurant_id) {
      locations = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id,
            name,
            latitude,
            longitude,
            delivery_radius_km,
            delivery_enabled
          FROM locations
          WHERE id = ? AND is_active = 1
        `, [restaurant_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } else {
      // Altfel, verifică toate restaurantele active
      locations = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id,
            name,
            latitude,
            longitude,
            delivery_radius_km,
            delivery_enabled
          FROM locations
          WHERE is_active = 1
            AND delivery_enabled = 1
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
    
    // Verifică disponibilitate pentru fiecare restaurant
    const availability = locations.map(location => {
      const distance = calculateDistance(
        userLat, userLon,
        parseFloat(location.latitude), parseFloat(location.longitude)
      );
      
      const deliveryRadius = location.delivery_radius_km || 5;
      const isAvailable = distance <= deliveryRadius && location.delivery_enabled === 1;
      
      return {
        restaurant_id: location.id,
        restaurant_name: location.name,
        available: isAvailable,
        distance_km: parseFloat(distance.toFixed(2)),
        delivery_radius_km: deliveryRadius,
        estimated_delivery_time_minutes: isAvailable ? Math.round(distance * 2 + 15) : null,
        reason: !isAvailable 
          ? (distance > deliveryRadius ? 'Adresa este prea departe' : 'Delivery nu este activat pentru acest restaurant')
          : null
      };
    });
    
    // Găsește primul restaurant disponibil
    const availableRestaurant = availability.find(a => a.available);
    
    res.json({
      success: true,
      address: address || 'Adresă nespecificată',
      coordinates: {
        latitude: userLat,
        longitude: userLon
      },
      availability: availability,
      is_available: !!availableRestaurant,
      available_restaurant: availableRestaurant || null,
      message: availableRestaurant 
        ? `Delivery disponibil de la ${availableRestaurant.restaurant_name}`
        : 'Delivery nu este disponibil la această adresă'
    });
  } catch (error) {
    console.error('❌ Error in checkDeliveryAvailability:', error);
    next(error);
  }
}

/**
 * POST /api/mobile/location/geofence-register
 * Înregistrează un geofence pentru notificări când utilizatorul se apropie de restaurant
 */
async function registerGeofence(req, res, next) {
  try {
    const db = await dbPromise;
    const { restaurant_id, latitude, longitude, radius_meters = 500 } = req.body;
    const customerEmail = req.body.customer_email || req.user?.email;
    const customerPhone = req.body.customer_phone;
    
    if (!restaurant_id || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'restaurant_id, latitude, and longitude are required'
      });
    }
    
    if (!customerEmail && !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Customer identifier (email or phone) is required'
      });
    }
    
    // Verifică dacă restaurantul există
    const restaurant = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, latitude, longitude
        FROM locations
        WHERE id = ? AND is_active = 1
      `, [restaurant_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }
    
    // Creează sau actualizează geofence
    // Notă: Ar putea fi o tabelă separată pentru geofences în producție
    const geofenceData = {
      restaurant_id,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius_meters: parseInt(radius_meters),
      created_at: new Date().toISOString()
    };
    
    // Emite eveniment Socket.IO pentru geofence (dacă e necesar)
    if (global.io) {
      global.io.emit('geofence:registered', {
        restaurant_id,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        radius_meters: parseInt(radius_meters)
      });
    }
    
    res.json({
      success: true,
      message: 'Geofence registered successfully',
      geofence: geofenceData,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name
      }
    });
  } catch (error) {
    console.error('❌ Error in registerGeofence:', error);
    next(error);
  }
}

/**
 * GET /api/mobile/location/estimate-delivery-time
 * Estimează timpul de livrare pentru o adresă
 */
async function estimateDeliveryTime(req, res, next) {
  try {
    const { restaurant_id, latitude, longitude, address } = req.query;
    
    if (!restaurant_id || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'restaurant_id, latitude, and longitude are required'
      });
    }
    
    const db = await dbPromise;
    
    // Obține restaurantul
    const restaurant = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, latitude, longitude
        FROM locations
        WHERE id = ? AND is_active = 1
      `, [restaurant_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }
    
    // Calculează distanța
    const distance = calculateDistance(
      parseFloat(latitude), parseFloat(longitude),
      parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)
    );
    
    // Estimare timp livrare:
    // - 15 minute pregătire
    // - 2 minute/km pentru distanță
    // - +5 minute buffer
    const preparationTime = 15; // minute
    const travelTimePerKm = 2; // minute/km
    const bufferTime = 5; // minute
    const estimatedMinutes = Math.round(preparationTime + (distance * travelTimePerKm) + bufferTime);
    
    res.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name
      },
      address: address || 'Adresă nespecificată',
      distance_km: parseFloat(distance.toFixed(2)),
      estimated_delivery_time_minutes: estimatedMinutes,
      estimated_delivery_time_formatted: `${estimatedMinutes} minute`,
      breakdown: {
        preparation_time_minutes: preparationTime,
        travel_time_minutes: Math.round(distance * travelTimePerKm),
        buffer_time_minutes: bufferTime
      }
    });
  } catch (error) {
    console.error('❌ Error in estimateDeliveryTime:', error);
    next(error);
  }
}

module.exports = {
  getNearestRestaurants,
  checkDeliveryAvailability,
  registerGeofence,
  estimateDeliveryTime
};
