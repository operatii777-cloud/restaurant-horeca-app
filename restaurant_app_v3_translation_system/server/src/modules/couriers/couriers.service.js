/**
 * S17.A - Couriers Service
 * Business logic for courier management
 * Extends existing courier functionality
 */

const { dbPromise } = require('../../../database');

/**
 * Get available couriers for assignment
 * Returns couriers that are online and their current load
 */
async function getAvailableCouriers({ area } = {}) {
  const db = await dbPromise;
  
  // Get online couriers
  let query = `
    SELECT 
      c.id,
      c.name,
      c.phone,
      c.code,
      c.email,
      c.status,
      c.vehicle_type,
      c.current_lat,
      c.current_lng,
      c.last_location_update,
      COUNT(da.id) as currentLoad
    FROM couriers c
    LEFT JOIN delivery_assignments da ON c.id = da.courier_id 
      AND da.status IN ('assigned', 'accepted', 'picked_up', 'in_transit')
    WHERE c.is_active = 1 
      AND (c.status = 'online' OR c.status = 'idle')
    GROUP BY c.id
    ORDER BY currentLoad ASC, c.name ASC
  `;
  
  const params = [];
  
  // TODO: Filter by area if provided (requires area/zone logic)
  // if (area) {
  //   query += ` AND c.area = ?`;
  //   params.push(area);
  // }
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const couriers = rows.map(row => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          code: row.code,
          email: row.email,
          status: row.status,
          vehicleType: row.vehicle_type,
          currentLoad: row.currentLoad || 0,
          lastLocation: row.current_lat && row.current_lng ? {
            lat: row.current_lat,
            lng: row.current_lng,
            updatedAt: row.last_location_update
          } : null
        }));
        resolve(couriers);
      }
    });
  });
}

module.exports = {
  getAvailableCouriers
};

