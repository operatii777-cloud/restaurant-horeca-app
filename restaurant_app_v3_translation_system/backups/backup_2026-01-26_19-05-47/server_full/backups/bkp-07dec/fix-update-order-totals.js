const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('restaurant.db');

db.serialize(() => {
  db.all("SELECT id, items FROM orders WHERE total IS NULL OR total = 0", (err, rows) => {
    if (err) {
      console.error('Eroare la selectarea comenzilor:', err);
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log('Nu există comenzi fără total de actualizat.');
      db.close();
      return;
    }

    const updateStmt = db.prepare('UPDATE orders SET total = ? WHERE id = ?');

    rows.forEach(row => {
      let total = 0;
      if (row.items) {
        try {
          const items = JSON.parse(row.items);
          if (Array.isArray(items)) {
            total = items.reduce((sum, item) => {
              const price = Number(item.finalPrice) || 0;
              const quantity = Number(item.quantity) || 0;
              if (item.isFree) {
                return sum;
              }
              return sum + price * quantity;
            }, 0);
          }
        } catch (errParse) {
          console.error(`Eroare la parsarea items pentru comanda ${row.id}:`, errParse);
        }
      }
      const roundedTotal = Number.isFinite(total) ? Number(total.toFixed(2)) : 0;
      updateStmt.run(roundedTotal, row.id);
    });

    updateStmt.finalize(errFinalize => {
      if (errFinalize) {
        console.error('Eroare la finalizarea update-ului:', errFinalize);
      } else {
        console.log('Actualizare total finalizată pentru comenzile existente.');
      }
      db.close();
    });
  });
});
