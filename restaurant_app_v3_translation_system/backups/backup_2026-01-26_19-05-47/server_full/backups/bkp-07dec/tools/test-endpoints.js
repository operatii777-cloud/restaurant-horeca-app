/**
 * Auto-Generated Backend Endpoint Tester
 * 
 * Purpose: Test all critical backend endpoints from audit
 * Usage: node tools/test-endpoints.js [baseUrl]
 * 
 * Exit code: Always 0 (for debugging, not CI fail)
 */

const http = require('http');
const https = require('https');

// Critical endpoints from audit
const ENDPOINTS = [
  { path: '/api/variance/daily', method: 'GET' },
  { path: '/api/variance/calculate', method: 'POST' },
  { path: '/api/technical-sheets', method: 'GET' },
  { path: '/api/technical-sheets/generate', method: 'POST' },
  { path: '/api/recalls', method: 'GET' },
  { path: '/api/expiry-alerts', method: 'GET' },
  { path: '/api/portions', method: 'GET' },
  { path: '/api/smart-restock-v2/analysis', method: 'GET' },
  { path: '/api/smart-restock-v2/generate-order', method: 'POST' },
  { path: '/api/hostess/tables', method: 'GET' },
  { path: '/api/hostess/stats', method: 'GET' },
  { path: '/api/hostess/sessions', method: 'GET' },
  { path: '/api/lostfound/items', method: 'GET' },
  { path: '/api/lostfound/stats', method: 'GET' },
  { path: '/api/coatroom/tickets', method: 'GET' },
  { path: '/api/coatroom/stats', method: 'GET' },
  { path: '/api/reports/delivery-performance', method: 'GET' },
  { path: '/api/reports/drive-thru-performance', method: 'GET' },
];

// Get base URL from command line or use default
const BASE_URL = process.argv[2] || 'http://localhost:3001';

// Parse URL
const url = new URL(BASE_URL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

// Results storage
const results = [];

/**
 * Test a single endpoint
 */
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const requestPath = endpoint.path;
    const fullUrl = `${BASE_URL}${requestPath}`;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: requestPath,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Endpoint-Tester/1.0',
      },
      timeout: 10000, // 10 seconds timeout
    };

    // For POST requests, add empty body
    if (endpoint.method === 'POST') {
      const postData = JSON.stringify({});
      options.headers['Content-Length'] = Buffer.byteLength(postData);
      
      const req = client.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const status = res.statusCode;
          const statusText = status >= 200 && status < 300 ? 'OK' :
                           status === 401 || status === 403 ? 'AUTH' :
                           status === 404 ? 'NOT FOUND' :
                           status >= 500 ? 'ERROR' : 'UNKNOWN';
          
          resolve({
            endpoint: requestPath,
            method: endpoint.method,
            status: statusText,
            statusCode: status,
            time: responseTime,
            error: null,
          });
        });
      });
      
      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: requestPath,
          method: endpoint.method,
          status: 'ERROR',
          statusCode: null,
          time: responseTime,
          error: error.message,
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: requestPath,
          method: endpoint.method,
          status: 'TIMEOUT',
          statusCode: null,
          time: responseTime,
          error: 'Request timeout (10s)',
        });
      });
      
      req.write(postData);
      req.end();
    } else {
      // GET request
      const req = client.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const status = res.statusCode;
          const statusText = status >= 200 && status < 300 ? 'OK' :
                           status === 401 || status === 403 ? 'AUTH' :
                           status === 404 ? 'NOT FOUND' :
                           status >= 500 ? 'ERROR' : 'UNKNOWN';
          
          resolve({
            endpoint: requestPath,
            method: endpoint.method,
            status: statusText,
            statusCode: status,
            time: responseTime,
            error: null,
          });
        });
      });
      
      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: requestPath,
          method: endpoint.method,
          status: 'ERROR',
          statusCode: null,
          time: responseTime,
          error: error.message,
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: requestPath,
          method: endpoint.method,
          status: 'TIMEOUT',
          statusCode: null,
          time: responseTime,
          error: 'Request timeout (10s)',
        });
      });
      
      req.end();
    }
  });
}

/**
 * Format table row
 */
function formatRow(result) {
  const endpoint = result.endpoint.padEnd(45);
  const method = result.method.padEnd(6);
  const status = result.status.padEnd(10);
  const time = `${result.time}ms`.padEnd(8);
  const error = result.error ? result.error.substring(0, 30) : '-';
  
  return `| ${endpoint} | ${method} | ${status} | ${time} | ${error} |`;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Backend Endpoint Tester');
  console.log('='.repeat(80));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing ${ENDPOINTS.length} endpoints...\n`);
  
  // Test all endpoints sequentially (to avoid overwhelming the server)
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Show progress
    const statusIcon = result.status === 'OK' ? '✅' :
                      result.status === 'AUTH' ? '🔒' :
                      result.status === 'NOT FOUND' ? '❌' :
                      result.status === 'ERROR' ? '💥' :
                      result.status === 'TIMEOUT' ? '⏱️' : '⚠️';
    console.log(`${statusIcon} ${endpoint.method} ${endpoint.path} - ${result.status} (${result.time}ms)`);
  }
  
  // Print table
  console.log('\n' + '='.repeat(80));
  console.log('RESULTS TABLE');
  console.log('='.repeat(80));
  console.log('| Endpoint'.padEnd(47) + ' | Method | Status'.padEnd(12) + ' | Time(ms) | Error'.padEnd(32) + ' |');
  console.log('|' + '-'.repeat(45) + '|' + '-'.repeat(8) + '|' + '-'.repeat(12) + '|' + '-'.repeat(10) + '|' + '-'.repeat(34) + '|');
  
  results.forEach(result => {
    console.log(formatRow(result));
  });
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  
  const ok = results.filter(r => r.status === 'OK').length;
  const auth = results.filter(r => r.status === 'AUTH').length;
  const notFound = results.filter(r => r.status === 'NOT FOUND').length;
  const error = results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT').length;
  const unknown = results.filter(r => r.status === 'UNKNOWN').length;
  
  console.log(`✅ OK:           ${ok}`);
  console.log(`🔒 AUTH (401/403): ${auth}`);
  console.log(`❌ NOT FOUND:    ${notFound}`);
  console.log(`💥 ERROR/TIMEOUT: ${error}`);
  console.log(`⚠️  UNKNOWN:     ${unknown}`);
  console.log(`📊 Total:        ${results.length}`);
  
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  console.log(`⏱️  Avg Time:     ${Math.round(avgTime)}ms`);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Testing complete (exit code: 0)');
  
  // Always exit with 0 (for debugging, not CI fail)
  process.exit(0);
}

// Run tests
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(0); // Still exit with 0
});

