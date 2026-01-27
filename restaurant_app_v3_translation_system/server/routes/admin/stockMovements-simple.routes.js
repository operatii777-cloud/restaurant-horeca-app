const express = require('express');
const router = express.Router();
const db = require('../../config/database');

router.get('/', async (req, res) => {
    try {
        const movements = await db.all(`
            SELECT 
                sm.id,
                sm.movement_date,
                sm.movement_type,
                sm.quantity,
                sm.notes,
                i.name as ingredient_name,
                i.unit
            FROM stock_movements sm
            LEFT JOIN ingredients i ON sm.ingredient_id = i.id
            ORDER BY sm.movement_date DESC
            LIMIT 100
        `);
        
        res.json({ success: true, data: movements || [] });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});

module.exports = router;


