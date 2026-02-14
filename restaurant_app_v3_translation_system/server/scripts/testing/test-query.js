const Database = require('better-sqlite3');
const db = new Database('./database.db');

const result = db.prepare(`
  SELECT 
    da.id,
    da.order_id,
    da.courier_id,
    da.status,
    da.assigned_at as created_at,
    da.picked_up_at,
    da.delivered_at,
    da.delivery_fee,
    da.tip_amount,
    o.id as order_number, 
    o.customer_name, 
    o.customer_phone, 
    o.delivery_address,
    o.total, 
    o.payment_method, 
    o.platform, 
    o.items, 
    o.timestamp, 
    o.status as order_status
  FROM delivery_assignments da
  JOIN orders o ON da.order_id = o.id
  WHERE da.courier_id = ? AND da.status IN ('delivered')
`).all(2);

console.log('Query result count:', result.length);
if (result.length > 0) {
  console.log('First record:');
  const first = result[0];
  console.log('  delivery_fee:', first.delivery_fee);
  console.log('  tip_amount:', first.tip_amount);
  console.log('  order_number:', first.order_number);
  console.log('Keys in result:', Object.keys(first).join(', '));
}
