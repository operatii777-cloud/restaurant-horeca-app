/**
 * Health Monitoring System
 * Advanced health checks with system metrics
 */

const os = require('os');
const logger = require('./logger');

class HealthMonitor {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        lastMinute: []
      },
      database: {
        connected: false,
        lastCheck: null,
        queriesPerSecond: 0
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      cpu: {
        usage: 0,
        loadAverage: []
      }
    };
  }

  // Increment request counter
  recordRequest(success = true) {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }
    
    // Track last minute requests
    const now = Date.now();
    this.metrics.requests.lastMinute.push(now);
    
    // Remove requests older than 1 minute
    this.metrics.requests.lastMinute = this.metrics.requests.lastMinute.filter(
      time => now - time < 60000
    );
  }

  // Get uptime in seconds
  getUptime() {
    return (Date.now() - this.startTime) / 1000;
  }

  // Get memory usage
  getMemoryUsage() {
    const used = process.memoryUsage();
    const total = os.totalmem();
    const free = os.freemem();
    
    return {
      process: {
        heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(used.external / 1024 / 1024 * 100) / 100,
        rss: Math.round(used.rss / 1024 / 1024 * 100) / 100
      },
      system: {
        total: Math.round(total / 1024 / 1024 / 1024 * 100) / 100, // GB
        free: Math.round(free / 1024 / 1024 / 1024 * 100) / 100,
        used: Math.round((total - free) / 1024 / 1024 / 1024 * 100) / 100,
        percentage: Math.round((total - free) / total * 100)
      }
    };
  }

  // Get CPU usage
  getCPUUsage() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    // Calculate average CPU usage
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);
    
    return {
      cores: cpus.length,
      model: cpus[0].model,
      speed: cpus[0].speed,
      usage: usage,
      loadAverage: {
        '1min': Math.round(loadAvg[0] * 100) / 100,
        '5min': Math.round(loadAvg[1] * 100) / 100,
        '15min': Math.round(loadAvg[2] * 100) / 100
      }
    };
  }

  // Get database status
  async getDatabaseStatus(db) {
    try {
      const startTime = Date.now();
      
      // Simple query to check connection
      await new Promise((resolve, reject) => {
        db.get('SELECT 1', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const responseTime = Date.now() - startTime;
      
      // Get database size
      const dbStats = await new Promise((resolve, reject) => {
        db.get('PRAGMA page_count', (err, row) => {
          if (err) reject(err);
          else {
            db.get('PRAGMA page_size', (err2, row2) => {
              if (err2) reject(err2);
              else {
                const sizeBytes = row.page_count * row2.page_size;
                resolve({
                  sizeMB: Math.round(sizeBytes / 1024 / 1024 * 100) / 100
                });
              }
            });
          }
        });
      });
      
      this.metrics.database.connected = true;
      this.metrics.database.lastCheck = new Date().toISOString();
      
      return {
        connected: true,
        responseTime: `${responseTime}ms`,
        size: `${dbStats.sizeMB} MB`,
        type: 'SQLite'
      };
    } catch (error) {
      this.metrics.database.connected = false;
      logger.error('Database health check failed', { error: error.message });
      
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Get comprehensive health status
  async getHealthStatus(db = null) {
    const memory = this.getMemoryUsage();
    const cpu = this.getCPUUsage();
    const uptime = this.getUptime();
    
    const status = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.round(uptime),
        formatted: this.formatUptime(uptime)
      },
      server: {
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: os.platform(),
        hostname: os.hostname()
      },
      memory,
      cpu,
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        errors: this.metrics.requests.errors,
        errorRate: this.metrics.requests.total > 0 
          ? Math.round(this.metrics.requests.errors / this.metrics.requests.total * 100) 
          : 0,
        lastMinute: this.metrics.requests.lastMinute.length,
        requestsPerSecond: Math.round(this.metrics.requests.lastMinute.length / 60 * 100) / 100
      }
    };
    
    // Add database status if db provided
    if (db) {
      status.database = await this.getDatabaseStatus(db);
    }
    
    // Determine overall health
    status.healthy = this.isHealthy(status);
    if (!status.healthy) {
      status.status = 'DEGRADED';
    }
    
    return status;
  }

  // Check if system is healthy
  isHealthy(status) {
    // Memory check
    if (status.memory.system.percentage > 90) {
      logger.warn('System memory usage high', { percentage: status.memory.system.percentage });
      return false;
    }
    
    // Database check
    if (status.database && !status.database.connected) {
      logger.error('Database not connected');
      return false;
    }
    
    // Error rate check
    if (status.requests.errorRate > 10) {
      logger.warn('High error rate', { errorRate: status.requests.errorRate });
      return false;
    }
    
    return true;
  }

  // Format uptime
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  }

  // Get metrics summary
  getMetricsSummary() {
    return {
      uptime: this.formatUptime(this.getUptime()),
      requests: {
        total: this.metrics.requests.total,
        lastMinute: this.metrics.requests.lastMinute.length
      },
      memory: this.metrics.memory.percentage,
      database: this.metrics.database.connected ? 'connected' : 'disconnected'
    };
  }
}

// Export singleton instance
module.exports = new HealthMonitor();

