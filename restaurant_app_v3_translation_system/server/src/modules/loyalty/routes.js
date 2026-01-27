/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E2 - Loyalty & Rewards Routes
 * 
 * Handles rewards management, loyalty points, and VIP levels
 */

const express = require('express');
const loyaltyController = require('./controllers/loyalty.controller');
const { dbPromise } = require('../../../database');

const router = express.Router();

// ========================================
// REWARDS MANAGEMENT
// ========================================

// ========================================
// REWARDS MANAGEMENT - Admin-vite format
// ========================================

// Get all rewards (for Admin-vite: /api/loyalty/rewards)
router.get('/loyalty/rewards', loyaltyController.getAllRewards);

// Get single reward (for Admin-vite: /api/loyalty/rewards/:id)
router.get('/loyalty/rewards/:id', loyaltyController.getRewardById);

// Create reward (for Admin-vite: /api/rewards)
router.post('/rewards', loyaltyController.createReward);

// Create reward (for Admin-vite: /api/loyalty/rewards)
router.post('/loyalty/rewards', loyaltyController.createReward);

// Update reward (for Admin-vite: /api/loyalty/rewards/:id)
router.put('/loyalty/rewards/:id', loyaltyController.updateReward);
router.patch('/loyalty/rewards/:id', loyaltyController.updateReward);

// Delete reward (for Admin-vite: /api/loyalty/rewards/:id)
router.delete('/loyalty/rewards/:id', loyaltyController.deleteReward);

// ========================================
// REWARDS MANAGEMENT - Legacy format
// ========================================

// Get all rewards (for legacy: /api/admin/rewards)
router.get('/admin/rewards', loyaltyController.getAllRewards);

// Get single reward (for legacy: /api/admin/rewards/:id)
router.get('/admin/rewards/:id', loyaltyController.getRewardById);

// Create reward (for legacy: /api/admin/rewards)
router.post('/admin/rewards', loyaltyController.createReward);

// Update reward (for legacy: /api/admin/rewards/:id)
router.put('/admin/rewards/:id', loyaltyController.updateReward);
router.patch('/admin/rewards/:id', loyaltyController.updateReward);

// Delete reward (for legacy: /api/admin/rewards/:id)
router.delete('/admin/rewards/:id', loyaltyController.deleteReward);

// ========================================
// LOYALTY POINTS
// ========================================

// Get client points balance (for Admin-vite: /api/loyalty/points/:clientToken)
router.get('/loyalty/points/:clientToken', loyaltyController.getClientPoints);

// Get client points history (for Admin-vite: /api/loyalty/points/:clientToken/history)
router.get('/loyalty/points/:clientToken/history', loyaltyController.getClientPointsHistory);

// ========================================
// LOYALTY PROGRAMS - Full implementation
// ========================================

router.get('/loyalty/programs', async (req, res) => {
  try {
    const db = await dbPromise;
    const { status = 'active', include_stats = 'true' } = req.query;
    
    // Get programs with statistics
    const programs = await new Promise((resolve, reject) => {
      let query = 'SELECT * FROM loyalty_programs WHERE 1=1';
      const params = [];
      
      if (status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Enhance with statistics if requested
    if (include_stats === 'true' && programs.length > 0) {
      for (const program of programs) {
        // Get participant count
        const participantStats = await new Promise((resolve, reject) => {
          db.get(`
            SELECT 
              COUNT(DISTINCT lp.client_token) as total_participants,
              COALESCE(SUM(lp.points_balance), 0) as total_outstanding_points,
              COALESCE(SUM(lp.total_points_earned), 0) as total_points_issued,
              COALESCE(SUM(lp.total_points_redeemed), 0) as total_points_redeemed
            FROM loyalty_points lp
            WHERE lp.program_id = ?
          `, [program.id], (err, row) => {
            if (err) resolve({ total_participants: 0 });
            else resolve(row || { total_participants: 0 });
          });
        });
        
        // Get recent activity
        const recentActivity = await new Promise((resolve, reject) => {
          db.get(`
            SELECT 
              COUNT(*) as transactions_30d,
              COALESCE(SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END), 0) as points_earned_30d,
              COALESCE(SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END), 0) as points_redeemed_30d
            FROM loyalty_transactions
            WHERE program_id = ?
            AND created_at >= datetime('now', '-30 days')
          `, [program.id], (err, row) => {
            if (err) resolve({ transactions_30d: 0 });
            else resolve(row || { transactions_30d: 0 });
          });
        });
        
        // Get available rewards
        const rewards = await new Promise((resolve, reject) => {
          db.all(`
            SELECT id, name, points_required, reward_type, is_active
            FROM loyalty_rewards
            WHERE program_id = ? AND is_active = 1
            ORDER BY points_required ASC
          `, [program.id], (err, rows) => {
            if (err) resolve([]);
            else resolve(rows || []);
          });
        });
        
        program.stats = participantStats;
        program.recent_activity = recentActivity;
        program.available_rewards = rewards;
        
        // Calculate program value
        program.calculated_liability = participantStats.total_outstanding_points * (program.point_value || 0.01);
        program.redemption_rate = participantStats.total_points_issued > 0
          ? Math.round((participantStats.total_points_redeemed / participantStats.total_points_issued) * 100)
          : 0;
      }
    }
    
    // Get overall loyalty summary
    const overallStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(DISTINCT lp.client_token) as total_loyalty_members,
          COUNT(DISTINCT CASE WHEN lp.points_balance > 0 THEN lp.client_token END) as active_members,
          COALESCE(SUM(lp.points_balance), 0) as total_outstanding_points
        FROM loyalty_points lp
        JOIN loyalty_programs prog ON lp.program_id = prog.id
        WHERE prog.status = 'active'
      `, [], (err, row) => {
        if (err) resolve({});
        else resolve(row || {});
      });
    });
    
    res.json({ 
      success: true, 
      data: programs,
      summary: overallStats
    });
  } catch (error) {
    console.error('Error in /api/loyalty/programs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;

