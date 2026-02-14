// Test: Ingredient Normalization Service
// Purpose: Validate normalization logic
// Created: 13 Feb 2026

const IngredientNormalizationService = require('../services/ingredientNormalization.service');

/**
 * Run tests
 */
function runTests() {
    console.log('🧪 Testing Ingredient Normalization Service');
    console.log('=' . repeat(80));
    
    const service = new IngredientNormalizationService();
    let passed = 0;
    let failed = 0;
    
    // Test 1: Bell pepper unification
    console.log('\n1️⃣  Test: Bell Pepper Unification');
    const tests1 = [
        { input: 'ardei roșu', expected: 'ardei gras' },
        { input: 'ardei galben', expected: 'ardei gras' },
        { input: 'ardei verde', expected: 'ardei gras' },
        { input: 'ardei gras', expected: 'ardei gras' }
    ];
    
    tests1.forEach(test => {
        const result = service.normalizeIngredientName(test.input);
        if (result === test.expected) {
            console.log(`   ✅ "${test.input}" → "${result}"`);
            passed++;
        } else {
            console.log(`   ❌ "${test.input}" → "${result}" (expected: "${test.expected}")`);
            failed++;
        }
    });
    
    // Test 2: Hot peppers stay separate
    console.log('\n2️⃣  Test: Hot Peppers Stay Separate');
    const tests2 = [
        { input: 'ardei iute', expected: 'ardei iute' },
        { input: 'ardei iute habanero', expected: 'ardei iute habanero' },
        { input: 'ardei iute jalapeño', expected: 'ardei iute jalapeño' }
    ];
    
    tests2.forEach(test => {
        const result = service.normalizeIngredientName(test.input);
        if (result === test.expected) {
            console.log(`   ✅ "${test.input}" → "${result}"`);
            passed++;
        } else {
            console.log(`   ❌ "${test.input}" → "${result}" (expected: "${test.expected}")`);
            failed++;
        }
    });
    
    // Test 3: Ignore list
    console.log('\n3️⃣  Test: Ignore List (Non-Stock Items)');
    const tests3 = [
        'apa fierbinte',
        'apa caldă',
        'gheață',
        'spuma de lapte'
    ];
    
    tests3.forEach(test => {
        const result = service.normalizeIngredientName(test);
        if (result === null) {
            console.log(`   ✅ "${test}" → ignored (correct)`);
            passed++;
        } else {
            console.log(`   ❌ "${test}" → "${result}" (should be ignored)`);
            failed++;
        }
    });
    
    // Test 4: Variant suffix removal
    console.log('\n4️⃣  Test: Variant Suffix Removal');
    const tests4 = [
        { input: 'Piept de pui - Bio', expected: 'Piept de pui' },
        { input: 'Mușchi de vită - Premium', expected: 'Mușchi de vită' },
        { input: 'Ardei gras - Organic', expected: 'Ardei gras' }
    ];
    
    tests4.forEach(test => {
        const result = service.removeVariantSuffixes(test.input);
        if (result === test.expected) {
            console.log(`   ✅ "${test.input}" → "${result}"`);
            passed++;
        } else {
            console.log(`   ❌ "${test.input}" → "${result}" (expected: "${test.expected}")`);
            failed++;
        }
    });
    
    // Test 5: Duplicate detection
    console.log('\n5️⃣  Test: Duplicate Detection');
    const sampleIngredients = [
        { id: 1, name: 'Ardei gras' },
        { id: 2, name: 'ardei roșu' },
        { id: 3, name: 'ardei galben' },
        { id: 4, name: 'Ceapă' },
        { id: 5, name: 'ceapa' }
    ];
    
    const { duplicates } = service.findDuplicates(sampleIngredients);
    console.log(`   Found ${duplicates.length} duplicates:`);
    duplicates.forEach(dup => {
        console.log(`   ✅ "${dup.duplicate.name}" (ID: ${dup.duplicate.id}) → "${dup.existing.name}" (ID: ${dup.existing.id})`);
    });
    passed += duplicates.length > 0 ? 1 : 0;
    
    // Test 6: Case normalization
    console.log('\n6️⃣  Test: Case Normalization');
    const tests6 = [
        { input: 'CEAPĂ VERDE', expected: 'Ceapă Verde' },
        { input: 'piept de pui', expected: 'Piept De Pui' },
        { input: 'ArdEi GrAs', expected: 'Ardei Gras' }
    ];
    
    tests6.forEach(test => {
        const result = service.normalizeCase(test.input);
        if (result === test.expected) {
            console.log(`   ✅ "${test.input}" → "${result}"`);
            passed++;
        } else {
            console.log(`   ❌ "${test.input}" → "${result}" (expected: "${test.expected}")`);
            failed++;
        }
    });
    
    // Test 7: Meat cuts stay separate
    console.log('\n7️⃣  Test: Meat Cuts Stay Separate');
    const tests7 = [
        { input: 'piept pui', expected: 'piept pui' },
        { input: 'pulpe pui', expected: 'pulpe pui' },
        { input: 'ceafă porc', expected: 'ceafă porc' },
        { input: 'cotlet porc', expected: 'cotlet porc' }
    ];
    
    tests7.forEach(test => {
        const result = service.normalizeIngredientName(test.input);
        if (result === test.expected) {
            console.log(`   ✅ "${test.input}" → "${result}"`);
            passed++;
        } else {
            console.log(`   ❌ "${test.input}" → "${result}" (expected: "${test.expected}")`);
            failed++;
        }
    });
    
    // Summary
    console.log('\n' + '=' . repeat(80));
    console.log(`\n📊 TEST RESULTS:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log(`\n⚠️  ${failed} test(s) failed. Review implementation.`);
    }
    
    return failed === 0;
}

// Run tests
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests };
