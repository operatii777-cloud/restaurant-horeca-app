const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

/**
 * GET /api/customers
 * Returnează lista de clienți cu opțiune de filtrare după segment
 * Query params:
 *   - segment: VIP, Regular, New, HighValue, Students (optional)
 */
router.get('/', async (req, res) => {
    try {
        const { segment } = req.query;
        
        console.log('📊 GET /api/customers - segment:', segment || 'ALL');
        
        // Așteptăm să se rezolve Promise-ul pentru database
        const db = await dbPromise;
        
        // Query de bază pentru clienți cu statistici
        let query = `
            SELECT 
                c.id,
                c.customer_name as name,
                c.customer_phone as phone,
                c.customer_address as address,
                c.customer_city as city,
                c.customer_email as email,
                c.customer_cui as loyalty_code,
                c.is_active,
                c.created_at,
                c.updated_at,
                COALESCE(lp.total_points, 0) as loyalty_points,
                COUNT(DISTINCT o.id) as order_count,
                MAX(o.timestamp) as last_order_date,
                COALESCE(SUM(o.total), 0) as total_spent,
                lp.vip_level as vip_level
            FROM customers c
            LEFT JOIN loyalty_points lp ON c.customer_phone = lp.client_token
            LEFT JOIN orders o ON c.customer_phone = o.client_identifier
            WHERE c.is_active = 1
            GROUP BY c.id
        `;
        
        db.all(query, [], (err, customers) => {
            if (err) {
                console.error('❌ Eroare la încărcarea clienților:', err);
                return res.status(500).json({ error: 'Eroare la încărcarea clienților' });
            }
            
            // Calculăm segmentul pentru fiecare client
            customers.forEach(customer => {
                customer.segment = calculateSegment(customer);
            });
            
            // Filtrăm după segment dacă este specificat
            let filteredCustomers = customers;
            if (segment && segment !== 'All') {
                filteredCustomers = customers.filter(c => {
                    switch(segment) {
                        case 'VIP':
                            return c.segment === 'VIP';
                        case 'Regular':
                            return c.segment === 'Regular';
                        case 'New':
                            return c.segment === 'New';
                        case 'HighValue':
                            return c.total_spent >= 200; // Clienți cu comenzi mari
                        case 'Students':
                            // Aici ai putea adăuga logică pentru identificarea studenților
                            // De exemplu, bazat pe email (.edu) sau un câmp special
                            return customer.email && customer.email.includes('.edu');
                        default:
                            return true;
                    }
                });
            }
            
            console.log(`✅ Clienți returnați: ${filteredCustomers.length} (din ${customers.length} total)`);
            res.json(filteredCustomers);
        });
        
    } catch (error) {
        console.error('❌ Eroare GET /api/customers:', error);
        res.status(500).json({ error: 'Eroare la încărcarea clienților' });
    }
});

/**
 * GET /api/customers/:id
 * Returnează detaliile complete ale unui client
 */
router.get('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        
        console.log('📊 GET /api/customers/:id -', customerId);
        
        // Așteptăm să se rezolve Promise-ul pentru database
        const db = await dbPromise;
        
        const query = `
            SELECT 
                c.id,
                c.customer_name as name,
                c.customer_phone as phone,
                c.customer_address as address,
                c.customer_city as city,
                c.customer_email as email,
                c.customer_cui as loyalty_code,
                c.is_active,
                c.created_at,
                c.updated_at,
                COALESCE(lp.total_points, 0) as loyalty_points,
                COUNT(DISTINCT o.id) as order_count,
                MAX(o.timestamp) as last_order_date,
                COALESCE(SUM(o.total), 0) as total_spent,
                lp.vip_level as vip_level
            FROM customers c
            LEFT JOIN loyalty_points lp ON c.customer_phone = lp.client_token
            LEFT JOIN orders o ON c.customer_phone = o.client_identifier
            WHERE c.id = ?
            GROUP BY c.id
        `;
        
        db.get(query, [customerId], (err, customer) => {
            if (err) {
                console.error('❌ Eroare la încărcarea clientului:', err);
                return res.status(500).json({ error: 'Eroare la încărcarea clientului' });
            }
            
            if (!customer) {
                return res.status(404).json({ error: 'Clientul nu a fost găsit' });
            }
            
            // Calculăm segmentul
            customer.segment = calculateSegment(customer);
            
            console.log(`✅ Client returnat: ${customer.name} (${customer.segment})`);
            res.json(customer);
        });
        
    } catch (error) {
        console.error('❌ Eroare GET /api/customers/:id:', error);
        res.status(500).json({ error: 'Eroare la încărcarea clientului' });
    }
});

/**
 * PUT /api/customers/:id
 * Actualizează datele unui client
 */
router.put('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const { name, phone, address, city, loyalty_code, is_active } = req.body;
        
        console.log('📝 PUT /api/customers/:id -', customerId, req.body);
        
        // Validare câmpuri obligatorii
        if (!name || !phone) {
            return res.status(400).json({ error: 'Numele și telefonul sunt obligatorii' });
        }
        
        // Așteptăm să se rezolve Promise-ul pentru database
        const db = await dbPromise;
        
        const query = `
            UPDATE customers
            SET customer_name = ?,
                customer_phone = ?,
                customer_address = ?,
                customer_city = ?,
                customer_cui = ?,
                is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(
            query,
            [name, phone, address || null, city || null, loyalty_code || null, is_active ? 1 : 0, customerId],
            function(err) {
                if (err) {
                    console.error('❌ Eroare la actualizarea clientului:', err);
                    return res.status(500).json({ error: 'Eroare la actualizarea clientului' });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Clientul nu a fost găsit' });
                }
                
                console.log(`✅ Client actualizat: ${name} (ID: ${customerId})`);
                
                // Returnăm clientul actualizat
                db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err, customer) => {
                    if (err) {
                        console.error('❌ Eroare la reîncărcarea clientului:', err);
                        return res.json({ success: true, message: 'Client actualizat cu succes' });
                    }
                    
                    res.json({
                        success: true,
                        message: 'Client actualizat cu succes',
                        customer: {
                            id: customer.id,
                            name: customer.customer_name,
                            phone: customer.customer_phone,
                            address: customer.customer_address,
                            city: customer.customer_city,
                            loyalty_code: customer.customer_cui,
                            is_active: customer.is_active === 1
                        }
                    });
                });
            }
        );
        
    } catch (error) {
        console.error('❌ Eroare PUT /api/customers/:id:', error);
        res.status(500).json({ error: 'Eroare la actualizarea clientului' });
    }
});

/**
 * Helper function: Calculează segmentul unui client
 * @param {Object} customer - Obiect client cu order_count, loyalty_points, etc.
 * @returns {String} - Segment: 'VIP', 'Regular', 'New'
 */
function calculateSegment(customer) {
    const orderCount = customer.order_count || 0;
    const loyaltyPoints = customer.loyalty_points || 0;
    
    // VIP: >= 10 comenzi sau >= 500 puncte loialitate
    if (orderCount >= 10 || loyaltyPoints >= 500) {
        return 'VIP';
    }
    
    // Regular: >= 3 comenzi
    if (orderCount >= 3) {
        return 'Regular';
    }
    
    // New: < 3 comenzi
    return 'New';
}

module.exports = router;

