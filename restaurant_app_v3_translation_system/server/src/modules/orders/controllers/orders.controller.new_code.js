
// GET /api/orders/cancelled - Get list of cancelled orders specifically (not just cancellations log)
async function getCancelledOrders(req, res, next) {
    try {
        const db = await dbPromise;
        const { limit = 100, page = 1 } = req.query;
        // Calculate offset if page is provided
        const offset = (req.query.offset) ? parseInt(req.query.offset) : (page - 1) * limit;

        const orders = await new Promise((resolve, reject) => {
            db.all(`
        SELECT * FROM orders 
        WHERE status = 'cancelled'
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `, [limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Parse nested JSON fields (items, customizations) for frontend convenience
        const parsedOrders = orders.map(order => {
            let items = [];
            try {
                items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
            } catch (e) {
                items = [];
            }
            return {
                ...order,
                items
            };
        });

        res.json(parsedOrders);
    } catch (error) {
        next(error);
    }
}
