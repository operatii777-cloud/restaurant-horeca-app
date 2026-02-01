const express = require('express');
const router = express.Router();

// Mock data generator for cancellation predictions
const generatePredictions = () => {
    return {
        analysis_period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            end: new Date().toISOString()
        },
        trend_analysis: {
            current_rate: '4.2%',
            previous_rate: '3.8%',
            trend_description: 'În creștere ușoară'
        },
        predictions: {
            next_week_rate: '4.5%',
            risk_level: 'MEDIU'
        },
        alerts: [
            {
                type: 'trend',
                severity: 'warning',
                message: 'Rata de anulare a crescut cu 0.4% în ultima săptămână.'
            }
        ],
        recommendations: [
            'Verificați timpii de preparare în intervalul 12:00-14:00',
            'Analizați motivele de anulare pentru produsele din categoria Pizza'
        ]
    };
};

/**
 * GET /api/analytics/cancellation-predictions
 */
router.get('/cancellation-predictions', (req, res) => {
    try {
        const data = generatePredictions();
        res.json(data);
    } catch (error) {
        console.error('Error generating predictions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET /api/analytics/cancellation-stats
 */
router.get('/cancellation-stats', (req, res) => {
    // Return dummy data structure compatible with frontend expectations
    res.json({
        period: 'week',
        general_stats: {
            total_orders: 154,
            cancelled_orders: 6,
            cancellation_rate: 3.89,
            cancelled_value: 345.50,
            avg_cancel_time_minutes: 12
        },
        hourly_distribution: [
            { hour: 10, count: 0 },
            { hour: 11, count: 1 },
            { hour: 12, count: 3 },
            { hour: 13, count: 1 },
            { hour: 14, count: 1 },
            { hour: 15, count: 0 }
        ],
        cancellation_reasons: [
            { reason: 'Timp lung de așteptare', count: 3 },
            { reason: 'Clientul s-a răzgândit', count: 2 },
            { reason: 'Produs indisponibil', count: 1 }
        ],
        trends: [
            { date: 'Lun', count: 1 },
            { date: 'Mar', count: 2 },
            { date: 'Mie', count: 0 },
            { date: 'Joi', count: 1 },
            { date: 'Vin', count: 2 }
        ],
        top_cancelled_products: [
            { name: 'Pizza Prosciuto', cancellation_count: 2 },
            { name: 'Burger Vita', cancellation_count: 1 }
        ]
    });
});

/**
 * GET /api/analytics/stock-cancellation-correlation
 */
router.get('/stock-cancellation-correlation', (req, res) => {
    res.json({
        generated_at: new Date().toISOString(),
        items: [
            {
                id: 1,
                name: 'Pizza Prosciuto',
                category: 'Pizza',
                total_cancellations: 2,
                current_stock: 5,
                min_stock: 10,
                risk_level: 'high',
                recommendation: 'Refaceți stocul de urgență'
            },
            {
                id: 2,
                name: 'Burger Vita',
                category: 'Burger',
                total_cancellations: 1,
                current_stock: 8,
                min_stock: 15,
                risk_level: 'medium',
                recommendation: 'Monitorizați vânzările'
            }
        ]
    });
});

module.exports = router;
