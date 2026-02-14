const http = require('http');

function testEndpoint(type) {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/menu/pdf/builder/config?type=${type}`,
        method: 'GET'
    };

    console.log(`Testing: ${options.path}`);

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('BODY:', data.substring(0, 500)); // Log first 500 chars
        });
    });

    req.on('error', (e) => {
        console.error(`ERROR: ${e.message}`);
    });

    req.end();
}

testEndpoint('food');
testEndpoint('drinks');
