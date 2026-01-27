// This file contains all remaining simple API routes
// Will be split into individual files after testing

const express = require('express');
const db = require('../../config/database');

// Stock Transfers
const stockTransfersRouter = express.Router();
stockTransfersRouter.get('/', async (req, res) => {
    res.json({ success: true, data: [] }); // Empty for now
});
exports.stockTransfersRouter = stockTransfersRouter;

// Gestiuni
const gestiuniRouter = express.Router();
gestiuniRouter.get('/', async (req, res) => {
    try {
        const data = await db.all(`SELECT * FROM stock_management ORDER BY name`);
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});
exports.gestiuniRouter = gestiuniRouter;

// Suppliers
const suppliersRouter = express.Router();
suppliersRouter.get('/', async (req, res) => {
    try {
        // Check if there's a suppliers table
        const data = await db.all(`SELECT DISTINCT supplier as name FROM ingredients WHERE supplier IS NOT NULL`);
        res.json({ success: true, data: data.map((s, idx) => ({ 
            id: idx + 1, 
            name: s.name,
            cui: '',
            contact_person: '',
            phone: '',
            email: '',
            payment_terms_days: 30,
            is_active: 1
        })) });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});
exports.suppliersRouter = suppliersRouter;

// Categories
const categoriesRouter = express.Router();
categoriesRouter.get('/', async (req, res) => {
    try {
        const categories = await db.all(`SELECT DISTINCT category as name FROM menu WHERE category IS NOT NULL`);
        res.json({ success: true, data: categories.map((c, idx) => ({
            id: idx + 1,
            name: c.name,
            name_en: c.name,
            parent_id: null,
            position: idx,
            is_active: 1
        })) });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});
exports.categoriesRouter = categoriesRouter;

// Cash Accounts
const cashAccountsRouter = express.Router();
cashAccountsRouter.get('/', async (req, res) => {
    try {
        const accounts = await db.all(`SELECT * FROM cash_register ORDER BY id DESC LIMIT 10`);
        res.json({ success: true, data: accounts.map(a => ({
            id: a.id,
            name: `Cash Register ${a.id}`,
            type: 'cash',
            current_balance: a.final_amount || 0,
            currency: 'RON',
            is_active: 1
        })) });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});
exports.cashAccountsRouter = cashAccountsRouter;


