/**
 * ENTERPRISE HEALTH MONITORING SERVICE
 * 
 * Comprehensive health checks following patterns from:
 * - Kubernetes liveness/readiness probes
 * - AWS ELB health checks
 * - Datadog/New Relic best practices
 */

const os = require('os');

class HealthMonitorService {
  constructor() {
    this.startTime = Date.now();
    this.checks = new Map();
    this.metrics = {
      requests: { total: 0, errors: 0, latency: [] },
      database: { queries: 0, errors: 0, avgLatency: 0 },
      external: {}
    };
    
    // Register default health checks
    this.registerCheck('database', this.checkDatabase.bind(this));
    this.registerCheck('memory', this.checkMemory.bind(this));
    this.registerCheck('disk', this.checkDisk.bind(this));
  }

  /**
   * Register a health check
   */
  registerCheck(name, checkFn) {
    this.checks.set(name, checkFn);
  }

  /**
   * Get system uptime
   */
  getUptime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get system info
   */
  getSystemInfo() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: this.getUptime(),
      uptimeHuman: this.formatUptime(this.getUptime()),
      pid: process.pid,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usedPercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
        process: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external
        }
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model,
        loadAverage: os.loadavg(),
        usage: cpuUsage
      }
    };
  }

  /**
   * Format uptime as human readable
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
  }

  /**
   * Database health check
   */
  async checkDatabase() {
    try {
      const { dbPromise } = require('../../database');
      const db = await dbPromise;
      
      const start = Date.now();
      await new Promise((resolve, reject) => {
        db.get('SELECT 1 as test', (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      const latency = Date.now() - start;
      
      // Get table count as additional check
      const tableCount = await new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'", (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        });
      });
      
      return {
        status: 'healthy',
        latency: `${latency}ms`,
        tables: tableCount
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Memory health check
   */
  async checkMemory() {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const systemUsedPercent = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
    
    let status = 'healthy';
    if (heapUsedPercent > 90 || systemUsedPercent > 95) {
      status = 'critical';
    } else if (heapUsedPercent > 75 || systemUsedPercent > 85) {
      status = 'warning';
    }
    
    return {
      status,
      heap: {
        used: this.formatBytes(memUsage.heapUsed),
        total: this.formatBytes(memUsage.heapTotal),
        percent: heapUsedPercent.toFixed(2)
      },
      system: {
        used: this.formatBytes(os.totalmem() - os.freemem()),
        total: this.formatBytes(os.totalmem()),
        percent: systemUsedPercent.toFixed(2)
      }
    };
  }

  /**
   * Disk health check (basic)
   */
  async checkDisk() {
    // This is a simplified check - in production use a proper disk check library
    return {
      status: 'healthy',
      note: 'Detailed disk checks require native modules'
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Run all health checks
   */
  async runAllChecks() {
    const results = {};
    let overallStatus = 'healthy';
    
    for (const [name, checkFn] of this.checks) {
      try {
        results[name] = await checkFn();
        
        if (results[name].status === 'critical' || results[name].status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (results[name].status === 'warning' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        results[name] = {
          status: 'error',
          error: error.message
        };
        overallStatus = 'unhealthy';
      }
    }
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      checks: results
    };
  }

  /**
   * Liveness probe - is the app alive?
   */
  async livenessProbe() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Readiness probe - is the app ready to serve traffic?
   */
  async readinessProbe() {
    const dbCheck = await this.checkDatabase();
    
    if (dbCheck.status !== 'healthy') {
      return {
        status: 'not_ready',
        reason: 'database_unavailable',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 'ready',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detailed health report
   */
  async detailedReport() {
    const [healthChecks, systemInfo] = await Promise.all([
      this.runAllChecks(),
      this.getSystemInfo()
    ]);
    
    return {
      ...healthChecks,
      system: systemInfo,
      metrics: this.getMetricsSummary(),
      version: process.env.npm_package_version || '3.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Record request metrics
   */
  recordRequest(duration, isError = false) {
    this.metrics.requests.total++;
    if (isError) this.metrics.requests.errors++;
    
    // Keep last 1000 latency samples
    this.metrics.requests.latency.push(duration);
    if (this.metrics.requests.latency.length > 1000) {
      this.metrics.requests.latency.shift();
    }
  }

  /**
   * Record database metrics
   */
  recordDatabaseQuery(duration, isError = false) {
    this.metrics.database.queries++;
    if (isError) this.metrics.database.errors++;
    
    // Calculate running average
    const currentTotal = this.metrics.database.avgLatency * (this.metrics.database.queries - 1);
    this.metrics.database.avgLatency = (currentTotal + duration) / this.metrics.database.queries;
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const latencies = this.metrics.requests.latency;
    const sorted = [...latencies].sort((a, b) => a - b);
    
    return {
      requests: {
        total: this.metrics.requests.total,
        errors: this.metrics.requests.errors,
        errorRate: this.metrics.requests.total > 0 
          ? ((this.metrics.requests.errors / this.metrics.requests.total) * 100).toFixed(2) + '%'
          : '0%',
        latency: {
          avg: latencies.length > 0 
            ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2) + 'ms'
            : 'N/A',
          p50: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.5)] + 'ms' : 'N/A',
          p95: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] + 'ms' : 'N/A',
          p99: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] + 'ms' : 'N/A'
        }
      },
      database: {
        queries: this.metrics.database.queries,
        errors: this.metrics.database.errors,
        avgLatency: this.metrics.database.avgLatency.toFixed(2) + 'ms'
      }
    };
  }
}

// Singleton instance
const healthMonitor = new HealthMonitorService();

// Express routes
function setupHealthRoutes(app) {
  // Basic liveness - always returns 200 if app is running
  app.get('/health', async (req, res) => {
    const result = await healthMonitor.livenessProbe();
    res.json(result);
  });
  
  // Readiness - returns 503 if not ready to serve traffic
  app.get('/ready', async (req, res) => {
    const result = await healthMonitor.readinessProbe();
    const statusCode = result.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(result);
  });
  
  // Detailed health check
  app.get('/health/detailed', async (req, res) => {
    const result = await healthMonitor.detailedReport();
    const statusCode = result.status === 'healthy' ? 200 : 
                       result.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(result);
  });
  
  // API health (alias)
  app.get('/api/health', async (req, res) => {
    const result = await healthMonitor.runAllChecks();
    res.json(result);
  });
  
  // Metrics endpoint (Prometheus format could be added)
  app.get('/metrics', (req, res) => {
    res.json(healthMonitor.getMetricsSummary());
  });
}

module.exports = {
  healthMonitor,
  setupHealthRoutes
};

