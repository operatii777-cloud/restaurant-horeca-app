const http = require('http');

// Test the KDS endpoint and show full order details
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
    console.log('\n=== Detailed Order #4810 Analysis ===\n');

    try {
        const result = await testEndpoint('/api/orders/orders-display/kitchen');
        const order4810 = result.orders?.find(o => o.id === 4810);

        if (!order4810) {
            console.log('❌ Order #4810 NOT FOUND in response');
            console.log(`Total orders returned: ${result.orders?.length || 0}`);
            return;
        }

        console.log('✅ Order #4810 FOUND');
        console.log('\nOrder Details:');
        console.log(`  ID: ${order4810.id}`);
        console.log(`  Status: "${order4810.status}"`);
        console.log(`  Table: ${order4810.table_number || order4810.table}`);
        console.log(`  Type: ${order4810.type}`);
        console.log(`  Platform: ${order4810.platform}`);
        console.log(`  Timestamp: ${order4810.timestamp}`);

        console.log('\nItems:');
        if (order4810.items && order4810.items.length > 0) {
            order4810.items.forEach((item, idx) => {
                console.log(`  Item ${idx + 1}:`);
                console.log(`    Name: ${item.name}`);
                console.log(`    Station: ${item.station || 'NOT SET'}`);
                console.log(`    Category: ${item.category || item.category_name || 'NOT SET'}`);
                console.log(`    Quantity: ${item.quantity || item.qty}`);
                console.log(`    Status: ${item.status || 'NOT SET'}`);
            });
        } else {
            console.log('  ❌ NO ITEMS FOUND');
        }

        console.log('\n=== Analysis Complete ===\n');
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
})();
