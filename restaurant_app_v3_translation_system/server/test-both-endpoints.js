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
    console.log('\n=== Testing Bar vs KDS (Orders #4810 and #4811) ===\n');

    try {
        // Check kitchen alias route
        const kitchenResult = await testEndpoint('/api/orders/orders-display/kitchen');
        const order4810 = kitchenResult.orders?.find(o => o.id === 4810);

        if (order4810) {
            console.log('✅ KITCHEN: Order #4810 FOUND');
            console.log(`  Status: ${order4810.status}`);
        } else {
            console.log('❌ KITCHEN: Order #4810 NOT FOUND');
        }

        // Check bar alias route
        const barResult = await testEndpoint('/api/orders/orders-display/bar');
        const order4811 = barResult.orders?.find(o => o.id === 4811);

        if (order4811) {
            console.log('✅ BAR: Order #4811 FOUND');
            console.log(`  Status: ${order4811.status}`);
        } else {
            console.log('❌ BAR: Order #4811 NOT FOUND');
        }

    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
})();
