const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001, // Assuming default port
    path: '/api/menu/pdf/builder/config?type=food',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`SUCCESS: ${json.success}`);
            console.log(`CATEGORIES COUNT: ${json.categories ? json.categories.length : 0}`);
        } catch (e) {
            console.log('RESPONSE is not JSON');
            console.log(data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
});

req.end();
