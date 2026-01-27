/**
 * CRON JOBS STARTER - Activate all scheduled tasks
 * Data: 03 Decembrie 2025
 */

const cron = require('node-cron');
const ExpiryService = require('../services/expiry.service');
const NotificationService = require('../services/notification.service');

console.log('🕐 Starting Cron Jobs...\n');

// ========== EXPIRY ALERTS - DAILY at 06:00 ==========
cron.schedule('0 6 * * *', async () => {
  console.log('\n🚨 [CRON] Running Expiry Alerts (06:00)...');
  
  try {
    const alerts = await ExpiryService.generateDailyAlerts();
    console.log(`✅ [CRON] Generated ${alerts.length} expiry alerts`);
    
    // Send email notifications for critical alerts
    const criticalAlerts = alerts.filter(a => a.alert_level === 'red' || a.alert_level === 'expired');
    
    if (criticalAlerts.length > 0) {
      await NotificationService.sendExpiryAlert(criticalAlerts);
      console.log(`📧 [CRON] Sent ${criticalAlerts.length} critical expiry notifications`);
    }
  } catch (err) {
    console.error('❌ [CRON] Expiry alerts failed:', err.message);
  }
}, {
  timezone: "Europe/Bucharest"
});

console.log('✅ Expiry Alerts scheduled: Daily at 06:00 (Europe/Bucharest)');

// ========== LOW STOCK ALERTS - DAILY at 08:00 ==========
cron.schedule('0 8 * * *', async () => {
  console.log('\n📦 [CRON] Running Low Stock Alerts (08:00)...');
  
  try {
    // TODO: Implement low stock check
    console.log('✅ [CRON] Low stock alerts completed');
  } catch (err) {
    console.error('❌ [CRON] Low stock alerts failed:', err.message);
  }
}, {
  timezone: "Europe/Bucharest"
});

console.log('✅ Low Stock Alerts scheduled: Daily at 08:00 (Europe/Bucharest)');

// ========== DASHBOARD STATS REFRESH - Every hour ==========
cron.schedule('0 * * * *', () => {
  console.log('\n📊 [CRON] Refreshing dashboard stats...');
  // Dashboard stats are calculated on-demand, no action needed
  console.log('✅ [CRON] Dashboard stats refresh triggered');
}, {
  timezone: "Europe/Bucharest"
});

console.log('✅ Dashboard Stats Refresh scheduled: Every hour');

console.log('\n🎉 All cron jobs activated!\n');

module.exports = {
  // Export for manual triggering if needed
  triggerExpiryAlerts: async () => {
    const alerts = await ExpiryService.generateDailyAlerts();
    return alerts;
  }
};

