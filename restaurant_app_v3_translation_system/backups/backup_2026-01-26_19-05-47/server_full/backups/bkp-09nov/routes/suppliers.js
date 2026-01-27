// ================================================
// SUPPLIERS API ROUTES
// Data: 02 Noiembrie 2025
// Descriere: API pentru gestionarea furnizorilor
// ================================================

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '../restaurant.db');

function getDb() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err);
        }
    });
}

// ================================================
// GET /api/suppliers - Get all suppliers
// ================================================
router.get('/', (req, res) => {
    const db = getDb();
    
    const query = `
        SELECT * FROM suppliers 
        ORDER BY name ASC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching suppliers:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
        db.close();
    });
});

// ================================================
// GET /api/suppliers/:id - Get supplier by ID
// ================================================
router.get('/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    
    const query = 'SELECT * FROM suppliers WHERE id = ?';
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error fetching supplier:', err);
            res.status(500).json({ error: 'Database error' });
        } else if (!row) {
            res.status(404).json({ error: 'Supplier not found' });
        } else {
            res.json(row);
        }
        db.close();
    });
});

// ================================================
// POST /api/suppliers - Create new supplier
// ================================================
router.post('/', (req, res) => {
    const db = getDb();
    const { name, cui, phone, email, address, category, payment_terms, rating, status, notes } = req.body;
    
    // Validation
    if (!name || !cui || !phone || !category) {
        return res.status(400).json({ error: 'Missing required fields: name, cui, phone, category' });
    }
    
    const query = `
        INSERT INTO suppliers (name, cui, phone, email, address, category, payment_terms, rating, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        name,
        cui,
        phone,
        email || null,
        address || null,
        category,
        payment_terms || 'net30',
        rating || 5.0,
        status || 'active',
        notes || null
    ];
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error creating supplier:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'CUI already exists' });
            } else {
                res.status(500).json({ error: 'Database error' });
            }
        } else {
            res.status(201).json({ 
                id: this.lastID,
                message: 'Supplier created successfully'
            });
        }
        db.close();
    });
});

// ================================================
// PUT /api/suppliers/:id - Update supplier
// ================================================
router.put('/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const { name, cui, phone, email, address, category, payment_terms, rating, status, notes } = req.body;
    
    // Validation
    if (!name || !cui || !phone || !category) {
        return res.status(400).json({ error: 'Missing required fields: name, cui, phone, category' });
    }
    
    const query = `
        UPDATE suppliers 
        SET name = ?, cui = ?, phone = ?, email = ?, address = ?, 
            category = ?, payment_terms = ?, rating = ?, status = ?, notes = ?
        WHERE id = ?
    `;
    
    const params = [
        name,
        cui,
        phone,
        email || null,
        address || null,
        category,
        payment_terms || 'net30',
        rating || 5.0,
        status || 'active',
        notes || null,
        id
    ];
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error updating supplier:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'CUI already exists' });
            } else {
                res.status(500).json({ error: 'Database error' });
            }
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Supplier not found' });
        } else {
            res.json({ message: 'Supplier updated successfully' });
        }
        db.close();
    });
});

// ================================================
// DELETE /api/suppliers/:id - Delete supplier
// ================================================
router.delete('/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    
    const query = 'DELETE FROM suppliers WHERE id = ?';
    
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Error deleting supplier:', err);
            res.status(500).json({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Supplier not found' });
        } else {
            res.json({ message: 'Supplier deleted successfully' });
        }
        db.close();
    });
});

// ================================================
// GET /api/suppliers/stats - Get supplier statistics
// ================================================
router.get('/stats/summary', (req, res) => {
    const db = getDb();
    
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            COUNT(DISTINCT category) as categories,
            AVG(rating) as avg_rating
        FROM suppliers
    `;
    
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error fetching stats:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json({
                total: row.total || 0,
                active: row.active || 0,
                categories: row.categories || 0,
                avg_rating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : '0.0'
            });
        }
        db.close();
    });
});

// ================================================
// GET /api/suppliers/category/:category - Get suppliers by category
// ================================================
router.get('/category/:category', (req, res) => {
    const db = getDb();
    const { category } = req.params;
    
    const query = 'SELECT * FROM suppliers WHERE category = ? ORDER BY name ASC';
    
    db.all(query, [category], (err, rows) => {
        if (err) {
            console.error('Error fetching suppliers by category:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
        db.close();
    });
});

module.exports = router;

