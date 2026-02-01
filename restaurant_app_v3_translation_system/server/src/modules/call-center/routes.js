const express = require('express');
const router = express.Router();
const callCenterService = require('./service');

/**
 * POST /api/call-center/simulate
 * Trigger a simulated incoming call event
 */
router.post('/simulate', async (req, res) => {
    try {
        const { phoneNumber, customerName } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, error: 'Phone number is required' });
        }

        const result = await callCenterService.simulateIncomingCall(phoneNumber, customerName);

        res.json({
            success: true,
            message: 'Call simulated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error simulating call:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/call-center/history
 * Get recent call history (simulated)
 */
router.get('/history', async (req, res) => {
    try {
        const history = await callCenterService.getCallHistory();
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
