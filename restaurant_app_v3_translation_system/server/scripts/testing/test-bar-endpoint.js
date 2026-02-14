const http = require('http');

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
    console.log('\n=== Testing Bar Orders (Order #4811) ===\n');

    try {
        // Check alias route
        const result = await testEndpoint('/api/orders/orders-display/bar');
        const order4811 = result.orders?.find(o => o.id === 4811);

        if (!order4811) {
            console.log('❌ Order #4811 NOT FOUND in /api/orders/orders-display/bar');
            console.log(`Total orders returned: ${result.orders?.length || 0}`);
        } else {
            console.log('✅ Order #4811 FOUND in /api/orders/orders-display/bar');
            console.log(`  Status: ${order4811.status}`);
            console.log('  Items:');
            order4811.items?.forEach(item => {
                console.log(`    - ${item.name} (${item.station}), Status: ${item.status}`);
            });
        }

    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
})();
