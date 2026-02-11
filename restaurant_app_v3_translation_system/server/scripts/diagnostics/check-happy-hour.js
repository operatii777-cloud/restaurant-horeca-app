/**
 * Script pentru verificarea și crearea Happy Hour de testare
 */

const { dbPromise } = require('./database');

async function checkAndCreateHappyHour() {
  try {
    const db = await dbPromise;
    
    // Verifică dacă există Happy Hour activ
    const activeHappyHours = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM happy_hour_settings 
        WHERE is_active = 1 
        ORDER BY created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log('📊 Happy Hour-uri active găsite:', activeHappyHours.length);
    
    if (activeHappyHours.length > 0) {
      console.log('\n✅ Happy Hour-uri active:');
      activeHappyHours.forEach((hh, index) => {
        console.log(`\n${index + 1}. ${hh.name || 'Fără nume'}`);
        console.log(`   - Start: ${hh.start_time}`);
        console.log(`   - End: ${hh.end_time}`);
        console.log(`   - Zile: ${hh.days_of_week}`);
        console.log(`   - Discount: ${hh.discount_percentage || 0}%`);
        console.log(`   - Activ: ${hh.is_active ? 'DA' : 'NU'}`);
      });
    } else {
      console.log('\n⚠️ Nu există Happy Hour activ!');
      console.log('🔧 Creez un Happy Hour de testare...');
      
      // Obține ora curentă
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Creează Happy Hour pentru următoarele 2 ore
      const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const endHour = (currentHour + 2) % 24;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      // Obține ziua curentă (0 = Duminică, 1 = Luni, etc.)
      const currentDay = now.getDay();
      const dayNames = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'];
      const currentDayName = dayNames[currentDay];
      
      db.run(`
        INSERT INTO happy_hour_settings (
          name, start_time, end_time, days_of_week, 
          discount_percentage, discount_fixed, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Happy Hour Test',
        startTime,
        endTime,
        JSON.stringify([currentDayName, 'all']), // Ziua curentă + toate zilele
        20, // 20% discount
        0,
        1, // Activ
        new Date().toISOString()
      ], function(err) {
        if (err) {
          console.error('❌ Eroare la crearea Happy Hour:', err);
        } else {
          console.log(`\n✅ Happy Hour creat cu succes!`);
          console.log(`   - ID: ${this.lastID}`);
          console.log(`   - Start: ${startTime}`);
          console.log(`   - End: ${endTime}`);
          console.log(`   - Discount: 20%`);
          console.log(`   - Zile: ${currentDayName}, all`);
        }
        
        process.exit(0);
      });
    }
    
    // Verifică dacă există Happy Hour activ ACUM
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours() * 60 + now.getMinutes();
    
    const activeNow = activeHappyHours.filter(hh => {
      // Parse days_of_week
      let daysArray = hh.days_of_week;
      if (typeof daysArray === 'string' && daysArray.startsWith('[')) {
        try {
          daysArray = JSON.parse(daysArray);
        } catch (e) {
          daysArray = [daysArray];
        }
      } else if (typeof daysArray === 'string') {
        daysArray = [daysArray.trim()];
      }
      
      const dayMappings = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 0,
        'luni': 1, 'marti': 2, 'miercuri': 3, 'joi': 4, 'vineri': 5, 'sambata': 6, 'duminica': 0
      };
      
      const isRelevantDay = daysArray.includes('all') || 
        daysArray.some(day => {
          const mappedDay = dayMappings[String(day).toLowerCase().trim()];
          return mappedDay === currentDay;
        });
      
      if (!isRelevantDay) {
        return false;
      }
      
      // Check time range
      const [startH, startM] = hh.start_time.split(':').map(Number);
      const [endH, endM] = hh.end_time.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      
      return currentHour >= startMinutes && currentHour <= endMinutes;
    });
    
    if (activeNow.length > 0) {
      console.log(`\n🎉 Happy Hour ACTIV ACUM! (${activeNow.length} setări)`);
      activeNow.forEach((hh, index) => {
        console.log(`   ${index + 1}. ${hh.name || 'Fără nume'} - ${hh.discount_percentage || 0}% discount`);
      });
    } else {
      console.log(`\n⚠️ Nu există Happy Hour activ în acest moment!`);
      console.log(`   Ora curentă: ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
      console.log(`   Ziua curentă: ${['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'][currentDay]}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  }
}

checkAndCreateHappyHour();
