const { dbPromise } = require('../../database');

async function investigateOrders() {
  const db = await dbPromise;

  const orderIds = [2922, 2923];

  for (const orderId of orderIds) {
    console.log(`\n=== ORDER #${orderId} ===`);

    const order = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, status, items, timestamp
        FROM orders
        WHERE id = ?
      `, [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!order) {
      console.log(`Order #${orderId} not found`);
      continue;
    }

    console.log(`Status: ${order.status}`);
    console.log(`Timestamp: ${order.timestamp}`);

    let items = [];
    try {
      items = JSON.parse(order.items || '[]');
    } catch (e) {
      console.log('Error parsing items:', e.message);
      continue;
    }

    console.log(`Items (${items.length}):`);
    items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.name || 'N/A'} (ID: ${item.product_id || item.id || 'N/A'})`);
      console.log(`     Category: '${item.category || 'N/A'}'`);
      console.log(`     Quantity: ${item.quantity || 1}`);
    });
  }

  db.close();
}

investigateOrders().catch(console.error);