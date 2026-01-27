/**
 * PHASE S9.3 - Delivery ETA Service
 * 
 * ETA calculation using OSRM (Open Source Routing Machine).
 * Provides distance and duration estimates for delivery routes.
 */

const axios = require('axios');

/**
 * OSRM Configuration
 */
const OSRM_CONFIG = {
  // Default to local OSRM server
  baseUrl: process.env.OSRM_URL || 'http://localhost:5000',
  profile: process.env.OSRM_PROFILE || 'driving', // driving, walking, cycling
  timeout: 10000, // 10 seconds
};

/**
 * Compute ETA in seconds between two points
 * 
 * @param {number} originLat - Origin latitude
 * @param {number} originLng - Origin longitude
 * @param {number} destLat - Destination latitude
 * @param {number} destLng - Destination longitude
 * @returns {Promise<Object|null>} { duration_seconds, distance_meters, route } or null if failed
 */
async function computeEtaSeconds(originLat, originLng, destLat, destLng) {
  if (!originLat || !originLng || !destLat || !destLng) {
    console.warn('[DeliveryETA] Missing coordinates for ETA calculation');
    return null;
  }
  
  try {
    const url = `${OSRM_CONFIG.baseUrl}/route/v1/${OSRM_CONFIG.profile}/${originLng},${originLat};${destLng},${destLat}`;
    const params = {
      overview: 'false',
      geometries: 'geojson',
      steps: 'false',
    };
    
    const response = await axios.get(url, {
      params,
      timeout: OSRM_CONFIG.timeout,
    });
    
    const route = response.data.routes?.[0];
    
    if (!route) {
      console.warn('[DeliveryETA] No route found');
      return null;
    }
    
    return {
      duration_seconds: Math.round(route.duration),
      distance_meters: Math.round(route.distance),
      route: route.geometry,
      waypoints: response.data.waypoints || [],
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.warn('[DeliveryETA] OSRM server not available, ETA calculation skipped');
    } else {
      console.error('[DeliveryETA] Error calculating ETA:', error.message);
    }
    return null;
  }
}

/**
 * Compute ETA with fallback to straight-line distance
 * 
 * @param {number} originLat - Origin latitude
 * @param {number} originLng - Origin longitude
 * @param {number} destLat - Destination latitude
 * @param {number} destLng - Destination longitude
 * @param {number} averageSpeedKmh - Average speed in km/h (default: 30 for city)
 * @returns {Promise<Object>} ETA result
 */
async function computeEtaWithFallback(originLat, originLng, destLat, destLng, averageSpeedKmh = 30) {
  // Try OSRM first
  const osrmResult = await computeEtaSeconds(originLat, originLng, destLat, destLng);
  
  if (osrmResult) {
    return osrmResult;
  }
  
  // Fallback: Calculate straight-line distance and estimate time
  const distanceKm = calculateStraightLineDistance(originLat, originLng, destLat, destLng);
  const durationHours = distanceKm / averageSpeedKmh;
  const durationSeconds = Math.round(durationHours * 3600);
  
  return {
    duration_seconds: durationSeconds,
    distance_meters: Math.round(distanceKm * 1000),
    route: null,
    waypoints: [],
    fallback: true,
  };
}

/**
 * Calculate straight-line distance (Haversine formula)
 * 
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
function calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format ETA as human-readable string
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted string (e.g., "15 min", "1h 30min")
 */
function formatEta(seconds) {
  if (!seconds || seconds < 0) {
    return 'N/A';
  }
  
  const minutes = Math.round(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

module.exports = {
  computeEtaSeconds,
  computeEtaWithFallback,
  calculateStraightLineDistance,
  formatEta,
  OSRM_CONFIG,
};

