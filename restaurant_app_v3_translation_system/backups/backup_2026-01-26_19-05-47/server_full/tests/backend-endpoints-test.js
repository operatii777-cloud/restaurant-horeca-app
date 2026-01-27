/**
 * BACKEND ENDPOINTS COMPREHENSIVE TEST SUITE
 * 
 * Tests:
 * 1. Functional tests - Verifică că fiecare endpoint răspunde corect
 * 2. Performance tests - Response time < 200ms pentru GET, < 500ms pentru POST
 * 3. Security tests - Auth, SQL injection, XSS protection
 * 4. Load tests - Concurrent users, stress testing
 * 
 * Usage: node tests/backend-endpoints-test.js
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = null; // Will be populated after login
const CONCURRENT_USERS = 50;
const STRESS_REQUESTS = 100;

// Test results storage
const results = {
  functional: [],
  performance: [],
  security: [],
  load: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// ========================================
// MODULE REGISTRY - All Endpoints to Test
// ========================================
const ENDPOINTS_TO_TEST = [
  // SAFE MODULES
  { module: 'variance', method: 'GET', path: '/api/variance/daily', requiresAuth: false },
  { module: 'technical-sheets', method: 'GET', path: '/api/technical-sheets', requiresAuth: false },
  { module: 'recalls', method: 'GET', path: '/api/recalls', requiresAuth: false },
  { module: 'expiry-alerts', method: 'GET', path: '/api/expiry-alerts', requiresAuth: false },
  { module: 'portions', method: 'GET', path: '/api/portions', requiresAuth: false },
  { module: 'smart-restock', method: 'GET', path: '/api/smart-restock-v2/analysis', requiresAuth: false },
  { module: 'hostess', method: 'GET', path: '/api/hostess/tables', requiresAuth: false },
  { module: 'lostfound', method: 'GET', path: '/api/lostfound/items', requiresAuth: false },
  { module: 'coatroom', method: 'GET', path: '/api/coatroom/tickets', requiresAuth: false },
  { module: 'laundry', method: 'GET', path: '/api/laundry/items', requiresAuth: false },
  { module: 'reports', method: 'GET', path: '/api/reports/delivery-performance', requiresAuth: false },
  { module: 'stats', method: 'GET', path: '/api/stats/delivery', requiresAuth: false },
  
  // CORE MODULES
  { module: 'stocks', method: 'GET', path: '/api/stocks/ingredients', requiresAuth: false },
  { module: 'catalog', method: 'GET', path: '/api/catalog/categories', requiresAuth: false },
  { module: 'admin', method: 'GET', path: '/api/admin/health', requiresAuth: false },
  { module: 'orders', method: 'GET', path: '/api/orders', requiresAuth: false },
  { module: 'delivery', method: 'GET', path: '/api/orders/delivery', requiresAuth: false },
  { module: 'delivery-kpi', method: 'GET', path: '/api/delivery/kpi', requiresAuth: false },
  { module: 'bi', method: 'GET', path: '/api/bi/sales-summary', requiresAuth: false },
  { module: 'suppliers', method: 'GET', path: '/api/suppliers', requiresAuth: false },
  { module: 'customers', method: 'GET', path: '/api/customers', requiresAuth: false },
  { module: 'allergens', method: 'GET', path: '/api/allergens', requiresAuth: false },
  { module: 'food-cost', method: 'GET', path: '/api/food-cost/analysis', requiresAuth: false },
  
  // ENTERPRISE MODULES
  { module: 'webhooks', method: 'GET', path: '/api/webhooks', requiresAuth: false },
  { module: 'compliance', method: 'GET', path: '/api/compliance/equipment', requiresAuth: false },
  { module: 'gift-cards', method: 'GET', path: '/api/gift-cards', requiresAuth: false },
  { module: 'loyalty', method: 'GET', path: '/api/loyalty/programs', requiresAuth: false },
  { module: 'reservations', method: 'GET', path: '/api/reservations', requiresAuth: false },
  { module: 'waitlist', method: 'GET', path: '/api/waitlist', requiresAuth: false },
  
  // FINANCIAL
  { module: 'cogs', method: 'GET', path: '/api/cogs/product-profitability', requiresAuth: false },
  { module: 'financial', method: 'GET', path: '/api/financial/daily-summary', requiresAuth: false },
  
  // TIPIZATE
  { module: 'tipizate', method: 'GET', path: '/api/tipizate/nir', requiresAuth: false },
];

// ========================================
// UTILITY FUNCTIONS
// ========================================

function log(type, message, data = null) {
  const timestamp = new Date().toISOString();
  const colors = {
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    info: '\x1b[36m',
    reset: '\x1b[0m'
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}[${timestamp}] ${type.toUpperCase()}: ${message}${colors.reset}`);
  
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function makeRequest(method, path, data = null, headers = {}) {
  const start = performance.now();
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    const duration = performance.now() - start;
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      duration,
      headers: response.headers
    };
  } catch (error) {
    const duration = performance.now() - start;
    
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.message,
      duration,
      details: error.response?.data
    };
  }
}

// ========================================
// TEST 1: FUNCTIONAL TESTS
// ========================================

async function runFunctionalTests() {
  log('info', '🔍 Starting Functional Tests...');
  log('info', `Testing ${ENDPOINTS_TO_TEST.length} endpoints`);
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    results.summary.total++;
    
    log('info', `Testing ${endpoint.method} ${endpoint.path}`);
    
    const result = await makeRequest(endpoint.method, endpoint.path);
    
    const testResult = {
      module: endpoint.module,
      method: endpoint.method,
      path: endpoint.path,
      status: result.status,
      success: result.success,
      duration: Math.round(result.duration),
      error: result.error,
      timestamp: new Date().toISOString()
    };
    
    results.functional.push(testResult);
    
    if (result.success) {
      results.summary.passed++;
      log('success', `✓ ${endpoint.path} - ${result.status} (${Math.round(result.duration)}ms)`);
    } else {
      if (result.status === 404) {
        results.summary.warnings++;
        log('warning', `⚠ ${endpoint.path} - 404 Not Found (endpoint may not be implemented)`);
      } else {
        results.summary.failed++;
        log('error', `✗ ${endpoint.path} - ${result.status} ${result.error}`);
      }
    }
    
    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  log('info', `Functional Tests Complete: ${results.summary.passed}/${results.summary.total} passed`);
}

// ========================================
// TEST 2: PERFORMANCE TESTS
// ========================================

async function runPerformanceTests() {
  log('info', '⚡ Starting Performance Tests...');
  
  // Test only successful endpoints
  const successfulEndpoints = results.functional
    .filter(r => r.success)
    .slice(0, 20); // Test first 20 successful endpoints
  
  for (const endpoint of successfulEndpoints) {
    // Run 10 times and calculate average
    const durations = [];
    
    for (let i = 0; i < 10; i++) {
      const result = await makeRequest(endpoint.method, endpoint.path);
      if (result.success) {
        durations.push(result.duration);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    if (durations.length > 0) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      const performanceResult = {
        module: endpoint.module,
        path: endpoint.path,
        avgDuration: Math.round(avgDuration),
        maxDuration: Math.round(maxDuration),
        minDuration: Math.round(minDuration),
        samples: durations.length,
        timestamp: new Date().toISOString()
      };
      
      results.performance.push(performanceResult);
      
      // Performance thresholds
      const threshold = endpoint.method === 'GET' ? 200 : 500;
      
      if (avgDuration < threshold) {
        log('success', `✓ ${endpoint.path} - Avg: ${Math.round(avgDuration)}ms (< ${threshold}ms)`);
      } else if (avgDuration < threshold * 2) {
        log('warning', `⚠ ${endpoint.path} - Avg: ${Math.round(avgDuration)}ms (slow but acceptable)`);
      } else {
        log('error', `✗ ${endpoint.path} - Avg: ${Math.round(avgDuration)}ms (TOO SLOW!)`);
      }
    }
  }
  
  log('info', `Performance Tests Complete: ${results.performance.length} endpoints tested`);
}

// ========================================
// TEST 3: SECURITY TESTS
// ========================================

async function runSecurityTests() {
  log('info', '🔒 Starting Security Tests...');
  
  // Test 1: SQL Injection attempts
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "1'; DROP TABLE users--",
    "admin'--",
    "' UNION SELECT NULL--"
  ];
  
  const testEndpoint = '/api/admin/health'; // Safe endpoint for testing
  
  for (const payload of sqlInjectionPayloads) {
    const result = await makeRequest('GET', `${testEndpoint}?id=${encodeURIComponent(payload)}`);
    
    const securityResult = {
      test: 'SQL Injection',
      payload,
      blocked: !result.success || result.status !== 200,
      status: result.status,
      timestamp: new Date().toISOString()
    };
    
    results.security.push(securityResult);
    
    if (securityResult.blocked) {
      log('success', `✓ SQL Injection blocked: ${payload}`);
    } else {
      log('error', `✗ SQL Injection NOT blocked: ${payload}`);
    }
  }
  
  // Test 2: XSS attempts
  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')"
  ];
  
  for (const payload of xssPayloads) {
    const result = await makeRequest('GET', `${testEndpoint}?search=${encodeURIComponent(payload)}`);
    
    const securityResult = {
      test: 'XSS',
      payload,
      blocked: !result.success || result.status !== 200 || !JSON.stringify(result.data).includes(payload),
      status: result.status,
      timestamp: new Date().toISOString()
    };
    
    results.security.push(securityResult);
    
    if (securityResult.blocked) {
      log('success', `✓ XSS blocked/sanitized: ${payload}`);
    } else {
      log('warning', `⚠ XSS may not be sanitized: ${payload}`);
    }
  }
  
  // Test 3: Authentication bypass
  const protectedEndpoints = ENDPOINTS_TO_TEST.filter(e => e.requiresAuth);
  
  for (const endpoint of protectedEndpoints.slice(0, 5)) {
    const result = await makeRequest(endpoint.method, endpoint.path); // No auth token
    
    const securityResult = {
      test: 'Authentication',
      endpoint: endpoint.path,
      requiresAuth: endpoint.requiresAuth,
      blocked: result.status === 401 || result.status === 403,
      status: result.status,
      timestamp: new Date().toISOString()
    };
    
    results.security.push(securityResult);
    
    if (securityResult.blocked) {
      log('success', `✓ Auth protected: ${endpoint.path}`);
    } else {
      log('warning', `⚠ Auth NOT enforced: ${endpoint.path}`);
    }
  }
  
  log('info', `Security Tests Complete: ${results.security.length} tests performed`);
}

// ========================================
// TEST 4: LOAD TESTS
// ========================================

async function runLoadTests() {
  log('info', '🚀 Starting Load Tests...');
  
  // Select best performing endpoint for load testing
  const bestEndpoint = results.performance
    .sort((a, b) => a.avgDuration - b.avgDuration)[0];
  
  if (!bestEndpoint) {
    log('warning', 'No endpoint available for load testing');
    return;
  }
  
  log('info', `Load testing endpoint: ${bestEndpoint.path}`);
  
  // Test 1: Concurrent users
  log('info', `Simulating ${CONCURRENT_USERS} concurrent users...`);
  
  const concurrentStart = performance.now();
  const concurrentPromises = [];
  
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    concurrentPromises.push(makeRequest('GET', bestEndpoint.path));
  }
  
  const concurrentResults = await Promise.all(concurrentPromises);
  const concurrentDuration = performance.now() - concurrentStart;
  
  const successfulConcurrent = concurrentResults.filter(r => r.success).length;
  const failedConcurrent = concurrentResults.filter(r => !r.success).length;
  
  const loadResult1 = {
    test: 'Concurrent Users',
    users: CONCURRENT_USERS,
    successful: successfulConcurrent,
    failed: failedConcurrent,
    totalDuration: Math.round(concurrentDuration),
    avgDuration: Math.round(concurrentDuration / CONCURRENT_USERS),
    timestamp: new Date().toISOString()
  };
  
  results.load.push(loadResult1);
  
  log('info', `Concurrent test: ${successfulConcurrent}/${CONCURRENT_USERS} successful in ${Math.round(concurrentDuration)}ms`);
  
  // Test 2: Stress test (rapid fire requests)
  log('info', `Stress testing: ${STRESS_REQUESTS} rapid requests...`);
  
  const stressStart = performance.now();
  let stressSuccessful = 0;
  let stressFailed = 0;
  
  for (let i = 0; i < STRESS_REQUESTS; i++) {
    const result = await makeRequest('GET', bestEndpoint.path);
    if (result.success) {
      stressSuccessful++;
    } else {
      stressFailed++;
    }
    // No delay - rapid fire!
  }
  
  const stressDuration = performance.now() - stressStart;
  const requestsPerSecond = Math.round((STRESS_REQUESTS / stressDuration) * 1000);
  
  const loadResult2 = {
    test: 'Stress Test',
    requests: STRESS_REQUESTS,
    successful: stressSuccessful,
    failed: stressFailed,
    totalDuration: Math.round(stressDuration),
    requestsPerSecond,
    timestamp: new Date().toISOString()
  };
  
  results.load.push(loadResult2);
  
  log('info', `Stress test: ${stressSuccessful}/${STRESS_REQUESTS} successful, ${requestsPerSecond} req/s`);
  
  log('info', `Load Tests Complete: ${results.load.length} tests performed`);
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runAllTests() {
  console.clear();
  log('info', '═══════════════════════════════════════════════════════');
  log('info', '  RESTAURANT APP - BACKEND COMPREHENSIVE TEST SUITE');
  log('info', '═══════════════════════════════════════════════════════');
  log('info', '');
  
  const startTime = performance.now();
  
  try {
    // Check if backend is running
    log('info', 'Checking if backend is running...');
    const healthCheck = await makeRequest('GET', '/api/admin/health');
    
    if (!healthCheck.success) {
      log('error', 'Backend is not running! Please start the server first.');
      log('info', 'Run: cd server && npm start');
      process.exit(1);
    }
    
    log('success', 'Backend is running! ✓');
    log('info', '');
    
    // Run all test suites
    await runFunctionalTests();
    log('info', '');
    
    await runPerformanceTests();
    log('info', '');
    
    await runSecurityTests();
    log('info', '');
    
    await runLoadTests();
    log('info', '');
    
    // Generate final report
    const totalDuration = performance.now() - startTime;
    
    log('info', '═══════════════════════════════════════════════════════');
    log('info', '  TEST RESULTS SUMMARY');
    log('info', '═══════════════════════════════════════════════════════');
    log('info', '');
    log('info', `Total Tests: ${results.summary.total}`);
    log('success', `Passed: ${results.summary.passed}`);
    log('error', `Failed: ${results.summary.failed}`);
    log('warning', `Warnings: ${results.summary.warnings}`);
    log('info', '');
    log('info', `Functional Tests: ${results.functional.length}`);
    log('info', `Performance Tests: ${results.performance.length}`);
    log('info', `Security Tests: ${results.security.length}`);
    log('info', `Load Tests: ${results.load.length}`);
    log('info', '');
    log('info', `Total Duration: ${Math.round(totalDuration / 1000)}s`);
    log('info', '');
    
    // Save results to file
    const fs = require('fs');
    const reportPath = 'tests/backend-test-results.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log('success', `Full report saved to: ${reportPath}`);
    
    // Success rate
    const successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
    log('info', '');
    log('info', `Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
      log('success', '✓ Backend tests PASSED! System is healthy.');
    } else if (successRate >= 60) {
      log('warning', '⚠ Backend tests show some issues. Review failed endpoints.');
    } else {
      log('error', '✗ Backend tests FAILED! Critical issues detected.');
    }
    
  } catch (error) {
    log('error', 'Test suite crashed!', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().then(() => {
    process.exit(0);
  }).catch(error => {
    log('error', 'Fatal error', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, results };

