/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATS CACHE SERVICE
 * 
 * Cache pentru statistici pentru optimizare performance:
 * - Cache statistici platforme (refresh la 5 min)
 * - Cache executive dashboard (refresh la 5 min)
 * - Cache top produse (refresh la 10 min)
 * ═══════════════════════════════════════════════════════════════════════════
 */

class StatsCacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get cached value
   */
  get(key) {
    const cached = this.cache.get(key);
    const timestamp = this.cacheTimestamps.get(key);
    
    if (!cached || !timestamp) {
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    const ttl = this.getTTL(key);
    if (now - timestamp > ttl) {
      this.delete(key);
      return null;
    }
    
    return cached;
  }

  /**
   * Set cached value
   */
  set(key, value, ttl = null) {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
    
    if (ttl) {
      // Store custom TTL
      this.cache.set(`${key}_ttl`, ttl);
    }
  }

  /**
   * Get TTL for a key
   */
  getTTL(key) {
    return this.cache.get(`${key}_ttl`) || this.defaultTTL;
  }

  /**
   * Delete cached value
   */
  delete(key) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    this.cache.delete(`${key}_ttl`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (key.endsWith('_ttl')) continue;
      
      const ttl = this.getTTL(key);
      if (now - timestamp > ttl) {
        expired++;
      } else {
        valid++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: valid,
      expired: expired,
      memory_usage_mb: (JSON.stringify(Array.from(this.cache.entries())).length / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Clean expired cache entries
   */
  cleanExpired() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (key.endsWith('_ttl')) continue;
      
      const ttl = this.getTTL(key);
      if (now - timestamp > ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    
    return keysToDelete.length;
  }
}

module.exports = new StatsCacheService();
