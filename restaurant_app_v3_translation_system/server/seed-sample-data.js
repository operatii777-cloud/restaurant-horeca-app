/**
 * Seed Sample Data Script
 * Populates the database with sample menu items and reservations for testing
 */

const { dbPromise } = require('./database');

async function seedSampleData() {
  try {
    const db = await dbPromise;
    console.log('✅ Connected to database');

    // Check if menu table exists and has data
    const menuCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM menu', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`📊 Current menu items: ${menuCount}`);

    if (menuCount === 0) {
      console.log('📝 Seeding sample menu items...');
      
      const sampleMenuItems = [
        {
          name: 'Pizza Margherita',
          name_en: 'Margherita Pizza',
          category: 'Pizza',
          category_en: 'Pizza',
          price: 35.00,
          description: 'Pizza clasică cu sos de roșii, mozzarella și busuioc',
          description_en: 'Classic pizza with tomato sauce, mozzarella and basil',
          is_sellable: 1,
          is_vegetarian: 1
        },
        {
          name: 'Pizza Quattro Formaggi',
          name_en: 'Four Cheese Pizza',
          category: 'Pizza',
          category_en: 'Pizza',
          price: 42.00,
          description: 'Pizza cu patru sortimente de brânză',
          description_en: 'Pizza with four types of cheese',
          is_sellable: 1,
          is_vegetarian: 1
        },
        {
          name: 'Paste Carbonara',
          name_en: 'Carbonara Pasta',
          category: 'Paste',
          category_en: 'Pasta',
          price: 38.00,
          description: 'Paste cu bacon, ou și parmezan',
          description_en: 'Pasta with bacon, egg and parmesan',
          is_sellable: 1
        },
        {
          name: 'Salată Caesar',
          name_en: 'Caesar Salad',
          category: 'Salate',
          category_en: 'Salads',
          price: 28.00,
          description: 'Salată cu pui, crutoane și sos Caesar',
          description_en: 'Salad with chicken, croutons and Caesar dressing',
          is_sellable: 1
        },
        {
          name: 'Tiramisu',
          name_en: 'Tiramisu',
          category: 'Deserturi',
          category_en: 'Desserts',
          price: 22.00,
          description: 'Desert italian cu mascarpone și cafea',
          description_en: 'Italian dessert with mascarpone and coffee',
          is_sellable: 1,
          is_vegetarian: 1
        }
      ];

      for (const item of sampleMenuItems) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO menu (name, name_en, category, category_en, price, description, description_en, is_sellable, is_vegetarian) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.name,
              item.name_en,
              item.category,
              item.category_en,
              item.price,
              item.description,
              item.description_en,
              item.is_sellable,
              item.is_vegetarian || 0
            ],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      console.log(`✅ Seeded ${sampleMenuItems.length} menu items`);
    } else {
      console.log('ℹ️  Menu already has data, skipping seed');
    }

    // Check if reservations table exists and has data
    const reservationsCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM reservations', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`📊 Current reservations: ${reservationsCount}`);

    if (reservationsCount === 0) {
      console.log('📝 Seeding sample reservations...');

      // First, ensure we have at least one table
      const tableCount = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM tables', (err, row) => {
          if (err) {
            // Tables table doesn't exist, create a simple one
            db.run(`CREATE TABLE IF NOT EXISTS tables (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              number TEXT NOT NULL,
              capacity INTEGER NOT NULL DEFAULT 4,
              is_available INTEGER DEFAULT 1
            )`, (createErr) => {
              if (createErr) reject(createErr);
              else resolve(0);
            });
          } else {
            resolve(row.count);
          }
        });
      });

      if (tableCount === 0) {
        // Add some sample tables
        for (let i = 1; i <= 10; i++) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO tables (number, capacity, is_available) VALUES (?, ?, ?)',
              [`Masa ${i}`, 4, 1],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
        console.log('✅ Created 10 sample tables');
      }

      const sampleReservations = [
        {
          table_id: 1,
          customer_name: 'Ion Popescu',
          customer_phone: '0721234567',
          customer_email: 'ion.popescu@example.com',
          reservation_date: '2026-02-15',
          reservation_time: '19:00',
          party_size: 4,
          status: 'confirmed',
          confirmation_code: 'RES001'
        },
        {
          table_id: 2,
          customer_name: 'Maria Ionescu',
          customer_phone: '0722345678',
          customer_email: 'maria.ionescu@example.com',
          reservation_date: '2026-02-15',
          reservation_time: '20:00',
          party_size: 2,
          status: 'pending',
          confirmation_code: 'RES002'
        },
        {
          table_id: 3,
          customer_name: 'Andrei Dumitrescu',
          customer_phone: '0723456789',
          customer_email: 'andrei.d@example.com',
          reservation_date: '2026-02-16',
          reservation_time: '18:30',
          party_size: 6,
          status: 'confirmed',
          confirmation_code: 'RES003'
        },
        {
          table_id: 4,
          customer_name: 'Elena Georgescu',
          customer_phone: '0724567890',
          customer_email: 'elena.g@example.com',
          reservation_date: '2026-02-14',
          reservation_time: '19:30',
          party_size: 3,
          status: 'completed',
          confirmation_code: 'RES004'
        },
        {
          table_id: 5,
          customer_name: 'Mihai Constantinescu',
          customer_phone: '0725678901',
          customer_email: 'mihai.c@example.com',
          reservation_date: '2026-02-13',
          reservation_time: '20:30',
          party_size: 2,
          status: 'cancelled',
          confirmation_code: 'RES005'
        }
      ];

      for (const res of sampleReservations) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO reservations (table_id, customer_name, customer_phone, customer_email, reservation_date, reservation_time, party_size, status, confirmation_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              res.table_id,
              res.customer_name,
              res.customer_phone,
              res.customer_email,
              res.reservation_date,
              res.reservation_time,
              res.party_size,
              res.status,
              res.confirmation_code
            ],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      console.log(`✅ Seeded ${sampleReservations.length} reservations`);
    } else {
      console.log('ℹ️  Reservations already has data, skipping seed');
    }

    console.log('\n🎉 Sample data seeding complete!');
    console.log('You can now test the admin-vite interface with real data.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    process.exit(1);
  }
}

seedSampleData();
