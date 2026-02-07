const http = require('http');

// Test the KDS endpoint
const testEndpoint = (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
};

(async () => {
    console.log('\n=== Testing KDS Endpoints ===\n');

    // Test 1: Direct endpoint
    console.log('1. Testing /api/orders/display/kitchen/unfinished');
    try {
        const result1 = await testEndpoint('/api/orders/display/kitchen/unfinished');
        const order4810 = result1.orders?.find(o => o.id === 4810);
        console.log(`   Found ${result1.orders?.length || 0} orders`);
        console.log(`   Order #4810: ${order4810 ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        if (order4810) {
            console.log(`   Status: ${order4810.status}`);
            console.log(`   Items: ${order4810.items?.length || 0}`);
        }
    } catch (error) {
        console.log(`   ERROR: ${error.message}`);
    }

    console.log('');

    // Test 2: Alias endpoint
    console.log('2. Testing /api/orders/orders-display/kitchen (alias)');
    try {
        const result2 = await testEndpoint('/api/orders/orders-display/kitchen');
        const order4810 = result2.orders?.find(o => o.id === 4810);
        console.log(`   Found ${result2.orders?.length || 0} orders`);
        console.log(`   Order #4810: ${order4810 ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        if (order4810) {
            console.log(`   Status: ${order4810.status}`);
            console.log(`   Items: ${order4810.items?.length || 0}`);
        }
    } catch (error) {
        console.log(`   ERROR: ${error.message}`);
    }

    console.log('\n=== Test Complete ===\n');
})();
