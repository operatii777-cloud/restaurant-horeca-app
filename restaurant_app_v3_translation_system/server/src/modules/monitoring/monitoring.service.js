/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MONITORING SERVICE
 * 
 * Monitoring și health checks:
 * - Uptime server
 * - Disk space
 * - Memory usage
 * - Performance (response time)
 * - Database health
 * ═══════════════════════════════════════════════════════════════════════════
 */

const os = require('os');
const fs = require('fs');
const { dbPromise } = require('../../../database');

class MonitoringService {
  constructor() {
    this.startTime = Date.now();
    this.responseTimes = []; // Store last 100 response times
    this.maxResponseTimes = 100;
  }

  /**
   * Get server uptime
   */
  getUptime() {
    const uptimeMs = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);

    return {
      milliseconds: uptimeMs,
      seconds: uptimeSeconds,
      minutes: uptimeMinutes,
      hours: uptimeHours,
      days: uptimeDays,
      formatted: `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
    };
  }

  /**
   * Get disk space (Windows)
   */
  async getDiskSpace() {
    try {
      // For Windows, we'll use a simple check
      // In production, you might want to use a library like 'node-disk-info'
      const stats = fs.statSync(process.cwd());
      
      // Get free memory as a proxy (not perfect, but works)
      const freeMemory = os.freemem();
      const totalMemory = os.totalmem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      return {
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usage_percent: memoryUsagePercent,
          status: memoryUsagePercent > 90 ? 'critical' : memoryUsagePercent > 75 ? 'warning' : 'ok'
        },
        // Note: Disk space requires additional libraries for accurate measurement
        disk: {
          status: 'ok', // Placeholder
          note: 'Disk space monitoring requires additional setup'
        }
      };
    } catch (error) {
      console.error('❌ [MONITORING] Error getting disk space:', error);
      return {
        memory: { status: 'error', error: error.message },
        disk: { status: 'error', error: error.message }
      };
    }
  }

  /**
   * Get database health
   */
  async getDatabaseHealth() {
    try {
      const db = await dbPromise;
      const startTime = Date.now();
      
      // Simple query to check DB responsiveness
      await new Promise((resolve, reject) => {
        db.get('SELECT 1 as health', [], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const responseTime = Date.now() - startTime;
      
      // Get table count
      const tableCount = await new Promise((resolve, reject) => {
        db.get(`
          SELECT COUNT(*) as count 
          FROM sqlite_master 
          WHERE type='table'
        `, [], (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        });
      });
      
      return {
        status: 'healthy',
        response_time_ms: responseTime,
        table_count: tableCount,
        status_level: responseTime > 2000 ? 'slow' : responseTime > 1000 ? 'warning' : 'ok'
      };
    } catch (error) {
      console.error('❌ [MONITORING] Error checking database health:', error);
      return {
        status: 'error',
        error: error.message,
        status_level: 'critical'
      };
    }
  }

  /**
   * Record response time
   */
  recordResponseTime(responseTime) {
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift(); // Remove oldest
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    if (this.responseTimes.length === 0) {
      return {
        avg_response_time: 0,
        min_response_time: 0,
        max_response_time: 0,
        status: 'no_data'
      };
    }

    const avg = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    const min = Math.min(...this.responseTimes);
    const max = Math.max(...this.responseTimes);

    return {
      avg_response_time: Math.round(avg),
      min_response_time: min,
      max_response_time: max,
      sample_count: this.responseTimes.length,
      status: avg > 2000 ? 'slow' : avg > 1000 ? 'warning' : 'ok'
    };
  }

  /**
   * Get complete health status
   */
  async getHealthStatus() {
    const uptime = this.getUptime();
    const diskSpace = await this.getDiskSpace();
    const dbHealth = await this.getDatabaseHealth();
    const performance = this.getPerformanceMetrics();

    // Determine overall status
    const statuses = [
      diskSpace.memory.status,
      dbHealth.status_level,
      performance.status
    ];

    let overallStatus = 'healthy';
    if (statuses.includes('critical')) {
      overallStatus = 'critical';
    } else if (statuses.includes('warning') || statuses.includes('slow')) {
      overallStatus = 'warning';
    }

    return {
      status: overallStatus,
      uptime: uptime,
      memory: diskSpace.memory,
      disk: diskSpace.disk,
      database: dbHealth,
      performance: performance,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check for alerts
   */
  async checkAlerts() {
    const health = await this.getHealthStatus();
    const alerts = [];

    // Memory alert
    if (health.memory.usage_percent > 90) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        severity: 'critical',
        message: `Memory usage is ${health.memory.usage_percent.toFixed(1)}%`,
        data: health.memory
      });
    } else if (health.memory.usage_percent > 75) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        severity: 'warning',
        message: `Memory usage is ${health.memory.usage_percent.toFixed(1)}%`,
        data: health.memory
      });
    }

    // Database alert
    if (health.database.status_level === 'slow') {
      alerts.push({
        type: 'SLOW_DATABASE',
        severity: 'warning',
        message: `Database response time is ${health.database.response_time_ms}ms`,
        data: health.database
      });
    }

    // Performance alert
    if (health.performance.status === 'slow') {
      alerts.push({
        type: 'SLOW_PERFORMANCE',
        severity: 'warning',
        message: `Average response time is ${health.performance.avg_response_time}ms`,
        data: health.performance
      });
    }

    return alerts;
  }
}

module.exports = new MonitoringService();
