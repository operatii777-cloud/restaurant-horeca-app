/**
 * CRON JOB - Expiry Alerts Daily
 * Data: 03 Decembrie 2025
 * Rulează zilnic la 06:00 AM pentru a genera alerte expirare
 */

const cron = require('node-cron');
const ExpiryService = require('../services/expiry.service');

// Rulează zilnic la 06:00 AM
const schedule = '0 6 * * *'; // Minute Hour Day Month DayOfWeek

function startExpiryAlertsCron() {
  console.log('⏰ Starting Expiry Alerts CRON job...');
  console.log(`   Schedule: Daily at 06:00 AM (${schedule})`);
  
  const task = cron.schedule(schedule, async () => {
    console.log('\n⏰ CRON: Generating daily expiry alerts...');
    console.log(`   Time: ${new Date().toLocaleString('ro-RO')}`);
    
    try {
      const alerts = await ExpiryService.generateDailyAlerts();
      
      console.log(`✅ CRON: Generated ${alerts.length} expiry alerts`);
      
      // Log pentru monitoring
      const critical = alerts.filter(a => a.alert_level === 'red' || a.alert_level === 'expired');
      
      if (critical.length > 0) {
        console.log(`🚨 CRITICAL: ${critical.length} ingredients expire in < 24h!`);
        
        // TODO: Send push notifications to managers
      }
      
    } catch (error) {
      console.error('❌ CRON ERROR:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "Europe/Bucharest"
  });
  
  // Manual trigger pentru test
  global.manualTriggerExpiryAlerts = async () => {
    console.log('\n🔧 Manual trigger: Expiry Alerts');
    try {
      const alerts = await ExpiryService.generateDailyAlerts();
      console.log(`✅ Generated ${alerts.length} alerts`);
      return alerts;
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  };
  
  console.log('✅ Expiry Alerts CRON job started');
  console.log('   📍 Manual trigger: global.manualTriggerExpiryAlerts()\n');
  
  return task;
}

module.exports = { startExpiryAlertsCron };

