
const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    // Try parsing JSON, otherwise return text
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => resolve({ error: e }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer() {
    console.log('⏳ Waiting for server to come online...');
    for (let i = 0; i < 30; i++) { // 30 seconds max
        const res = await request('GET', '/api/orders-display/client-monitor'); // Use a known GET endpoint
        if (!res.error && res.status >= 200 && res.status < 500) {
            console.log('✅ Server is UP!');
            return true;
        }
        await sleep(1000);
    }
    console.error('❌ Server failed to start in time.');
    return false;
}

async function runTest() {
    if (!await waitForServer()) return;

    console.log('🚀 Starting Autonomous Test Flow...');

    // 1. Create Order
    console.log('\n📝 Creating Kiosk Order (7 Up + Cartofi Prăjiți)...');
    const orderPayload = {
        type: "takeaway",
        items: [
            { id: 126, productId: 126, quantity: 1, name: "7 Up", price: 13, category: "Răcoritoare" },
            { id: 258, productId: 258, quantity: 1, name: "Cartofi Prăjiți", price: 16, category: "Garnituri" }
        ],
        total: 29,
        is_paid: true,
        payment_method: "card",
        platform: "KIOSK",
        order_source: "KIOSK",
        customer_name: "Test Autonom"
    };

    // Try /api/create first (based on investigation)
    let createRes = await request('POST', '/api/create', orderPayload);

    if (createRes.status === 404) {
        console.log('⚠️ /api/create not found, trying /api/orders/create...');
        createRes = await request('POST', '/api/orders/create', orderPayload);
    }

    if (createRes.status !== 200) {
        console.error('❌ Create Order Failed:', createRes);
        return;
    }

    const order = createRes.data.order || (createRes.data.id ? createRes.data : null);
    const orderId = order ? order.id : null;
    console.log(`✅ Order Created: ID ${orderId}`);

    if (!orderId) {
        console.error('❌ Could not extract Order ID.');
        return;
    }

    // 2. Verify Client Monitor (InProgress)
    console.log('\n👀 Verifying Client Monitor (InProgress)...');
    await sleep(1000);
    const monitorRes = await request('GET', '/api/orders-display/client-monitor');
    const inProgressOrder = (monitorRes.data.inProgress || []).find(o => o.id == orderId);

    if (inProgressOrder) {
        console.log(`✅ Order ${orderId} found in InProgress.`);
        // Check calculated stats
        console.log(`   Kitchen Pending: ${inProgressOrder.kitchenPending} (Expected > 0)`);
        console.log(`   Bar Pending: ${inProgressOrder.barPending} (Expected > 0)`);

        if (inProgressOrder.kitchenPending > 0 && inProgressOrder.barPending > 0) {
            console.log('✅ Correct categorization of pending items.');
        } else {
            console.warn('⚠️ Pending counts mismatch!');
        }
    } else {
        console.error(`❌ Order ${orderId} NOT found in InProgress!`);
    }

    // 3. Mark Bar Item Ready
    console.log('\n🍹 Marking Bar Item (7 Up) as Ready...');
    // We explicitly target Product ID 126 as 'itemIds'
    // Assuming completeOrderItems checks item.id or product_id or similar
    const completeBarRes = await request('PUT', `/api/${orderId}/complete-items`, {
        itemIds: [126],
        station: 'Bar',
        station_type: 'bar',
        station_name: 'Bar'
    });
    console.log('   Response:', completeBarRes.data);

    // Verify monitor update
    await sleep(500);
    const monitorRes2 = await request('GET', '/api/orders-display/client-monitor');
    const orderMid = (monitorRes2.data.inProgress || []).find(o => o.id == orderId);

    if (orderMid) {
        console.log(`   Stats Update -> Bar Done: ${orderMid.barDone}, Kitchen Done: ${orderMid.kitchenDone}`);
        if (orderMid.barDone >= 1) console.log('✅ Bar item confirmed DONE.');
        else console.error('❌ Bar item NOT marked done in monitor.');
    }

    // 4. Mark Kitchen Item Ready
    console.log('\n👨‍🍳 Marking Kitchen Item (Fries) as Ready...');
    const completeKitchenRes = await request('PUT', `/api/${orderId}/complete-items`, {
        itemIds: [258],
        station: 'Bucătărie',
        station_type: 'kitchen',
        station_name: 'Bucătărie'
    });
    console.log('   Response:', completeKitchenRes.data);

    // 5. Verify Client Monitor (Ready)
    console.log('\n👀 Verifying Client Monitor (Ready)...');
    await sleep(1000); // Wait for status transition
    const monitorRes3 = await request('GET', '/api/orders-display/client-monitor');
    const readyOrder = (monitorRes3.data.ready || []).find(o => o.id == orderId);

    if (readyOrder) {
        console.log(`✅ Order ${orderId} successfully moved to READY column.`);
    } else {
        const stillProgress = (monitorRes3.data.inProgress || []).find(o => o.id == orderId);
        if (stillProgress) {
            console.error(`❌ Order ${orderId} stuck in InProgress! (Kitchen Done: ${stillProgress.kitchenDone}, Bar Done: ${stillProgress.barDone})`);
        } else {
            console.error(`❌ Order ${orderId} missing from Monitor!`);
        }
    }

    // 6. Verify History
    console.log('\n📜 Verifying History...');
    const barHist = await request('GET', '/api/daily-history/bar');
    const kitchenHist = await request('GET', '/api/daily-history/kitchen');

    const inBar = (barHist.data.orders || []).find(o => o.id == orderId);
    const inKitchen = (kitchenHist.data.orders || []).find(o => o.id == orderId);

    if (inBar) console.log(`✅ Order ${orderId} found in Bar History.`);
    else console.error(`❌ Order ${orderId} NOT found in Bar History.`);

    if (inKitchen) console.log(`✅ Order ${orderId} found in Kitchen History.`);
    else console.error(`❌ Order ${orderId} NOT found in Kitchen History.`);

    console.log('\n🏁 Test Complete.');
}

runTest();
