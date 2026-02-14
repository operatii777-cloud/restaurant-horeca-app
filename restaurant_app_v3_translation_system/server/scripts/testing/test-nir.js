const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function test() {
    try {
        console.log('🔍 Searching...');
        // Cautam ceva generic care sa returneze rezultate (ex: "ing" sau "test" sau "prod")
        const search = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/inventory/products/search?q=apa',
            method: 'GET'
        });

        console.log('Search Status:', search.status);
        // console.log('Search Body:', JSON.stringify(search.data, null, 2));

        if (!Array.isArray(search.data) || search.data.length === 0) {
            console.log('Search Response:', search.data);
            throw new Error('Search returned no items or error');
        }

        const item = search.data[0];
        console.log('📦 Selected item:', item);

        const nirData = {
            nirNumber: "TEST-" + Date.now(),
            date: new Date().toISOString().split('T')[0],
            supplierName: "Test Supplier Error 500",
            items: [
                {
                    name: item.name,
                    code: item.code,
                    unit: item.unit,
                    qtyReceived: 10,
                    quantity: 10,
                    priceExVat: 5,
                    valueExVat: 50,
                    vatRate: 19,
                    // trimitem si alte campuri pentru a vedea daca ajuta
                    official_name: item.official_name || item.name,
                    category: item.category || 'Materii Prime'
                }
            ]
        };

        console.log('📝 Creating NIR with payload:', JSON.stringify(nirData, null, 2));

        // Facem POST request corect
        const postData = JSON.stringify(nirData);
        const nir = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/inventory/nir',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, JSON.parse(postData)); // makeRequest face stringify intern, dar am implementat prost makeRequest in iteratia anterioara?
        // Nu, makeRequest face stringify daca primeste data.

        console.log('NIR Creation Response Status:', nir.status);
        console.log('NIR Creation Response Body:', JSON.stringify(nir.data, null, 2));

    } catch (e) {
        console.error('❌ Error:', e);
    }
}

test();
