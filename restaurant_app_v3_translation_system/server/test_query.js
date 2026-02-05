const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const query = `
      SELECT 
        hm.*,
        hccp.ccp_number as ccp_name,
        hp.name as process_name,
        u.username as operator_name
      FROM haccp_monitoring hm
      LEFT JOIN haccp_ccp hccp ON hm.ccp_id = hccp.id
      LEFT JOIN haccp_processes hp ON hccp.process_id = hp.id
      LEFT JOIN users u ON hm.monitored_by = u.id
      WHERE 1=1
      ORDER BY hm.monitored_at DESC LIMIT 10 OFFSET 0
`;

db.serialize(() => {
    // Check users table columns
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) console.error('Error checking users:', err);
        else console.log('Users columns:', rows.map(r => r.name));
    });

    // Check haccp_processes
    db.all("PRAGMA table_info(haccp_processes)", (err, rows) => {
        if (err) console.error('Error checking haccp_processes:', err);
        else console.log('Process columns:', rows.map(r => r.name));
    });

    // Check haccp_ccp
    db.all("PRAGMA table_info(haccp_ccp)", (err, rows) => {
        if (err) console.error('Error checking haccp_ccp:', err);
        else console.log('CCP columns:', rows.map(r => r.name));
    });

    // Check haccp_monitoring
    db.all("PRAGMA table_info(haccp_monitoring)", (err, rows) => {
        if (err) console.error('Error checking haccp_monitoring:', err);
        else console.log('Monitoring columns:', rows.map(r => r.name));
    });

    console.log('Running query...');
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ QUERY ERROR MSG:', err.message);
        } else {
            console.log('✅ Query Success. Rows:', rows.length);
        }
    });
});

db.close();
