const { dbPromise } = require('../../../database');

// In-memory history for simulation/demo purposes
// In production, this would be a DB table `call_logs`
let callHistory = [];

const MAX_HISTORY = 50;

class CallCenterService {

    /**
     * Simulate an incoming call
     * 1. Lookup customer by phone
     * 2. Find last order
     * 3. Emit socket event
     */
    async simulateIncomingCall(phoneNumber, overrideName = null) {
        const db = await dbPromise;
        let customer = null;
        let lastOrder = null;

        // 1. Try to find customer by phone
        const customers = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM customers WHERE phone LIKE ? LIMIT 1', [`%${phoneNumber}%`], (err, rows) => {
                if (err) resolve([]);
                else resolve(rows || []);
            });
        });

        if (customers.length > 0) {
            customer = customers[0];
        } else {
            // Fallback: try to find from orders if not in customers table
            const orderCustomer = await new Promise((resolve) => {
                db.get('SELECT customer_name, customer_phone FROM orders WHERE customer_phone LIKE ? ORDER BY created_at DESC LIMIT 1', [`%${phoneNumber}%`], (err, row) => {
                    resolve(row);
                });
            });

            if (orderCustomer) {
                customer = {
                    name: orderCustomer.customer_name,
                    phone: orderCustomer.customer_phone
                };
            }
        }

        // 2. Find last order details
        if (customer || phoneNumber) {
            const orders = await new Promise((resolve) => {
                db.all(
                    `SELECT id, total, created_at, items 
           FROM orders 
           WHERE customer_phone LIKE ? 
           ORDER BY created_at DESC LIMIT 1`,
                    [`%${phoneNumber}%`],
                    (err, rows) => resolve(rows || [])
                );
            });

            if (orders.length > 0) {
                lastOrder = orders[0];
            }
        }

        // Prepare payload
        const callData = {
            id: Date.now().toString(),
            phoneNumber: phoneNumber,
            customerName: overrideName || (customer ? customer.name : 'Client Nou'),
            customerId: customer ? customer.id : null,
            timestamp: new Date().toISOString(),
            lastOrder: lastOrder ? {
                id: lastOrder.id,
                total: lastOrder.total,
                date: lastOrder.created_at,
                items: lastOrder.items // might need parsing if stored as string
            } : null,
            isVip: customer ? (customer.total_spent > 1000) : false // Example VIP logic
        };

        // Store in history
        callHistory.unshift(callData);
        if (callHistory.length > MAX_HISTORY) callHistory.pop();

        // 3. Emit Socket Event
        if (global.io) {
            console.log('📡 Emitting call:incoming', callData.phoneNumber);
            global.io.emit('call:incoming', callData);
        } else {
            console.warn('⚠️ Global IO not found, cannot emit call:incoming');
        }

        return callData;
    }

    async getCallHistory() {
        return callHistory;
    }
}

module.exports = new CallCenterService();
