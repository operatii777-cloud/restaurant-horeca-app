const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// GET all NIR documents
router.get('/', async (req, res) => {
    try {
        const nirs = await db.all(`
            SELECT 
                id,
                nir_number,
                nir_date,
                supplier_name,
                total_value,
                paid_value,
                (total_value - paid_value) as remaining_value,
                status,
                validated_by,
                validated_at
            FROM nir_documents
            ORDER BY nir_date DESC, id DESC
        `);
        
        res.json({
            success: true,
            data: nirs || []
        });
    } catch (error) {
        console.error('❌ Error fetching NIR:', error.message);
        res.json({ success: true, data: [] }); // Return empty if table doesn't exist
    }
});

// GET statistics
router.get('/statistics', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
                SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) as validated,
                SUM(CASE WHEN remaining_value > 0 THEN 1 ELSE 0 END) as unpaid,
                SUM(total_value) as total_value,
                SUM(remaining_value) as total_unpaid
            FROM nir_documents
        `);
        
        res.json({
            success: true,
            data: stats || { total: 0, draft: 0, validated: 0, unpaid: 0, total_value: 0, total_unpaid: 0 }
        });
    } catch (error) {
        res.json({ success: true, data: { total: 0, draft: 0, validated: 0, unpaid: 0, total_value: 0, total_unpaid: 0 } });
    }
});

module.exports = router;


