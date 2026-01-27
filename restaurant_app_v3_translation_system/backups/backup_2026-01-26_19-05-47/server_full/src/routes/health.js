/**
 * ENTERPRISE MODULE - Health Check Routes
 * 
 * Extended health checks for monitoring and Kubernetes readiness/liveness probes
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../database');
const { asyncHandler } = require('../utils/anti-blocking');
const { getSystemStatus: getAntiBlockingStatus } = require('../loaders/antiBlocking.loader');
const MonitoringService = require('../modules/monitoring/monitoring.service');

/**
 * GET /health
 * Extended health check with detailed system information
 */
router.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };
  
  // Database check
  try {
    const db = await dbPromise;
    const startTime = Date.now();
    await new Promise((resolve, reject) => {
      db.get('SELECT 1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    const dbTime = Date.now() - startTime;
    
    health.checks.database = {
      status: 'ok',
      responseTime: `${dbTime}ms`
    };
  } catch (err) {
    health.status = 'error';
    health.checks.database = {
      status: 'error',
      message: err.message
    };
  }
  
  // Memory check
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  const rssMB = memUsage.rss / 1024 / 1024;
  
  // Warning if heap used > 500MB
  const memoryStatus = heapUsedMB > 500 ? 'warning' : 'ok';
  if (memoryStatus === 'warning') {
    health.status = health.status === 'ok' ? 'warning' : health.status;
  }
  
  health.checks.memory = {
    status: memoryStatus,
    heapUsed: `${heapUsedMB.toFixed(2)} MB`,
    heapTotal: `${heapTotalMB.toFixed(2)} MB`,
    rss: `${rssMB.toFixed(2)} MB`,
    external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`
  };
  
  // CPU check (optional - basic info)
  const cpuUsage = process.cpuUsage();
  health.checks.cpu = {
    status: 'ok',
    user: `${(cpuUsage.user / 1000).toFixed(2)} ms`,
    system: `${(cpuUsage.system / 1000).toFixed(2)} ms`
  };
  
  // Node.js version
  health.checks.nodejs = {
    status: 'ok',
    version: process.version,
    platform: process.platform,
    arch: process.arch
  };
  
  // Environment variables check (basic)
  health.checks.config = {
    status: 'ok',
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
    corsOrigin: process.env.CORS_ORIGIN || '*',
    nodeEnv: process.env.NODE_ENV || 'development'
  };
  
  // Add anti-blocking system status
  try {
    const antiBlockingStatus = getAntiBlockingStatus();
    health.antiBlocking = antiBlockingStatus;
  } catch (err) {
    health.antiBlocking = {
      status: 'error',
      message: err.message
    };
  }
  
  // Add extended monitoring
  try {
    const monitoringHealth = await MonitoringService.getHealthStatus();
    health.monitoring = monitoringHealth;
    
    // Update overall status based on monitoring
    if (monitoringHealth.status === 'critical') {
      health.status = 'error';
    } else if (monitoringHealth.status === 'warning' && health.status === 'ok') {
      health.status = 'warning';
    }
  } catch (err) {
    health.monitoring = {
      status: 'error',
      message: err.message
    };
  }
  
  // Set HTTP status based on overall health
  const httpStatus = health.status === 'ok' ? 200 : health.status === 'warning' ? 200 : 503;
  
  res.status(httpStatus).json(health);
}));

/**
 * GET /ready
 * Readiness probe (Kubernetes compatible)
 * Returns 200 if server is ready to accept traffic
 */
router.get('/ready', asyncHandler(async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Check database connection
    await new Promise((resolve, reject) => {
      db.get('SELECT 1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      ready: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * GET /live
 * Liveness probe (Kubernetes compatible)
 * Returns 200 if server process is alive
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/anti-blocking/status
 * Get anti-blocking system status
 */
router.get('/api/anti-blocking/status', asyncHandler(async (req, res) => {
  const status = getAntiBlockingStatus();
  res.json({
    success: true,
    data: status
  });
}));

/**
 * GET /api/monitoring/health
 * Extended monitoring health check
 */
router.get('/api/monitoring/health', asyncHandler(async (req, res) => {
  const health = await MonitoringService.getHealthStatus();
  res.json({
    success: true,
    data: health
  });
}));

/**
 * GET /api/monitoring/alerts
 * Get monitoring alerts
 */
router.get('/api/monitoring/alerts', asyncHandler(async (req, res) => {
  const alerts = await MonitoringService.checkAlerts();
  res.json({
    success: true,
    alerts: alerts
  });
}));

module.exports = router;

