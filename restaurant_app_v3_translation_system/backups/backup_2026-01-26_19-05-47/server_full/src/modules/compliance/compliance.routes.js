/**
 * Compliance Routes
 * Includes: Equipment, Temperature Logs, Cleaning Schedule, Maintenance, HACCP
 */

const express = require('express');
const router = express.Router();
const controller = require('./compliance.controller');

// ==================== EQUIPMENT CRUD ====================
// GET /api/compliance/equipment
router.get('/equipment', controller.getEquipment);

// POST /api/compliance/equipment/populate-template (MUST be before :id route!)
router.post('/equipment/populate-template', controller.populateEquipmentTemplate);

// POST /api/compliance/equipment
router.post('/equipment', controller.createEquipment);

// ==================== DASHBOARD KPIs ====================
// GET /api/compliance/dashboard/kpis (general compliance KPIs - separate from HACCP)
// MUST be before :id routes to avoid '/dashboard' being matched as an ID
router.get('/dashboard/kpis', controller.getComplianceDashboardKPIs);

// GET /api/compliance/equipment/:id
router.get('/equipment/:id', controller.getEquipmentById);

// PUT /api/compliance/equipment/:id
router.put('/equipment/:id', controller.updateEquipment);

// DELETE /api/compliance/equipment/:id
router.delete('/equipment/:id', controller.deleteEquipment);

// ==================== CLEANING & MAINTENANCE ====================
// GET /api/compliance/cleaning-schedule
router.get('/cleaning-schedule', controller.getCleaningSchedule);
// POST /api/compliance/cleaning-schedule
router.post('/cleaning-schedule', controller.createOrUpdateCleaningSchedule);

// GET /api/compliance/equipment-maintenance
router.get('/equipment-maintenance', controller.getEquipmentMaintenance);

// POST /api/compliance/equipment-maintenance
router.post('/equipment-maintenance', controller.createOrUpdateEquipmentMaintenance);

// GET /api/compliance/temperature-log
router.get('/temperature-log', controller.getTemperatureLogs);
// POST /api/compliance/temperature-log
router.post('/temperature-log', controller.createTemperatureLog);

// ==================== HACCP Routes ====================

// GET /api/compliance/haccp - Root HACCP endpoint (returns summary/overview)
router.get('/haccp', async (req, res) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    // Get HACCP processes
    const processes = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM haccp_processes WHERE is_active = 1 ORDER BY process_name', [], (err, rows) => {
        if (err && !err.message.includes('no such table')) reject(err);
        else resolve(rows || []);
      });
    }).catch(() => []);
    
    // Get HACCP monitoring (temperature logs and checks)
    const monitoring = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM haccp_monitoring 
        ORDER BY monitored_at DESC 
        LIMIT 100
      `, [], (err, rows) => {
        if (err && !err.message.includes('no such table')) reject(err);
        else resolve(rows || []);
      });
    }).catch(() => []);
    
    // Get corrective actions
    const correctiveActions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM haccp_corrective_actions 
        WHERE resolved = 0 
        ORDER BY created_at DESC 
        LIMIT 50
      `, [], (err, rows) => {
        if (err && !err.message.includes('no such table')) reject(err);
        else resolve(rows || []);
      });
    }).catch(() => []);
    
    // Get temperature logs (from compliance_temperature_logs or haccp_monitoring)
    const temperatureLogs = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM compliance_temperature_logs 
        ORDER BY logged_at DESC 
        LIMIT 100
      `, [], (err, rows) => {
        if (err && !err.message.includes('no such table')) {
          // Try alternative table
          db.all('SELECT * FROM haccp_monitoring WHERE parameter_name LIKE "%temperature%" ORDER BY monitored_at DESC LIMIT 100', [], (err2, rows2) => {
            if (err2) resolve([]);
            else resolve(rows2 || []);
          });
        } else {
          resolve(rows || []);
        }
      });
    }).catch(() => []);
    
    res.json({
      success: true,
      data: {
        processes: processes || [],
        monitoring: monitoring || [],
        corrective_actions: correctiveActions || [],
        temperature_logs: temperatureLogs || [],
        checks: monitoring || [],
        summary: {
          processes_count: processes.length || 0,
          monitoring_count: monitoring.length || 0,
          corrective_actions_count: correctiveActions.length || 0,
          temperature_logs_count: temperatureLogs.length || 0
        }
      },
      message: 'HACCP compliance data retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting HACCP data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        processes: [],
        monitoring: [],
        corrective_actions: [],
        temperature_logs: [],
        checks: [],
        summary: {
          processes_count: 0,
          monitoring_count: 0,
          corrective_actions_count: 0,
          temperature_logs_count: 0
        }
      }
    });
  }
});

// POST /api/compliance/haccp/populate-template (MUST be before dynamic routes!)
router.post('/haccp/populate-template', controller.populateHaccpTemplate);

// GET /api/compliance/haccp/processes
router.get('/haccp/processes', controller.getHaccpProcesses);

// GET /api/compliance/haccp/processes/:processId/ccps
router.get('/haccp/processes/:processId/ccps', controller.getHaccpCCPs);

// GET /api/compliance/haccp/ccps/:ccpId/limits
router.get('/haccp/ccps/:ccpId/limits', controller.getHaccpLimits);

// POST /api/compliance/haccp/monitoring
router.post('/haccp/monitoring', controller.recordHaccpMonitoring);

// GET /api/compliance/haccp/monitoring
router.get('/haccp/monitoring', controller.getHaccpMonitoring);

// GET /api/compliance/haccp/dashboard/kpis
router.get('/haccp/dashboard/kpis', controller.getHaccpDashboardKPIs);

// GET /api/compliance/haccp/corrective-actions
router.get('/haccp/corrective-actions', controller.getAllCorrectiveActions);
// POST /api/compliance/haccp/corrective-actions
router.post('/haccp/corrective-actions', controller.createHaccpCorrectiveAction);

// PUT /api/compliance/haccp/corrective-actions/:actionId/resolve
router.put('/haccp/corrective-actions/:actionId/resolve', controller.resolveHaccpCorrectiveAction);

module.exports = router;
