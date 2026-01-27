/**
 * Script pentru crearea unui Happy Hour activ ACUM pentru testare
 */

const { dbPromise } = require('./database');

async function createHappyHourNow() {
  try {
    const db = await dbPromise;
    
    // Obține ora curentă
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Creează Happy Hour pentru următoarele 3 ore
    const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const endHour = (currentHour + 3) % 24;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // Obține ziua curentă
    const currentDay = now.getDay();
    const dayNames = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'];
    const currentDayName = dayNames[currentDay];
    
    console.log(`🔧 Creez Happy Hour activ ACUM:`);
    console.log(`   - Start: ${startTime}`);
    console.log(`   - End: ${endTime}`);
    console.log(`   - Ziua: ${currentDayName}`);
    console.log(`   - Discount: 20%`);
    
    db.run(`
      INSERT INTO happy_hour_settings (
        name, start_time, end_time, days_of_week, 
        discount_percentage, discount_fixed, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Happy Hour Test - Activ Acum',
      startTime,
      endTime,
      JSON.stringify(['all']), // Toate zilele
      20, // 20% discount
      0,
      1, // Activ
      new Date().toISOString()
    ], function(err) {
      if (err) {
        console.error('❌ Eroare la crearea Happy Hour:', err);
        process.exit(1);
      } else {
        console.log(`\n✅ Happy Hour creat cu succes!`);
        console.log(`   - ID: ${this.lastID}`);
        console.log(`   - Banner-ul ar trebui să apară în POS acum!`);
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  }
}

createHappyHourNow();
