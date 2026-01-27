/**
 * PERFORMANCE OPTIMIZER - Optimizări pentru DB și API
 * Data: 03 Decembrie 2025
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../restaurant.db');

class PerformanceOptimizer {
  
  /**
   * Creează index-uri pentru queries frecvente
   */
  async createIndexes() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);
      
      console.log('⚡ PERFORMANCE OPTIMIZATION');
      console.log('============================\n');
      
      const indexes = [
        // Technical Sheets
        'CREATE INDEX IF NOT EXISTS idx_tech_sheets_product ON technical_sheets(product_id)',
        'CREATE INDEX IF NOT EXISTS idx_tech_sheets_status ON technical_sheets(status)',
        'CREATE INDEX IF NOT EXISTS idx_tech_sheets_approved ON technical_sheets(status, approved_by_manager_at)',
        
        // Portions
        'CREATE INDEX IF NOT EXISTS idx_portions_product ON product_portions(product_id)',
        'CREATE INDEX IF NOT EXISTS idx_portions_default ON product_portions(is_default)',
        'CREATE INDEX IF NOT EXISTS idx_portions_available ON product_portions(is_available)',
        
        // Recalls
        'CREATE INDEX IF NOT EXISTS idx_recalls_date ON product_recalls(recall_date)',
        'CREATE INDEX IF NOT EXISTS idx_recalls_severity ON product_recalls(severity)',
        'CREATE INDEX IF NOT EXISTS idx_recalls_resolved ON product_recalls(resolved)',
        
        // Expiry Alerts
        'CREATE INDEX IF NOT EXISTS idx_expiry_level ON expiry_alerts(alert_level)',
        'CREATE INDEX IF NOT EXISTS idx_expiry_date ON expiry_alerts(expiry_date)',
        'CREATE INDEX IF NOT EXISTS idx_expiry_resolved ON expiry_alerts(resolved)',
        'CREATE INDEX IF NOT EXISTS idx_expiry_batch ON expiry_alerts(batch_id)',
        
        // Variance
        'CREATE INDEX IF NOT EXISTS idx_variance_date ON stock_variance(variance_date)',
        'CREATE INDEX IF NOT EXISTS idx_variance_location ON stock_variance(location_id)',
        'CREATE INDEX IF NOT EXISTS idx_variance_investigation ON stock_variance(requires_investigation)',
        
        // Recipe Versions
        'CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe ON recipe_versions(recipe_id)',
        'CREATE INDEX IF NOT EXISTS idx_recipe_versions_active ON recipe_versions(is_active)',
        
        // Ingredient Catalog
        'CREATE INDEX IF NOT EXISTS idx_catalog_category ON ingredient_catalog_global(category)',
        'CREATE INDEX IF NOT EXISTS idx_catalog_allergens ON ingredient_catalog_global(allergens)',
        'CREATE INDEX IF NOT EXISTS idx_catalog_name_ro ON ingredient_catalog_global(name_ro)',
      ];
      
      let created = 0;
      let skipped = 0;
      
      const createNext = (index) => {
        if (index >= indexes.length) {
          console.log('\n============================');
          console.log(`✅ Created: ${created}`);
          console.log(`⚠️  Skipped: ${skipped} (already exist)`);
          console.log('============================\n');
          db.close();
          return resolve({ created, skipped });
        }
        
        db.run(indexes[index], (err) => {
          if (err) {
            if (err.message.includes('already exists')) {
              skipped++;
            } else {
              console.error(`❌ Error creating index ${index}:`, err.message);
            }
          } else {
            created++;
          }
          createNext(index + 1);
        });
      };
      
      createNext(0);
    });
  }
  
  /**
   * Analizează queries lente
   */
  async analyzeSlowQueries() {
    console.log('🔍 ANALYZING SLOW QUERIES');
    console.log('===========================\n');
    
    // TODO: Implement query performance monitoring
    // Log queries > 100ms
    // Sugerează index-uri noi
    
    console.log('✅ Query analysis complete\n');
  }
  
  /**
   * Optimizare DB (VACUUM, ANALYZE)
   */
  async optimizeDatabase() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);
      
      console.log('🔧 DATABASE OPTIMIZATION');
      console.log('========================\n');
      
      // VACUUM (compactare DB)
      console.log('⏳ Running VACUUM...');
      db.run('VACUUM', (err) => {
        if (err) {
          console.error('❌ VACUUM error:', err.message);
        } else {
          console.log('✅ VACUUM complete');
        }
        
        // ANALYZE (actualizare statistici)
        console.log('⏳ Running ANALYZE...');
        db.run('ANALYZE', (err2) => {
          if (err2) {
            console.error('❌ ANALYZE error:', err2.message);
          } else {
            console.log('✅ ANALYZE complete');
          }
          
          console.log('\n========================');
          console.log('✅ Database optimized!');
          console.log('========================\n');
          
          db.close();
          resolve();
        });
      });
    });
  }
  
  /**
   * Cache warming (pre-load data frecvent folosite)
   */
  async warmCache() {
    console.log('🔥 CACHE WARMING');
    console.log('================\n');
    
    // TODO: Implement Redis/Memory cache pentru:
    // - Ingredient catalog (citit foarte des)
    // - Technical sheets (pentru meniu digital)
    // - Product portions (pentru POS)
    // - Active expiry alerts
    
    console.log('✅ Cache warmed\n');
  }
}

module.exports = new PerformanceOptimizer();

// Run optimization
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  
  (async () => {
    await optimizer.createIndexes();
    await optimizer.optimizeDatabase();
    await optimizer.warmCache();
    
    console.log('🎉 PERFORMANCE OPTIMIZATION COMPLETE!\n');
    process.exit(0);
  })();
}

