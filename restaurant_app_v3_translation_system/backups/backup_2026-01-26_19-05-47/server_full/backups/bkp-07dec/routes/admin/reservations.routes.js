const express = require('express');
const router = express.Router();
const database = require('../../database');
const {
  dbPromise,
  createReservation,
  getAvailableTables,
  updateTableAvailability,
  updateReservationStatus,
  getReservationStats,
  addReservationEvent,
} = database;

const ALLOWED_STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];
let setupPromise = null;

async function runAll(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function runGet(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row ?? null);
    });
  });
}

async function runExec(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function ensureSetup() {
  if (!setupPromise) {
    setupPromise = (async () => {
      await runExec(`
        CREATE TABLE IF NOT EXISTS reservation_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reservation_id INTEGER NOT NULL,
          event_type TEXT NOT NULL,
          payload TEXT,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reservation_id) REFERENCES reservations(id)
        )
      `);
      await runExec(`
        CREATE INDEX IF NOT EXISTS idx_reservation_events_reservation_id 
        ON reservation_events (reservation_id)
      `);
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }
  return setupPromise;
}

async function recordReservationEvent(reservationId, eventType, payload = {}, createdBy = 'admin.v4') {
  await ensureSetup();
  await addReservationEvent(reservationId, eventType, payload, createdBy);
}

function parseStatuses(rawStatus) {
  if (!rawStatus) {
    return [];
  }
  const statuses = Array.isArray(rawStatus) ? rawStatus : String(rawStatus).split(',');
  return statuses
    .map((status) => status.trim().toLowerCase())
    .filter((status) => ALLOWED_STATUSES.includes(status));
}

function buildReservationFilters(query) {
  const {
    startDate,
    endDate,
    status,
    tableId,
    search,
    customerPhone,
    includeCancelled,
  } = query;

  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push('DATE(r.reservation_date) >= DATE(?)');
    params.push(startDate);
  }

  if (endDate) {
    conditions.push('DATE(r.reservation_date) <= DATE(?)');
    params.push(endDate);
  }

  const statuses = parseStatuses(status);
  if (statuses.length > 0) {
    conditions.push(`r.status IN (${statuses.map(() => '?').join(',')})`);
    params.push(...statuses);
  } else if (!includeCancelled) {
    conditions.push("r.status NOT IN ('cancelled', 'no_show')");
  }

  if (tableId) {
    conditions.push('r.table_id = ?');
    params.push(tableId);
  }

  if (customerPhone) {
    conditions.push('r.customer_phone = ?');
    params.push(customerPhone);
  }

  if (search) {
    conditions.push(`
      (
        LOWER(r.customer_name) LIKE LOWER(?) OR
        LOWER(r.customer_email) LIKE LOWER(?) OR
        r.customer_phone LIKE ? OR
        LOWER(r.confirmation_code) LIKE LOWER(?)
      )
    `);
    const likeQuery = `%${search.trim()}%`;
    params.push(likeQuery, likeQuery, likeQuery, likeQuery);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, params };
}

function resolveOrderBy(sort) {
  switch (sort) {
    case 'date_asc':
      return 'r.reservation_date ASC, r.reservation_time ASC';
    case 'created_desc':
      return 'r.created_at DESC';
    case 'created_asc':
      return 'r.created_at ASC';
    default:
      return 'r.reservation_date DESC, r.reservation_time DESC';
  }
}

async function fetchReservationById(reservationId) {
  const reservation = await runGet(
    `
      SELECT 
        r.*,
        t.table_number,
        t.capacity,
        t.location
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
      WHERE r.id = ?
    `,
    [reservationId],
  );
  return reservation ?? null;
}

router.use(async (req, res, next) => {
  try {
    await ensureSetup();
    next();
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const offset = Number(req.query.offset ?? 0);
    const orderBy = resolveOrderBy(req.query.sort);

    const { whereClause, params } = buildReservationFilters(req.query);

    const baseSql = `
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
    `;

    const dataSql = `
      SELECT 
        r.*,
        t.table_number,
        t.capacity,
        t.location
      ${baseSql}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      ${baseSql}
      ${whereClause}
    `;

    const [rows, countRow] = await Promise.all([
      runAll(dataSql, [...params, limit, offset]),
      runGet(countSql, params),
    ]);

    res.json({
      success: true,
      data: rows,
      meta: {
        total: countRow?.total ?? rows.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/metrics', async (req, res, next) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const start = req.query.startDate || todayStr;
    const end = req.query.endDate || todayStr;

    const stats = await getReservationStats(start, end);
    const todayStats = await getReservationStats(todayStr, todayStr);

    const [tablesRow, upcomingRow] = await Promise.all([
      runGet('SELECT COUNT(*) AS total_tables FROM tables WHERE is_active = 1'),
      runGet(
        `
          SELECT COUNT(*) AS upcoming
          FROM reservations
          WHERE reservation_date = ? AND status IN ('pending', 'confirmed', 'seated')
        `,
        [todayStr],
      ),
    ]);

    const totalTables = tablesRow?.total_tables ?? 0;
    const occupancy =
      totalTables > 0 ? Math.min(100, Math.round(((upcomingRow?.upcoming ?? 0) / totalTables) * 100)) : 0;

    res.json({
      success: true,
      stats,
      today: {
        total: todayStats?.total_reservations ?? 0,
        confirmed: todayStats?.confirmed_reservations ?? 0,
        cancelled: todayStats?.cancelled_reservations ?? 0,
        noShow: todayStats?.no_show_reservations ?? 0,
      },
      occupancy: {
        percentage: occupancy,
        totalTables,
        reservationsToday: upcomingRow?.upcoming ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tables/availability', async (req, res, next) => {
  try {
    const { date, time, partySize = 2 } = req.query;
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Parametrii „date” și „time” sunt obligatorii pentru verificarea disponibilității meselor.',
      });
    }

    const tables = await getAvailableTables(date, time, Number(partySize));

    res.json({
      success: true,
      data: tables.map((table) => ({
        id: table.id,
        tableNumber: table.table_number,
        capacity: table.capacity,
        location: table.location,
        isAvailable: Boolean(table.is_available),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const reservation = await fetchReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită.' });
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/timeline', async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const reservation = await fetchReservationById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită.' });
    }

    const [events, notifications] = await Promise.all([
      runAll(
        `
          SELECT id, event_type as eventType, payload, created_by as createdBy, created_at as createdAt
          FROM reservation_events
          WHERE reservation_id = ?
          ORDER BY created_at ASC
        `,
        [reservationId],
      ),
      runAll(
        `
          SELECT 
            id,
            notification_type as notificationType,
            delivery_status as deliveryStatus,
            sent_at as sentAt
          FROM reservation_notifications
          WHERE reservation_id = ?
          ORDER BY sent_at ASC
        `,
        [reservationId],
      ),
    ]);

    const timeline = [
      {
        id: `reservation-${reservation.id}-created`,
        eventType: 'created',
        createdAt: reservation.created_at,
        createdBy: reservation.created_by ?? 'legacy.v3',
        payload: {
          customerName: reservation.customer_name,
          partySize: reservation.party_size,
          tableNumber: reservation.table_number,
        },
      },
      ...events.map((event) => ({
        ...event,
        payload: event.payload ? JSON.parse(event.payload) : null,
      })),
      ...notifications.map((notification) => ({
        id: `notification-${notification.id}`,
        eventType: 'notification',
        createdAt: notification.sentAt,
        createdBy: 'notification-service',
        payload: {
          notificationType: notification.notificationType,
          deliveryStatus: notification.deliveryStatus,
        },
      })),
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      reservationTime,
      durationMinutes = 120,
      partySize,
      specialRequests,
      notes,
    } = req.body ?? {};

    if (!tableId || !customerName || !customerPhone || !reservationDate || !reservationTime || !partySize) {
      return res.status(400).json({
        success: false,
        error: 'Câmpurile obligatorii: tableId, customerName, customerPhone, reservationDate, reservationTime, partySize.',
      });
    }

    const availableTables = await getAvailableTables(reservationDate, reservationTime, partySize);
    const selectedTable = availableTables.find((table) => Number(table.id) === Number(tableId));

    if (!selectedTable || !selectedTable.is_available) {
      return res.status(409).json({
        success: false,
        error: 'Masa selectată nu este disponibilă pentru intervalul aleas.',
      });
    }

    const result = await createReservation({
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      reservationTime,
      durationMinutes,
      partySize,
      specialRequests,
    });

    await recordReservationEvent(result.id, 'created', {
      customerName,
      partySize,
      tableId,
      reservationDate,
      reservationTime,
    });

    if (notes) {
      await recordReservationEvent(result.id, 'note_added', { notes });
    }

    const reservation = await fetchReservationById(result.id);

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const existing = await fetchReservationById(reservationId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită.' });
    }

    const {
      tableId = existing.table_id,
      customerName = existing.customer_name,
      customerPhone = existing.customer_phone,
      customerEmail = existing.customer_email,
      reservationDate = existing.reservation_date,
      reservationTime = existing.reservation_time,
      durationMinutes = existing.duration_minutes,
      partySize = existing.party_size,
      specialRequests = existing.special_requests,
      status = existing.status,
    } = req.body ?? {};

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status invalid. Valori permise: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const isTimeChanged =
      reservationDate !== existing.reservation_date ||
      reservationTime !== existing.reservation_time ||
      Number(tableId) !== Number(existing.table_id);

    if (isTimeChanged) {
    const conflict = await runGet(
        `
          SELECT id
          FROM reservations
          WHERE reservation_date = ?
            AND reservation_time = ?
            AND table_id = ?
            AND id != ?
            AND status IN ('pending', 'confirmed', 'seated')
        `,
        [reservationDate, reservationTime, tableId, reservationId],
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          error: 'Există deja o rezervare activă pentru masa și intervalul selectate.',
        });
      }
    }

    await runExec(
      `
        UPDATE reservations
        SET
          table_id = ?,
          customer_name = ?,
          customer_phone = ?,
          customer_email = ?,
          reservation_date = ?,
          reservation_time = ?,
          duration_minutes = ?,
          party_size = ?,
          special_requests = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        tableId,
        customerName,
        customerPhone,
        customerEmail,
        reservationDate,
        reservationTime,
        durationMinutes,
        partySize,
        specialRequests,
        status,
        reservationId,
      ],
    );

    if (isTimeChanged) {
      await updateTableAvailability(
        existing.table_id,
        existing.reservation_date,
        existing.reservation_time,
        true,
        null,
      );
      await updateTableAvailability(tableId, reservationDate, reservationTime, false, reservationId);
    }

    await recordReservationEvent(reservationId, 'updated', {
      changes: {
        tableChanged: Number(tableId) !== Number(existing.table_id),
        timeChanged: reservationTime !== existing.reservation_time,
        dateChanged: reservationDate !== existing.reservation_date,
        partySizeChanged: Number(partySize) !== Number(existing.party_size),
        statusChanged: status !== existing.status,
      },
    });

    const updated = await fetchReservationById(reservationId);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const { status } = req.body ?? {};

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status invalid. Valori permise: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const existing = await fetchReservationById(reservationId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită.' });
    }

    if (existing.status === status) {
      return res.json({ success: true, data: existing });
    }

    await updateReservationStatus(reservationId, status);

    if (['cancelled', 'completed', 'no_show'].includes(status)) {
      await updateTableAvailability(existing.table_id, existing.reservation_date, existing.reservation_time, true, null);
    }

    await recordReservationEvent(reservationId, 'status_changed', {
      from: existing.status,
      to: status,
    });

    const updated = await fetchReservationById(reservationId);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const existing = await fetchReservationById(reservationId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită.' });
    }

    await runExec('DELETE FROM reservation_events WHERE reservation_id = ?', [reservationId]);
    await runExec('DELETE FROM reservation_notifications WHERE reservation_id = ?', [reservationId]);
    await updateTableAvailability(existing.table_id, existing.reservation_date, existing.reservation_time, true, null);
    await runExec('DELETE FROM reservations WHERE id = ?', [reservationId]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/reminder', async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const reservation = await fetchReservationById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită.' });
    }

    await runExec(
      `
        INSERT INTO reservation_notifications (reservation_id, notification_type, delivery_status)
        VALUES (?, 'reminder', 'sent')
      `,
      [reservationId],
    );

    await recordReservationEvent(reservationId, 'reminder_sent', {
      customerEmail: reservation.customer_email,
      customerPhone: reservation.customer_phone,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/export/csv', async (req, res, next) => {
  try {
    const { whereClause, params } = buildReservationFilters(req.query);
    const orderBy = resolveOrderBy(req.query.sort);

    const rows = await runAll(
      `
        SELECT 
          r.*,
          t.table_number,
          t.capacity,
          t.location
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        ${whereClause}
        ORDER BY ${orderBy}
      `,
      params,
    );

    const header = [
      'confirmation_code',
      'customer_name',
      'customer_phone',
      'customer_email',
      'reservation_date',
      'reservation_time',
      'party_size',
      'table_number',
      'status',
      'special_requests',
      'created_at',
      'updated_at',
    ];

    const escape = (value) => {
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csv = [
      header.join(','),
      ...rows.map((row) =>
        [
          row.confirmation_code,
          row.customer_name,
          row.customer_phone,
          row.customer_email,
          row.reservation_date,
          row.reservation_time,
          row.party_size,
          row.table_number,
          row.status,
          row.special_requests,
          row.created_at,
          row.updated_at,
        ]
          .map(escape)
          .join(','),
      ),
    ].join('\n');

    const filename = `reservations-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


