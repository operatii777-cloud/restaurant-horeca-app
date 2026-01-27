/**
 * S17.H - Delivery KPI Controller
 */

const deliveryKpiService = require('./deliveryKpi.service');

async function getDeliveryOverview(req, res, next) {
  try {
    const { dbPromise } = require('../../../database');
    
    // Verifică dacă DB este gata cu timeout
    let db;
    try {
      db = await Promise.race([
        dbPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
      ]);
    } catch (dbError) {
      console.warn('⚠️ [getDeliveryOverview] Database not ready:', dbError.message);
      return res.json({
        success: true,
        data: {
          totalDeliveries: 0,
          avgDeliveryMinutes: 0,
          onTimeRate: 0,
          totalRevenue: 0
        }
      });
    }
    
    const { dateFrom, dateTo, locationId } = req.query;
    // Pass req for automatic location filtering
    const overview = await deliveryKpiService.getDeliveryOverview({ dateFrom, dateTo, locationId }, req);
    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('❌ [getDeliveryOverview] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        totalDeliveries: 0,
        avgDeliveryMinutes: 0,
        onTimeRate: 0,
        totalRevenue: 0
      }
    });
  }
}

async function getDeliveryByCourier(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query;
    const couriers = await deliveryKpiService.getDeliveryByCourier({ dateFrom, dateTo });
    res.json({ success: true, data: couriers });
  } catch (error) {
    next(error);
  }
}

async function getDeliveryTimeseries(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query;
    const timeseries = await deliveryKpiService.getDeliveryTimeseries({ dateFrom, dateTo });
    res.json({ success: true, data: timeseries });
  } catch (error) {
    next(error);
  }
}

async function getDeliveryHourlyHeatmap(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query;
    const heatmap = await deliveryKpiService.getDeliveryHourlyHeatmap({ dateFrom, dateTo });
    res.json({ success: true, data: heatmap });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDeliveryOverview,
  getDeliveryByCourier,
  getDeliveryTimeseries,
  getDeliveryHourlyHeatmap
};

