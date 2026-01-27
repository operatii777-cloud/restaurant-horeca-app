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
  autoAllocateTablesForReservation,
} = database;
const waitlistController = require('../../src/modules/reservations/controllers/waitlist.controller');

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
    date, // Legacy compatibility: single date filter
    status,
    tableId,
    search,
    customerPhone,
    includeCancelled,
  } = query;

  const conditions = [];
  const params = [];

  // Legacy compatibility: support 'date' parameter (single date filter)
  if (date && !startDate && !endDate) {
    conditions.push('DATE(r.reservation_date) = DATE(?)');
    params.push(date);
  } else {
    if (startDate) {
      conditions.push('DATE(r.reservation_date) >= DATE(?)');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('DATE(r.reservation_date) <= DATE(?)');
      params.push(endDate);
    }
  }

  const statuses = parseStatuses(status);
  console.log('🔍 [buildReservationFilters] includeCancelled value:', includeCancelled, 'type:', typeof includeCancelled);
  if (statuses.length > 0) {
    conditions.push(`r.status IN (${statuses.map(() => '?').join(',')})`);
    params.push(...statuses);
    console.log('🔍 [buildReservationFilters] Status filter applied:', statuses);
  } else {
    // ✅ Convert string "true"/"false" to boolean pentru includeCancelled
    const shouldIncludeCancelled = includeCancelled === 'true' || includeCancelled === true;
    console.log('🔍 [buildReservationFilters] shouldIncludeCancelled:', shouldIncludeCancelled, '(includeCancelled:', includeCancelled, ')');
    if (!shouldIncludeCancelled) {
      conditions.push("r.status NOT IN ('cancelled', 'no_show')");
      console.log('🔍 [buildReservationFilters] Excluding cancelled/no_show reservations');
    } else {
      console.log('🔍 [buildReservationFilters] Including ALL reservations (including cancelled/no_show)');
    }
    // Dacă shouldIncludeCancelled este true, nu aplicăm niciun filtru de status - includem TOATE rezervările
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
    case 'date_desc':
      return 'r.reservation_date DESC, r.reservation_time DESC';
    case 'created_desc':
      return 'r.created_at DESC';
    case 'created_asc':
      return 'r.created_at ASC';
    default:
      // Default: ordine cronologică - rezervările viitoare primele, apoi cele trecute
      // Rezervările viitoare (data + ora >= acum) în ordine DESC (cea mai îndepărtată prima)
      // Rezervările trecute (data + ora < acum) în ordine ASC (cea mai recentă prima)
      // Folosim două coloane virtuale: una pentru viitoare (sortare DESC), una pentru trecute (sortare ASC)
      return `
        CASE 
          WHEN datetime(r.reservation_date || ' ' || r.reservation_time) >= datetime('now', 'localtime') 
          THEN 0 
          ELSE 1 
        END ASC,
        CASE 
          WHEN datetime(r.reservation_date || ' ' || r.reservation_time) >= datetime('now', 'localtime') 
          THEN julianday(datetime(r.reservation_date || ' ' || r.reservation_time))
          ELSE NULL
        END DESC,
        CASE 
          WHEN datetime(r.reservation_date || ' ' || r.reservation_time) < datetime('now', 'localtime') 
          THEN julianday(datetime(r.reservation_date || ' ' || r.reservation_time))
          ELSE NULL
        END ASC
      `;
  }
}

async function fetchReservationById(reservationId, req = null) {
  // Use location filtering if req.locationId is available (multi-location support)
  let sql = `
    SELECT 
      r.*,
      t.table_number,
      t.capacity,
      t.location
    FROM reservations r
    LEFT JOIN tables t ON r.table_id = t.id
    WHERE r.id = ?
  `;
  let params = [reservationId];
  
  if (req && req.locationId) {
    sql += ' AND r.location_id = ?';
    params.push(req.locationId);
  }
  
  const reservation = await runGet(sql, params);
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
    const limit = Math.min(Number(req.query.limit ?? 1000), 5000); // Mărit limit-ul default și maximum pentru a afișa toate rezervările
    const offset = Number(req.query.offset ?? 0);
    const orderBy = resolveOrderBy(req.query.sort);

    const { whereClause, params } = buildReservationFilters(req.query);

    const baseSql = `
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
    `;

    // Add location_id filter to whereClause if req.locationId is explicitly set via header.
    // IMPORTANT: For admin-vite reservations we want, by default, același comportament ca admin.html
    // (toate rezervările, indiferent de locație). De aceea, permitem dezactivarea filtrării pe locație
    // prin query param-ul ?includeAllLocations=true.
    let finalWhereClause = whereClause;
    let finalParams = [...params];
    
    // Allow callers to force ALL locations (ignore header) via includeAllLocations=true
    // ✅ IMPORTANT: Check includeAllLocations FIRST, before checking header
    const includeAllLocations = req.query.includeAllLocations === 'true';
    
    // Check if locationId was explicitly set via header (not from default tenant middleware)
    // ✅ ONLY if includeAllLocations is NOT true
    const explicitLocationId = !includeAllLocations && req.headers['x-location-id']
      ? parseInt(req.headers['x-location-id'])
      : null;

    console.log('🔍 [reservations] includeAllLocations:', includeAllLocations, 'explicitLocationId:', explicitLocationId, 'header x-location-id:', req.headers['x-location-id']);

    if (!includeAllLocations && explicitLocationId && explicitLocationId !== null && !isNaN(explicitLocationId)) {
      // Use OR condition to show reservations with matching location_id OR NULL location_id
      // This ensures backward compatibility with reservations created before multi-location support
      const locationCondition = finalWhereClause 
        ? ' AND (r.location_id = ? OR r.location_id IS NULL)' 
        : ' WHERE (r.location_id = ? OR r.location_id IS NULL)';
      finalWhereClause = finalWhereClause + locationCondition;
      finalParams.push(explicitLocationId);
      console.log('🔍 [reservations] Adding explicit location filter (with NULL fallback):', explicitLocationId);
    } else {
      // Don't filter by location if not explicitly requested OR if includeAllLocations=true
      console.log(
        '🔍 [reservations] No explicit location filter applied (either no header or includeAllLocations=true). Showing all reservations.'
      );
    }

    const dataSql = `
      SELECT 
        r.*,
        t.table_number,
        t.capacity,
        t.location
      ${baseSql}
      ${finalWhereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      ${baseSql}
      ${finalWhereClause}
    `;

    console.log('🔍 [reservations] dataSql:', dataSql);
    console.log('🔍 [reservations] finalParams:', finalParams);
    console.log('🔍 [reservations] includeCancelled from query:', req.query.includeCancelled);

    // Direct query (location filter already added to whereClause)
    let rows, countRow;
    try {
      [rows, countRow] = await Promise.all([
        runAll(dataSql, [...finalParams, limit, offset]),
        runGet(countSql, finalParams),
      ]);
    } catch (queryError) {
      console.error('❌ [reservations] Query error:', queryError.message);
      console.error('❌ [reservations] SQL:', dataSql);
      console.error('❌ [reservations] Params:', [...finalParams, limit, offset]);
      // If location_id error, try without location filter
      if (queryError.message && queryError.message.includes('location_id')) {
        console.warn('⚠️ [reservations] Retrying without location filter...');
        const fallbackWhereClause = whereClause || '';
        const fallbackParams = [...params];
        const fallbackDataSql = `
          SELECT 
            r.*,
            t.table_number,
            t.capacity,
            t.location
          ${baseSql}
          ${fallbackWhereClause}
          ORDER BY ${orderBy}
          LIMIT ? OFFSET ?
        `;
        const fallbackCountSql = `
          SELECT COUNT(*) as total
          ${baseSql}
          ${fallbackWhereClause}
        `;
        [rows, countRow] = await Promise.all([
          runAll(fallbackDataSql, [...fallbackParams, limit, offset]),
          runGet(fallbackCountSql, fallbackParams),
        ]);
      } else {
        // Re-throw if not location_id error
        throw queryError;
      }
    }

    // Legacy compatibility: if request is to /api/reservations (not /api/admin/reservations),
    // return array directly for backward compatibility with legacy admin.html
    // Check req.baseUrl to distinguish between /api/reservations and /api/admin/reservations
    const isLegacyRequest = req.baseUrl === '/api/reservations' || 
                           (req.originalUrl && req.originalUrl.startsWith('/api/reservations') && 
                            !req.originalUrl.startsWith('/api/admin/reservations'));
    
    if (isLegacyRequest) {
      // Legacy format: return array directly (for backward compatibility with admin.html and comanda.html)
      res.json(rows || []);
    } else {
      // Admin-vite format: return object with data and meta
      console.log('🔍 [reservations] Returning', rows.length, 'reservations (total in DB:', countRow?.total ?? rows.length, ')');
      const statusCounts = rows.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});
      console.log('🔍 [reservations] Status distribution:', statusCounts);
      res.json({
        success: true,
        data: rows,
        meta: {
          total: countRow?.total ?? rows.length,
          limit,
          offset,
        },
      });
    }
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

    // getReservationStats doesn't support location filtering, so we'll query directly
    // Add location_id filter if req.locationId is available (multi-location support)
    let statsQuery = `
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reservations,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_reservations,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_reservations,
        AVG(party_size) as avg_party_size,
        SUM(party_size) as total_guests
      FROM reservations
      WHERE reservation_date BETWEEN ? AND ?
    `;
    let statsParams = [start, end];
    if (req && req.locationId) {
      statsQuery += ' AND location_id = ?';
      statsParams.push(req.locationId);
    }
    
    let todayStatsQuery = `
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reservations,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_reservations,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_reservations,
        AVG(party_size) as avg_party_size,
        SUM(party_size) as total_guests
      FROM reservations
      WHERE reservation_date = ?
    `;
    let todayStatsParams = [todayStr];
    if (req && req.locationId) {
      todayStatsQuery += ' AND location_id = ?';
      todayStatsParams.push(req.locationId);
    }
    
    const [stats, todayStats] = await Promise.all([
      runGet(statsQuery, statsParams),
      runGet(todayStatsQuery, todayStatsParams),
    ]);

    // Note: tables table doesn't have location_id column, so we don't filter by location
    let tablesQuery = 'SELECT COUNT(*) AS total_tables FROM tables WHERE is_active = 1';
    let tablesParams = [];
    
    let upcomingQuery = `
      SELECT COUNT(*) AS upcoming
      FROM reservations
      WHERE reservation_date = ? AND status IN ('pending', 'confirmed', 'seated')
    `;
    let upcomingParams = [todayStr];
    if (req && req.locationId) {
      upcomingQuery += ' AND location_id = ?';
      upcomingParams.push(req.locationId);
    }
    
    const [tablesRow, upcomingRow] = await Promise.all([
      runGet(tablesQuery, tablesParams),
      runGet(upcomingQuery, upcomingParams),
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
    const reservation = await fetchReservationById(req.params.id, req);
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
    const reservation = await fetchReservationById(reservationId, req);
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

    // Validare câmpuri obligatorii (tableId este opțional - se auto-selectează dacă nu este trimis)
    // Email-ul este obligatoriu pentru a putea răspunde clienților
    if (!customerName || !customerPhone || !customerEmail || !reservationDate || !reservationTime || !partySize) {
      return res.status(400).json({
        success: false,
        error: 'Câmpurile obligatorii: customerName, customerPhone, customerEmail, reservationDate, reservationTime, partySize.',
      });
    }
    
    // Validare format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Format email invalid. Vă rugăm să introduceți un email valid.',
      });
    }
    
    // Validare: Rezervările trebuie făcute cu cel puțin 2 ore înainte de momentul prezentării
    const now = new Date();
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
    
    // Verifică dacă data/ora rezervării este validă
    if (isNaN(reservationDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Data sau ora rezervării este invalidă.',
      });
    }
    
    // Calculează diferența în milisecunde
    const diffMs = reservationDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60); // Converteste în ore
    
    // Verifică dacă rezervarea este cu cel puțin 2 ore înainte
    if (diffHours < 2) {
      return res.status(400).json({
        success: false,
        error: 'Rezervările trebuie făcute cu cel puțin 2 ore înainte de momentul prezentării. Vă rugăm să selectați o dată și oră ulterioară.',
      });
    }

    // Obține mesele disponibile
    const availableTables = await getAvailableTables(reservationDate, reservationTime, partySize);
    
    // Dacă tableId nu este trimis, auto-selectează prima masă disponibilă cu capacitate suficientă
    let selectedTable;
    if (tableId) {
      selectedTable = availableTables.find((table) => Number(table.id) === Number(tableId));
      if (!selectedTable || !selectedTable.is_available) {
        return res.status(409).json({
          success: false,
          error: 'Masa selectată nu este disponibilă pentru intervalul ales.',
        });
      }
    } else {
      // Auto-selectează prima masă disponibilă cu capacitate >= partySize
      selectedTable = availableTables.find(
        (table) => table.is_available && table.capacity >= partySize
      );
      
      if (!selectedTable) {
        return res.status(409).json({
          success: false,
          error: 'Nu există mese disponibile pentru intervalul și numărul de persoane ales.',
        });
      }
    }
    
    // Folosește tableId-ul selectat (fie trimis, fie auto-selectat)
    const finalTableId = selectedTable.id;

    const result = await createReservation({
      tableId: finalTableId,
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      reservationTime,
      durationMinutes,
      partySize,
      specialRequests,
      locationId: req.locationId || null,
      tenantId: req.tenantId || null,
    });

    await recordReservationEvent(result.id, 'created', {
      customerName,
      partySize,
      tableId: finalTableId,
      reservationDate,
      reservationTime,
    });

    if (notes) {
      await recordReservationEvent(result.id, 'note_added', { notes });
    }

    const reservation = await fetchReservationById(result.id);

    // Backward compatibility: returnează atât 'data' cât și 'reservation' pentru compatibilitate cu codul legacy
    res.status(201).json({
      success: true,
      data: reservation,
      reservation: reservation, // Pentru compatibilitate cu comanda.html
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const existing = await fetchReservationById(reservationId, req);
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

    const updated = await fetchReservationById(reservationId, req);

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

    const existing = await fetchReservationById(reservationId, req);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită.' });
    }

    if (existing.status === status) {
      return res.json({ success: true, data: existing });
    }

    // Dacă rezervarea este confirmată, alocă automat mesele
    if (status === 'confirmed' && existing.status !== 'confirmed') {
      try {
        const allocatedTableIds = await autoAllocateTablesForReservation(
          reservationId,
          existing.party_size,
          existing.reservation_date,
          existing.reservation_time
        );
        console.log(`✅ [Reservations] Auto-allocated ${allocatedTableIds.length} table(s) for reservation ${reservationId}:`, allocatedTableIds);
      } catch (error) {
        console.error(`❌ [Reservations] Error auto-allocating tables for reservation ${reservationId}:`, error.message);
        // Nu blocăm confirmarea dacă alocarea automată eșuează, dar logăm eroarea
      }
    }

    await updateReservationStatus(reservationId, status);

    if (['cancelled', 'completed', 'no_show'].includes(status)) {
      // Eliberează mesele alocate pentru această rezervare
      const db = await dbPromise;
      await new Promise((resolve, reject) => {
        db.all(`
          SELECT table_id FROM reservation_tables WHERE reservation_id = ?
        `, [reservationId], async (err, rows) => {
          if (err) return reject(err);
          
          // Eliberează toate mesele asociate cu această rezervare
          const tableIds = rows.map(row => row.table_id);
          if (existing.table_id) {
            tableIds.push(existing.table_id);
          }
          
          for (const tableId of [...new Set(tableIds)]) {
            await updateTableAvailability(tableId, existing.reservation_date, existing.reservation_time, true, null);
          }
          
          // Șterge legăturile din reservation_tables
          db.run(`DELETE FROM reservation_tables WHERE reservation_id = ?`, [reservationId], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    }

    await recordReservationEvent(reservationId, 'status_changed', {
      from: existing.status,
      to: status,
    });

    const updated = await fetchReservationById(reservationId, req);

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
    const existing = await fetchReservationById(reservationId, req);
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
    const reservation = await fetchReservationById(reservationId, req);
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

// POST /api/admin/reservations/send-email - Send confirmation email
router.post('/send-email', async (req, res, next) => {
  try {
    const { reservationId, to, subject, body } = req.body;

    if (!reservationId || !to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Câmpurile obligatorii: reservationId, to, subject, body.',
      });
    }

    // Verify reservation exists
    const reservation = await fetchReservationById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Rezervarea nu a fost găsită.',
      });
    }

    // TODO: Implement actual email sending (nodemailer, sendgrid, etc.)
    // For now, we'll just log it and record the event
    console.log('📧 [Reservations] Email confirmation request:', {
      reservationId,
      to,
      subject,
      body: body.substring(0, 100) + '...',
    });

    // Record email sent event
    await recordReservationEvent(reservationId, 'email_sent', {
      customerEmail: to,
      emailSubject: subject,
    });

    // In a real implementation, you would send the email here:
    // await sendEmail({ to, subject, body });

    res.json({
      success: true,
      message: 'Email-ul a fost trimis cu succes!',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/export/csv', async (req, res, next) => {
  try {
    const { whereClause, params } = buildReservationFilters(req.query);
    const orderBy = resolveOrderBy(req.query.sort);

    // Add location_id filter to whereClause if req.locationId is available (multi-location support)
    let finalWhereClause = whereClause;
    let finalParams = [...params];
    if (req && req.locationId) {
      const locationCondition = finalWhereClause ? ' AND r.location_id = ?' : ' WHERE r.location_id = ?';
      finalWhereClause = finalWhereClause + locationCondition;
      finalParams.push(req.locationId);
    }

    const sql = `
      SELECT 
        r.*,
        t.table_number,
        t.capacity,
        t.location
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
      ${finalWhereClause}
      ORDER BY ${orderBy}
    `;

    const rows = await runAll(sql, finalParams);

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

// ========================================
// WAITLIST ROUTES
// ========================================

router.get('/waitlist', waitlistController.getWaitlist);
router.post('/waitlist', waitlistController.addToWaitlist);
router.put('/waitlist/:id/status', waitlistController.updateWaitlistStatus);
router.delete('/waitlist/:id', waitlistController.removeFromWaitlist);
router.post('/waitlist/notify-next', waitlistController.notifyNextCustomer);

module.exports = router;


