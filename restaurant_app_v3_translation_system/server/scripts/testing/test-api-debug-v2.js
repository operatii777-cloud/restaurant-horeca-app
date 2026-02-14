const http = require('http');

function testEndpoint(type) {
    const options = {
        hostname: '127.0.0.1',
        port: 3001,
        path: `/api/menu/pdf/builder/config?type=${type}`,
        method: 'GET'
    };

    console.log(`Testing: http://${options.hostname}:${options.port}${options.path}`);

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('BODY:', data.substring(0, 500));
        });
    });

    req.on('error', (e) => {
        console.error(`ERROR: ${e.code} - ${e.message}`);
    });

    req.end();
}

testEndpoint('food');
setTimeout(() => testEndpoint('drinks'), 500);
