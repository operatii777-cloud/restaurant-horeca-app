#!/usr/bin/env node
// Ingredient Consistency Validator
// Purpose: Validate and report on ingredient naming consistency
// Created: 13 Feb 2026

const IngredientNormalizationService = require('../services/ingredientNormalization.service');
const fs = require('fs');
const path = require('path');

/**
 * Validate ingredient consistency across the system
 */
async function validateConsistency() {
    console.log('🔍 Ingredient Consistency Validator');
    console.log('='.repeat(80));
    
    const normalizationService = new IngredientNormalizationService();
    const ingredientsSeed = require('../seeds/ingredients_seed.js');
    
    console.log(`\n📊 Validating ${ingredientsSeed.length} ingredients...`);
    
    // Check for diacritic inconsistencies
    console.log('\n🔤 Checking diacritic consistency...');
    const diacriticIssues = [];
    const diacriticPairs = [
        { with: 'ă', without: 'a', word: 'ceapă/ceapa' },
        { with: 'â', without: 'a', word: 'pâine/paine' },
        { with: 'ă', without: 'a', word: 'făină/faina' },
        { with: 'ș', without: 's', word: 'mușchi/muschi' },
        { with: 'ă', without: 'a', word: 'ceafă/ceafa' },
        { with: 'ă', without: 'a', word: 'pulpă/pulpa' }
    ];
    
    diacriticPairs.forEach(pair => {
        const withDiacritic = ingredientsSeed.filter(i => 
            i.name.toLowerCase().includes(pair.with)
        );
        const withoutDiacritic = ingredientsSeed.filter(i => 
            i.name.toLowerCase().includes(pair.without) && 
            !i.name.toLowerCase().includes(pair.with)
        );
        
        if (withDiacritic.length > 0 && withoutDiacritic.length > 0) {
            diacriticIssues.push({
                pair: pair.word,
                withDiacritic: withDiacritic.length,
                withoutDiacritic: withoutDiacritic.length,
                examples: {
                    with: withDiacritic.slice(0, 3).map(i => i.name),
                    without: withoutDiacritic.slice(0, 3).map(i => i.name)
                }
            });
        }
    });
    
    if (diacriticIssues.length > 0) {
        console.log('\n⚠️  Found diacritic inconsistencies:');
        diacriticIssues.forEach(issue => {
            console.log(`\n  ${issue.pair}:`);
            console.log(`    With diacritics: ${issue.withDiacritic} ingredients`);
            console.log(`    Without: ${issue.withoutDiacritic} ingredients`);
            console.log(`    Examples (with): ${issue.examples.with.join(', ')}`);
            console.log(`    Examples (without): ${issue.examples.without.join(', ')}`);
        });
    } else {
        console.log('✅ No diacritic inconsistencies found');
    }
    
    // Check for pepper variations
    console.log('\n🌶️  Analyzing pepper variations...');
    const peppers = ingredientsSeed.filter(i => 
        i.name.toLowerCase().includes('ardei')
    );
    
    const pepperGroups = {
        'Bell Pepper (ardei gras)': peppers.filter(i => 
            i.name.toLowerCase().includes('ardei gras') ||
            i.name.toLowerCase().includes('ardei roșu') ||
            i.name.toLowerCase().includes('ardei galben') ||
            i.name.toLowerCase().includes('ardei verde')
        ),
        'Hot Pepper (ardei iute)': peppers.filter(i => 
            i.name.toLowerCase().includes('iute') ||
            i.name.toLowerCase().includes('chili')
        )
    };
    
    console.log(`\nTotal pepper ingredients: ${peppers.length}`);
    Object.entries(pepperGroups).forEach(([group, items]) => {
        console.log(`\n  ${group}: ${items.length} ingredients`);
        items.slice(0, 5).forEach(item => {
            console.log(`    - ${item.name}`);
        });
        if (items.length > 5) {
            console.log(`    ... and ${items.length - 5} more`);
        }
    });
    
    // Check for meat variations
    console.log('\n🥩 Analyzing meat variations...');
    const meats = ingredientsSeed.filter(i => 
        i.category === 'Carne' || i.category_en === 'Meat'
    );
    
    const meatTypes = {
        'Chicken': meats.filter(i => i.name.toLowerCase().includes('pui')),
        'Pork': meats.filter(i => i.name.toLowerCase().includes('porc')),
        'Beef': meats.filter(i => i.name.toLowerCase().includes('vită') || i.name.toLowerCase().includes('vita'))
    };
    
    console.log(`\nTotal meat ingredients: ${meats.length}`);
    Object.entries(meatTypes).forEach(([type, items]) => {
        console.log(`  ${type}: ${items.length} ingredients`);
    });
    
    // Check for milk/dairy variations
    console.log('\n🥛 Analyzing milk/dairy variations...');
    const dairy = ingredientsSeed.filter(i => 
        i.name.toLowerCase().includes('lapte') ||
        i.category === 'Lactate' || 
        i.category_en === 'Dairy'
    );
    
    console.log(`Total dairy ingredients: ${dairy.length}`);
    const milkTypes = dairy.filter(i => i.name.toLowerCase().includes('lapte'));
    console.log(`Milk variations: ${milkTypes.length}`);
    milkTypes.forEach(item => {
        console.log(`  - ${item.name}`);
    });
    
    // Generate summary report
    const report = {
        timestamp: new Date().toISOString(),
        totalIngredients: ingredientsSeed.length,
        validation: {
            diacriticIssues: diacriticIssues.length,
            pepperVariations: peppers.length,
            meatVariations: meats.length,
            dairyVariations: dairy.length
        },
        details: {
            diacriticIssues,
            pepperGroups: Object.fromEntries(
                Object.entries(pepperGroups).map(([k, v]) => [k, v.length])
            ),
            meatTypes: Object.fromEntries(
                Object.entries(meatTypes).map(([k, v]) => [k, v.length])
            )
        },
        recommendations: [
            {
                priority: 'HIGH',
                item: 'Unify bell pepper variations',
                action: 'Map ardei roșu, ardei galben, ardei verde → ardei gras'
            },
            {
                priority: 'MEDIUM',
                item: 'Normalize diacritics',
                action: 'Ensure consistent use of Romanian diacritics (ă, â, î, ș, ț)'
            },
            {
                priority: 'LOW',
                item: 'Review variant suffixes',
                action: 'Consider if Bio, Premium, Organic variants should be separate or attributes'
            }
        ]
    };
    
    // Save report
    const reportPath = path.join(__dirname, '../reports/ingredient-consistency-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ Validation complete! Report saved to: ${reportPath}`);
    
    // Show summary
    console.log('\n📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total ingredients: ${report.totalIngredients}`);
    console.log(`Diacritic issues: ${report.validation.diacriticIssues}`);
    console.log(`Pepper variations: ${report.validation.pepperVariations}`);
    console.log(`Meat variations: ${report.validation.meatVariations}`);
    console.log(`Dairy variations: ${report.validation.dairyVariations}`);
    
    console.log('\n📌 TOP RECOMMENDATIONS:');
    report.recommendations.forEach((rec, idx) => {
        console.log(`\n${idx + 1}. [${rec.priority}] ${rec.item}`);
        console.log(`   → ${rec.action}`);
    });
}

// Run validation
if (require.main === module) {
    validateConsistency().catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
}

module.exports = { validateConsistency };
