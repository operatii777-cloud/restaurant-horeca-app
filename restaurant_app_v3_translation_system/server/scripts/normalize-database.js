#!/usr/bin/env node
// Database Ingredient Normalization Script
// Purpose: Apply normalization to actual database
// Created: 13 Feb 2026

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const IngredientNormalizationService = require('../services/ingredientNormalization.service');

/**
 * Connect to database and apply normalization
 */
async function normalizeDatabase() {
    console.log('🔍 Database Ingredient Normalization');
    console.log('='.repeat(80));
    
    // Check for database file
    const dbPath = path.join(__dirname, '../restaurant.db');
    
    if (!fs.existsSync(dbPath)) {
        console.log('⚠️  Database file not found at:', dbPath);
        console.log('ℹ️  This script works with the live database.');
        console.log('ℹ️  For seed file analysis, use normalize-ingredients.js instead.');
        return;
    }
    
    console.log(`\n📊 Connecting to database: ${dbPath}`);
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ Connected to database');
            
            // Get all ingredients
            db.all('SELECT * FROM ingredients', [], async (err, ingredients) => {
                if (err) {
                    console.error('❌ Error fetching ingredients:', err.message);
                    db.close();
                    reject(err);
                    return;
                }
                
                if (!ingredients || ingredients.length === 0) {
                    console.log('⚠️  No ingredients found in database');
                    console.log('ℹ️  The database may need to be seeded first.');
                    db.close();
                    resolve();
                    return;
                }
                
                console.log(`\n📊 Found ${ingredients.length} ingredients in database`);
                
                // Analyze
                const normalizationService = new IngredientNormalizationService();
                const analysis = normalizationService.analyzeIngredients(ingredients);
                
                // Display results
                console.log('\n📋 ANALYSIS RESULTS');
                console.log('='.repeat(80));
                console.log(`Total ingredients: ${analysis.totalIngredients}`);
                console.log(`Unique normalized: ${analysis.uniqueNormalized}`);
                console.log(`Duplicates found: ${analysis.duplicateCount}`);
                console.log(`Ignored items: ${analysis.ignoredCount}`);
                
                if (analysis.duplicates.length > 0) {
                    console.log('\n⚠️  DUPLICATES FOUND:');
                    console.log('-'.repeat(80));
                    analysis.duplicates.forEach((dup, idx) => {
                        console.log(`${idx + 1}. "${dup.duplicate.name}" (ID: ${dup.duplicate.id})`);
                        console.log(`   → "${dup.existing.name}" (ID: ${dup.existing.id})`);
                    });
                    
                    // Generate SQL
                    const mapping = normalizationService.generateUnificationMapping(analysis.duplicates);
                    const sqlPath = path.join(__dirname, '../reports/normalize-database.sql');
                    const sql = generateDatabaseSQL(mapping);
                    
                    fs.writeFileSync(sqlPath, sql);
                    console.log(`\n✅ SQL script saved to: ${sqlPath}`);
                    console.log('\n⚠️  NEXT STEPS:');
                    console.log('1. Review the SQL script');
                    console.log('2. Backup your database: cp restaurant.db restaurant.db.backup');
                    console.log('3. Apply the script: sqlite3 restaurant.db < reports/normalize-database.sql');
                }
                
                // Save report
                const reportPath = path.join(__dirname, '../reports/database-normalization-report.json');
                fs.writeFileSync(reportPath, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    database: dbPath,
                    analysis
                }, null, 2));
                
                console.log(`\n✅ Report saved to: ${reportPath}`);
                
                db.close();
                resolve();
            });
        });
    });
}

/**
 * Generate SQL for database normalization with real IDs
 */
function generateDatabaseSQL(mapping) {
    let sql = `-- Database Ingredient Normalization SQL Script
-- Generated: ${new Date().toISOString()}
-- Purpose: Standardize and unify ingredient names in live database
-- 
-- ⚠️  CRITICAL: Backup your database before running this script!
-- Backup command: cp restaurant.db restaurant.db.backup.$(date +%Y%m%d_%H%M%S)
--

BEGIN TRANSACTION;

-- ==========================================
-- STEP 1: Update recipe references
-- ==========================================

`;
    
    mapping.forEach((map, idx) => {
        sql += `-- ${idx + 1}. Merge "${map.fromName}" (ID: ${map.from}) → "${map.toName}" (ID: ${map.to})\n`;
        sql += `UPDATE recipes \n`;
        sql += `SET ingredient_id = ${map.to} \n`;
        sql += `WHERE ingredient_id = ${map.from};\n\n`;
        
        sql += `-- Update stock movements\n`;
        sql += `UPDATE stock_movements \n`;
        sql += `SET ingredient_id = ${map.to} \n`;
        sql += `WHERE ingredient_id = ${map.from};\n\n`;
        
        sql += `-- Update supplier ingredients\n`;
        sql += `UPDATE supplier_ingredients \n`;
        sql += `SET ingredient_id = ${map.to} \n`;
        sql += `WHERE ingredient_id = ${map.from};\n\n`;
    });
    
    sql += `
-- ==========================================
-- STEP 2: Mark duplicates as hidden
-- ==========================================

`;
    
    mapping.forEach((map, idx) => {
        sql += `-- ${idx + 1}. Hide "${map.fromName}" (ID: ${map.from})\n`;
        sql += `UPDATE ingredients \n`;
        sql += `SET is_hidden = 1, \n`;
        sql += `    is_active = 0, \n`;
        sql += `    notes = 'Merged into: ${map.toName} (ID: ${map.to}) on ${new Date().toISOString()}' \n`;
        sql += `WHERE id = ${map.from};\n\n`;
    });
    
    sql += `
-- ==========================================
-- STEP 3: Verify integrity
-- ==========================================

-- Check for orphaned recipes (should return 0 rows)
SELECT 
    'Orphaned Recipe Entries' as issue,
    COUNT(*) as count
FROM recipes r 
LEFT JOIN ingredients i ON r.ingredient_id = i.id 
WHERE i.id IS NULL;

-- Summary
SELECT 
    'Active Ingredients' as category,
    COUNT(*) as count
FROM ingredients 
WHERE is_active = 1 AND is_hidden = 0
UNION ALL
SELECT 
    'Hidden/Merged Ingredients' as category,
    COUNT(*) as count
FROM ingredients 
WHERE is_hidden = 1;

COMMIT;

-- ✅ Normalization complete!
`;
    
    return sql;
}

// Run the script
if (require.main === module) {
    normalizeDatabase().catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
}

module.exports = { normalizeDatabase };
