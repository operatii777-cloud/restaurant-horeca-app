// Script pentru testare secvențială a tuturor endpoint-urilor P0-P1
// Rulează testele unul câte unul, încet, pentru a nu suprasolicita serverul

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

let passed = 0;
let failed = 0;
let token = null;

// Helper pentru delay între teste
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper pentru login și obținere token
async function loginAndGetToken() {
  if (token) return token;
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    }, { timeout: 5000 });
    
    token = response.data.sessionToken || response.data.token || ('admin_' + Date.now());
    return token;
  } catch (error) {
    console.log('⚠️ Login API eșuat, folosind fallback token');
    token = 'admin_' + Date.now();
    return token;
  }
}

// Helper pentru request autentificat
async function authenticatedRequest(method, url, data = null) {
  const authToken = await loginAndGetToken();
  const config = {
    method,
    url,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
}

// Funcție pentru a rula un test
async function runTest(name, testFn) {
  try {
    console.log(`\n🔄 Test: ${name}`);
    await testFn();
    console.log(`✅ PASS: ${name}`);
    passed++;
    await delay(500); // Pauză între teste
    return true;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    failed++;
    await delay(500);
    return false;
  }
}

// TESTE SĂPTĂMÂNA 1: Unit Conversion
async function testUnitConversion() {
  console.log('\n📦 SĂPTĂMÂNA 1: Unit Conversion');
  
  await runTest('Validare conversie unități (kg → g)', async () => {
    const response = await axios.post(`${BASE_URL}/api/units/validate-conversion`, {
      fromUnit: 'kg',
      toUnit: 'g',
      quantity: 2
    }, { timeout: 5000 });
    
    if (response.status !== 200 || !response.data.success || response.data.value !== 2000) {
      throw new Error(`Expected 2000, got ${response.data.value}`);
    }
  });
  
  await runTest('Validare conversie unități (l → ml)', async () => {
    const response = await axios.post(`${BASE_URL}/api/units/validate-conversion`, {
      fromUnit: 'l',
      toUnit: 'ml',
      quantity: 1.5
    }, { timeout: 5000 });
    
    if (response.status !== 200 || !response.data.success || response.data.value !== 1500) {
      throw new Error(`Expected 1500, got ${response.data.value}`);
    }
  });
  
  await runTest('Eroare conversie incompatibilă (kg → ml)', async () => {
    const response = await axios.post(`${BASE_URL}/api/units/validate-conversion`, {
      fromUnit: 'kg',
      toUnit: 'ml',
      quantity: 1
    }, { timeout: 5000 });
    
    if (response.status !== 200 || response.data.success !== false) {
      throw new Error('Expected success=false for incompatible units');
    }
  });
  
  await runTest('Listă unități disponibile', async () => {
    const response = await axios.get(`${BASE_URL}/api/units/list`, { timeout: 5000 });
    
    if (response.status !== 200 || !response.data.units || !Array.isArray(response.data.units)) {
      throw new Error('Invalid units list response');
    }
    if (!response.data.units.includes('kg') || !response.data.units.includes('g')) {
      throw new Error('Missing expected units');
    }
  });
  
  await runTest('Listă unități pe categorii (weight)', async () => {
    const response = await axios.get(`${BASE_URL}/api/units/list?category=weight`, { timeout: 5000 });
    
    if (response.status !== 200 || !response.data.units || !Array.isArray(response.data.units)) {
      throw new Error('Invalid units list response');
    }
  });
  
  await runTest('Categorii disponibile', async () => {
    const response = await axios.get(`${BASE_URL}/api/units/categories`, { timeout: 5000 });
    
    if (response.status !== 200 || !response.data.categories || !Array.isArray(response.data.categories)) {
      throw new Error('Invalid categories response');
    }
    if (!response.data.categories.includes('weight') || !response.data.categories.includes('volume')) {
      throw new Error('Missing expected categories');
    }
  });
}

// TESTE SĂPTĂMÂNA 1: Sub-rețete
async function testSubRecipes() {
  console.log('\n📦 SĂPTĂMÂNA 1: Sub-rețete');
  
  await runTest('Listă preparații (sub-rețete)', async () => {
    const response = await axios.get(`${BASE_URL}/api/recipes/preparations`, { timeout: 5000 });
    
    if (response.status !== 200 || !response.data.preparations || !Array.isArray(response.data.preparations)) {
      throw new Error('Invalid preparations response');
    }
  });
  
  await runTest('Validare sub-rețetă (fără circular dependency)', async () => {
    // Obține produse existente
    const recipesResponse = await authenticatedRequest('GET', `${BASE_URL}/api/recipes/all`);
    
    if (recipesResponse.status === 200 && recipesResponse.data.products && recipesResponse.data.products.length > 0) {
      const productId = recipesResponse.data.products[0].product_id;
      const subRecipeId = recipesResponse.data.products.length > 1 
        ? recipesResponse.data.products[1].product_id 
        : productId + 1;
      
      const response = await authenticatedRequest('POST', `${BASE_URL}/api/recipes/validate-sub-recipe`, {
        productId: productId,
        subRecipeId: subRecipeId
      });
      
      if (response.status !== 200 || !response.data.hasOwnProperty('canUse')) {
        throw new Error('Invalid validation response');
      }
    } else {
      console.log('   ⚠️ Nu există produse pentru testare');
    }
  });
}

// TESTE SĂPTĂMÂNA 1: Scaling Recipes
async function testScalingRecipes() {
  console.log('\n📦 SĂPTĂMÂNA 1: Scaling Recipes');
  
  await runTest('Scalează rețetă cu multiplier', async () => {
    // Obține un produs cu rețetă
    const recipesResponse = await authenticatedRequest('GET', `${BASE_URL}/api/recipes/all`);
    
    if (recipesResponse.status === 200 && recipesResponse.data.products && recipesResponse.data.products.length > 0) {
      const productId = recipesResponse.data.products[0].product_id;
      
      const response = await authenticatedRequest('POST', `${BASE_URL}/api/recipes/${productId}/scale`, {
        scaleFactor: 2
      });
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Scaling failed');
      }
      if (!response.data.scaledIngredients || !Array.isArray(response.data.scaledIngredients)) {
        throw new Error('Invalid scaled ingredients');
      }
    } else {
      console.log('   ⚠️ Nu există produse pentru testare');
    }
  });
}

// TESTE SĂPTĂMÂNA 1: Yield & Max Stock
async function testYieldMaxStock() {
  console.log('\n📦 SĂPTĂMÂNA 1: Yield & Max Stock');
  
  let ingredientId = null;
  
  await runTest('Creează ingredient cu max_stock, safety_stock, reorder_quantity', async () => {
    const response = await authenticatedRequest('POST', `${BASE_URL}/api/ingredients`, {
      name: `Test Ingredient ${Date.now()}`,
      category: 'Test',
      unit: 'kg',
      current_stock: 10,
      min_stock: 5,
      max_stock: 50,
      safety_stock: 8,
      reorder_quantity: 20,
      force: true
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.ingredient_id) {
      throw new Error('Ingredient creation failed');
    }
    ingredientId = response.data.ingredient_id;
  });
  
  if (ingredientId) {
    await runTest('Actualizează ingredient cu max_stock, safety_stock, reorder_quantity', async () => {
      const response = await authenticatedRequest('PUT', `${BASE_URL}/api/ingredients/${ingredientId}`, {
        max_stock: 100,
        safety_stock: 15,
        reorder_quantity: 30
      });
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Ingredient update failed');
      }
    });
  }
}

// TESTE SĂPTĂMÂNA 1: Recalculare automată cost
async function testRecalculateCosts() {
  console.log('\n📦 SĂPTĂMÂNA 1: Recalculare automată cost');
  
  await runTest('Recalculare manuală toate costurile', async () => {
    const response = await authenticatedRequest('POST', `${BASE_URL}/api/recipes/recalculate-all-costs`);
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Recalculation failed');
    }
    if (!response.data.hasOwnProperty('processed')) {
      throw new Error('Missing processed count');
    }
  });
  
  await runTest('Status queue recalculare', async () => {
    const response = await authenticatedRequest('GET', `${BASE_URL}/api/recipes/recalculation-queue`);
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Queue status failed');
    }
    if (!response.data.queue || !Array.isArray(response.data.queue)) {
      throw new Error('Invalid queue response');
    }
  });
}

// TESTE SĂPTĂMÂNA 2: LIFO Implementation
async function testLIFO() {
  console.log('\n📦 SĂPTĂMÂNA 2: LIFO Implementation');
  
  await runTest('Obține metoda de evaluare configurată (default FIFO)', async () => {
    const response = await authenticatedRequest('GET', `${BASE_URL}/api/settings/stock-valuation`);
    
    if (response.status !== 200 || !response.data.success || !response.data.config) {
      throw new Error('Get stock valuation failed');
    }
    if (!['FIFO', 'LIFO', 'AVERAGE'].includes(response.data.config.method)) {
      throw new Error('Invalid method');
    }
  });
  
  await runTest('Actualizează metoda de evaluare la LIFO', async () => {
    const response = await authenticatedRequest('PUT', `${BASE_URL}/api/settings/stock-valuation`, {
      method: 'LIFO'
    });
    
    if (response.status !== 200 || !response.data.success || response.data.method !== 'LIFO') {
      throw new Error('LIFO update failed');
    }
  });
  
  await runTest('Actualizează metoda de evaluare la AVERAGE', async () => {
    const response = await authenticatedRequest('PUT', `${BASE_URL}/api/settings/stock-valuation`, {
      method: 'AVERAGE'
    });
    
    if (response.status !== 200 || !response.data.success || response.data.method !== 'AVERAGE') {
      throw new Error('AVERAGE update failed');
    }
  });
  
  await runTest('Eroare metodă invalidă', async () => {
    try {
      const response = await authenticatedRequest('PUT', `${BASE_URL}/api/settings/stock-valuation`, {
        method: 'INVALID'
      });
      
      if (response.status !== 400) {
        throw new Error('Expected 400 for invalid method');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected
      } else {
        throw error;
      }
    }
  });
  
  await runTest('Restaurează metoda la FIFO', async () => {
    const response = await authenticatedRequest('PUT', `${BASE_URL}/api/settings/stock-valuation`, {
      method: 'FIFO'
    });
    
    if (response.status !== 200 || !response.data.success || response.data.method !== 'FIFO') {
      throw new Error('FIFO restore failed');
    }
  });
}

// TESTE SĂPTĂMÂNA 2: Average Cost
async function testAverageCost() {
  console.log('\n📦 SĂPTĂMÂNA 2: Average Cost');
  
  await runTest('Recalculează toate costurile medii', async () => {
    const response = await authenticatedRequest('POST', `${BASE_URL}/api/ingredients/recalculate-average-costs`);
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Recalculate average costs failed');
    }
    if (!response.data.hasOwnProperty('processed')) {
      throw new Error('Missing processed count');
    }
  });
  
  await runTest('Obține cost mediu pentru ingredient', async () => {
    // Obține un ingredient existent
    const ingredientsResponse = await axios.get(`${BASE_URL}/api/ingredients`, { timeout: 5000 });
    
    if (ingredientsResponse.status === 200 && ingredientsResponse.data.length > 0) {
      const ingredientId = ingredientsResponse.data[0].id;
      
      const response = await authenticatedRequest('GET', `${BASE_URL}/api/ingredients/${ingredientId}/average-cost`);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Get average cost failed');
      }
      if (typeof response.data.averageCost !== 'number') {
        throw new Error('Invalid average cost type');
      }
    } else {
      console.log('   ⚠️ Nu există ingrediente pentru testare');
    }
  });
}

// TESTE SĂPTĂMÂNA 2: Cost History
async function testCostHistory() {
  console.log('\n📦 SĂPTĂMÂNA 2: Cost History');
  
  await runTest('Obține istoric cost pentru ingredient', async () => {
    // Obține un ingredient existent
    const ingredientsResponse = await axios.get(`${BASE_URL}/api/ingredients`, { timeout: 5000 });
    
    if (ingredientsResponse.status === 200 && ingredientsResponse.data.length > 0) {
      const ingredientId = ingredientsResponse.data[0].id;
      
      const response = await authenticatedRequest('GET', `${BASE_URL}/api/ingredients/${ingredientId}/cost-history`);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Get cost history failed');
      }
      if (!response.data.history || !Array.isArray(response.data.history)) {
        throw new Error('Invalid history response');
      }
    } else {
      console.log('   ⚠️ Nu există ingrediente pentru testare');
    }
  });
  
  await runTest('Adaugă manual intrare în istoric cost', async () => {
    // Obține un ingredient existent
    const ingredientsResponse = await axios.get(`${BASE_URL}/api/ingredients`, { timeout: 5000 });
    
    if (ingredientsResponse.status === 200 && ingredientsResponse.data.length > 0) {
      const ingredientId = ingredientsResponse.data[0].id;
      
      const response = await authenticatedRequest('POST', `${BASE_URL}/api/ingredients/${ingredientId}/cost-history`, {
        old_cost: 10.50,
        new_cost: 12.00,
        change_reason: 'manual_test'
      });
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Add cost history failed');
      }
    } else {
      console.log('   ⚠️ Nu există ingrediente pentru testare');
    }
  });
}

// TESTE SĂPTĂMÂNA 2: Purchase Units
async function testPurchaseUnits() {
  console.log('\n📦 SĂPTĂMÂNA 2: Purchase Units');
  
  let ingredientId = null;
  
  await runTest('Creează ingredient cu purchase units', async () => {
    const response = await authenticatedRequest('POST', `${BASE_URL}/api/ingredients`, {
      name: `Test Purchase Units ${Date.now()}`,
      category: 'Test',
      unit: 'kg',
      purchase_unit: 'cutie',
      recipe_unit: 'g',
      inventory_unit: 'kg',
      purchase_to_inventory_factor: 25,
      inventory_to_recipe_factor: 1000,
      force: true
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.ingredient_id) {
      throw new Error('Ingredient creation with purchase units failed');
    }
    ingredientId = response.data.ingredient_id;
  });
  
  if (ingredientId) {
    await runTest('Actualizează ingredient cu purchase units', async () => {
      const response = await authenticatedRequest('PUT', `${BASE_URL}/api/ingredients/${ingredientId}`, {
        purchase_unit: 'bax',
        recipe_unit: 'ml',
        inventory_unit: 'l',
        purchase_to_inventory_factor: 10,
        inventory_to_recipe_factor: 1000
      });
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Ingredient update with purchase units failed');
      }
    });
  }
}

// Funcție principală
async function runAllTests() {
  console.log('🚀 Testare secvențială a tuturor endpoint-urilor P0-P1');
  console.log(`📍 BASE_URL: ${BASE_URL}`);
  console.log(`⏰ Start: ${new Date().toISOString()}\n`);
  
  // Test conectivitate server
  console.log('🔍 Verific conectivitate server...');
  try {
    const healthCheck = await axios.get(`${BASE_URL}/api/units/list`, { timeout: 3000 });
    console.log('✅ Serverul răspunde!\n');
  } catch (error) {
    console.log('❌ Serverul nu răspunde! Verifică că rulează pe portul 3001.');
    console.log(`   Eroare: ${error.message}`);
    process.exit(1);
  }
  
  try {
    await testUnitConversion();
    await delay(1000);
    
    await testSubRecipes();
    await delay(1000);
    
    await testScalingRecipes();
    await delay(1000);
    
    await testYieldMaxStock();
    await delay(1000);
    
    await testRecalculateCosts();
    await delay(1000);
    
    await testLIFO();
    await delay(1000);
    
    await testAverageCost();
    await delay(1000);
    
    await testCostHistory();
    await delay(1000);
    
    await testPurchaseUnits();
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 REZULTATE FINALE:`);
    console.log(`   ✅ Trecute: ${passed}`);
    console.log(`   ❌ Eșuate: ${failed}`);
    console.log(`   📈 Total: ${passed + failed}`);
    console.log('='.repeat(60));
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Eroare fatală:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runAllTests();

