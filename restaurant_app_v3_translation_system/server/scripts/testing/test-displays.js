const axios = require('axios');

async function testDisplays() {
    try {
        console.log('--- Testing Kitchen Display ---');
        const kitchenRes = await axios.get('http://localhost:3001/api/orders-display/kitchen');

        if (!kitchenRes.data || !kitchenRes.data.orders) {
            console.log('❌ UNEXPECTED RESPONSE FORMAT:', JSON.stringify(kitchenRes.data).substring(0, 100));
            return;
        }

        console.log('Kitchen Orders count:', kitchenRes.data.orders.length);
        const ids = kitchenRes.data.orders.map(o => o.id);
        console.log('Kitchen IDs:', ids);

        const order2972 = kitchenRes.data.orders.find(o => o.id === 2972);
        if (order2972) {
            console.log('✅ FOUND 2972 in Kitchen API');
            console.log('  Status:', order2972.status);
            console.log('  Items:', order2972.items.map(i => i.name));
        } else {
            console.log('❌ Order 2972 NOT FOUND in Kitchen API');
        }

    } catch (error) {
        console.error('Error during test:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        }
    }
}

testDisplays();
