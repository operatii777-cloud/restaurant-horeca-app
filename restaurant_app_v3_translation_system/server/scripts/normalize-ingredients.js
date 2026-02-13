#!/usr/bin/env node
// Script to normalize and unify ingredients in database
// Purpose: Standardize ingredient names and remove duplicates
// Created: 13 Feb 2026

const IngredientNormalizationService = require('../services/ingredientNormalization.service');
const fs = require('fs');
const path = require('path');

/**
 * Main normalization script
 */
async function main() {
    console.log('🔍 Ingredient Normalization Script');
    console.log('='.repeat(80));
    
    const normalizationService = new IngredientNormalizationService();
    
    // Load ingredients from seed file
    const ingredientsSeedPath = path.join(__dirname, '../seeds/ingredients_seed.js');
    const ingredientsSeed = require(ingredientsSeedPath);
    
    console.log(`\n📊 Loaded ${ingredientsSeed.length} ingredients from seed file`);
    
    // Analyze ingredients
    console.log('\n🔬 Analyzing ingredients...');
    const analysis = normalizationService.analyzeIngredients(ingredientsSeed);
    
    // Display analysis results
    console.log('\n📋 ANALYSIS RESULTS');
    console.log('='.repeat(80));
    console.log(`Total ingredients: ${analysis.totalIngredients}`);
    console.log(`Unique normalized: ${analysis.uniqueNormalized}`);
    console.log(`Duplicates found: ${analysis.duplicateCount}`);
    console.log(`Ignored items: ${analysis.ignoredCount}`);
    console.log(`Variant groups: ${analysis.variantGroups.length}`);
    
    // Show duplicates
    if (analysis.duplicates.length > 0) {
        console.log('\n⚠️  DUPLICATES FOUND:');
        console.log('-'.repeat(80));
        analysis.duplicates.slice(0, 20).forEach((dup, idx) => {
            console.log(`${idx + 1}. "${dup.duplicate.name}" → "${dup.existing.name}"`);
            console.log(`   Normalized: "${dup.normalized}"`);
        });
        
        if (analysis.duplicates.length > 20) {
            console.log(`   ... and ${analysis.duplicates.length - 20} more`);
        }
    }
    
    // Show variant groups
    if (analysis.variantGroups.length > 0) {
        console.log('\n📦 TOP VARIANT GROUPS:');
        console.log('-'.repeat(80));
        analysis.variantGroups.slice(0, 10).forEach((group, idx) => {
            console.log(`\n${idx + 1}. "${group.baseName}" (${group.count} variants):`);
            group.variants.forEach(v => console.log(`   - ${v}`));
        });
    }
    
    // Generate normalization mapping
    const mapping = normalizationService.generateUnificationMapping(analysis.duplicates);
    
    // Save analysis report
    const reportPath = path.join(__dirname, '../reports/ingredient-normalization-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = {
        timestamp: new Date().toISOString(),
        analysis,
        mapping,
        recommendations: generateRecommendations(analysis)
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${reportPath}`);
    
    // Generate normalization script
    const sqlPath = path.join(__dirname, '../reports/normalize-ingredients.sql');
    const sqlScript = generateNormalizationSQL(mapping, normalizationService);
    fs.writeFileSync(sqlPath, sqlScript);
    console.log(`✅ SQL script saved to: ${sqlPath}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ Normalization analysis complete!');
    console.log('\n📌 NEXT STEPS:');
    console.log('1. Review the analysis report');
    console.log('2. Verify the SQL normalization script');
    console.log('3. Backup your database before applying changes');
    console.log('4. Run the SQL script to normalize ingredients');
    console.log('5. Verify recipe integrity after normalization');
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.duplicateCount > 0) {
        recommendations.push({
            type: 'CRITICAL',
            message: `Found ${analysis.duplicateCount} duplicate ingredients that should be merged`,
            action: 'Review duplicate mappings and update recipes to use canonical names'
        });
    }
    
    if (analysis.variantGroups.length > 50) {
        recommendations.push({
            type: 'WARNING',
            message: `Found ${analysis.variantGroups.length} ingredient variant groups`,
            action: 'Consider consolidating variants or creating a variant management system'
        });
    }
    
    if (analysis.ignoredCount > 0) {
        recommendations.push({
            type: 'INFO',
            message: `${analysis.ignoredCount} non-stock ingredients (like "apa fierbinte") will be ignored`,
            action: 'Review ignored items list to ensure accuracy'
        });
    }
    
    if (analysis.summary.needsNormalization) {
        recommendations.push({
            type: 'ACTION',
            message: 'Database normalization is required',
            action: 'Apply the generated SQL script to unify ingredients'
        });
    }
    
    return recommendations;
}

/**
 * Generate SQL script for normalization
 */
function generateNormalizationSQL(mapping, normalizationService) {
    let sql = `-- Ingredient Normalization SQL Script
-- Generated: ${new Date().toISOString()}
-- Purpose: Standardize and unify ingredient names
-- 
-- ⚠️  IMPORTANT: Backup your database before running this script!
--

BEGIN TRANSACTION;

-- ==========================================
-- STEP 1: Update recipe references
-- ==========================================
-- Replace duplicate ingredient references in recipes with canonical ingredient IDs

`;
    
    mapping.forEach((map, idx) => {
        sql += `-- ${idx + 1}. Merge "${map.fromName}" → "${map.toName}"\n`;
        sql += `UPDATE recipes SET ingredient_id = ${map.to} WHERE ingredient_id = ${map.from};\n`;
        sql += `-- Update stock transfers\n`;
        sql += `UPDATE stock_movements SET ingredient_id = ${map.to} WHERE ingredient_id = ${map.from};\n\n`;
    });
    
    sql += `
-- ==========================================
-- STEP 2: Mark duplicate ingredients as hidden
-- ==========================================
-- Keep duplicates in database but mark as hidden to preserve data integrity

`;
    
    mapping.forEach((map, idx) => {
        sql += `-- ${idx + 1}. Hide "${map.fromName}"\n`;
        sql += `UPDATE ingredients SET is_hidden = 1, is_active = 0, notes = 'Merged into: ${map.toName}' WHERE id = ${map.from};\n\n`;
    });
    
    sql += `
-- ==========================================
-- STEP 3: Normalize ingredient names
-- ==========================================
-- Apply standard naming conventions to remaining active ingredients

`;
    
    // Add normalization updates for common patterns
    const normalizations = [
        { from: '%ceapa%', to: 'ceapă', pattern: 'ceapa' },
        { from: '%paine%', to: 'pâine', pattern: 'paine' },
        { from: '%faina%', to: 'făină', pattern: 'faina' },
        { from: '%muschi%', to: 'mușchi', pattern: 'muschi' },
        { from: '%ceafa%', to: 'ceafă', pattern: 'ceafa' },
        { from: '%pulpa%', to: 'pulpă', pattern: 'pulpa' }
    ];
    
    normalizations.forEach(norm => {
        sql += `-- Normalize diacritics: ${norm.pattern} → ${norm.to}\n`;
        sql += `UPDATE ingredients \n`;
        sql += `SET name = REPLACE(name, '${norm.pattern}', '${norm.to}') \n`;
        sql += `WHERE name LIKE '${norm.from}' AND is_active = 1;\n\n`;
    });
    
    sql += `
-- ==========================================
-- STEP 4: Verify integrity
-- ==========================================
-- Check for orphaned recipe entries (should return 0 rows)

SELECT r.id, r.product_id, r.ingredient_id 
FROM recipes r 
LEFT JOIN ingredients i ON r.ingredient_id = i.id 
WHERE i.id IS NULL;

-- ==========================================
-- STEP 5: Generate summary
-- ==========================================

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
WHERE is_hidden = 1 OR is_active = 0;

-- ==========================================
-- End of normalization
-- ==========================================

COMMIT;

-- ✅ Normalization complete!
-- 
-- POST-EXECUTION CHECKLIST:
-- [ ] Verify recipe integrity
-- [ ] Check stock movement history
-- [ ] Update product costs if needed
-- [ ] Clear application caches
-- [ ] Test recipe calculations
`;
    
    return sql;
}

// Run the script
if (require.main === module) {
    main().catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
}

module.exports = { main };
