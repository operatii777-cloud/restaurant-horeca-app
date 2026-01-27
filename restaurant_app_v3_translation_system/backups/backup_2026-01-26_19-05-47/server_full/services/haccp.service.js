/**
 * HACCP SERVICE - Sistem complet HACCP pentru ISO 22000
 * Data: 21 Decembrie 2025
 * Conformitate: ISO 22000:2018
 * 
 * FIXED: Folosește dbPromise din database.js (ca restul aplicației)
 */

const { dbPromise } = require('../database');

class HACCPService {
  
  /**
   * Obține conexiunea la baza de date
   * @returns {Promise<Object>} SQLite database connection
   */
  async getDb() {
    return await dbPromise;
  }
  
  /**
   * Verifică dacă o valoare măsurată este în limitele acceptabile
   * @param {number} measuredValue - Valoarea măsurată
   * @param {Object} limit - Obiect cu min_value, max_value, unit
   * @returns {string} - 'ok', 'warning', sau 'critical'
   */
  checkLimit(measuredValue, limit) {
    if (!limit || measuredValue === null || measuredValue === undefined) {
      return 'critical'; // Dacă nu există limite sau valoare, considerăm critic
    }

    // Verificare critical (în afara limitelor)
    if (limit.min_value !== null && measuredValue < limit.min_value) {
      return 'critical';
    }
    if (limit.max_value !== null && measuredValue > limit.max_value) {
      return 'critical';
    }

    // Warning dacă este aproape de limite (90% din rang)
    if (limit.min_value !== null && limit.max_value !== null) {
      const range = limit.max_value - limit.min_value;
      const warningRange = range * 0.1; // 10% din rang pentru warning
      const warningMin = limit.min_value + warningRange;
      const warningMax = limit.max_value - warningRange;
      
      if (measuredValue < warningMin || measuredValue > warningMax) {
        return 'warning';
      }
    }

    return 'ok';
  }

  /**
   * Obține limitele pentru un CCP și un parametru specific
   * @param {number} ccpId - ID-ul CCP-ului
   * @param {string} parameterName - Numele parametrului (ex: 'temperature')
   * @returns {Promise<Object>} - Limită sau null dacă nu există
   */
  async getLimitsForCCP(ccpId, parameterName) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM haccp_limits
        WHERE ccp_id = ? AND parameter_name = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [ccpId, parameterName], (err, row) => {
        if (err) {
          console.error('❌ [HACCP] Eroare la obținerea limitelor:', err);
          return reject(err);
        }
        resolve(row || null);
      });
    });
  }

  /**
   * Înregistrează o monitorizare pentru un CCP
   * @param {number} ccpId - ID-ul CCP-ului
   * @param {string} parameterName - Numele parametrului
   * @param {number} measuredValue - Valoarea măsurată
   * @param {number} userId - ID-ul utilizatorului care face monitorizarea
   * @param {string} notes - Note opționale
   * @returns {Promise<Object>} - Înregistrarea de monitorizare creată
   */
  async recordMonitoring(ccpId, parameterName, measuredValue, userId, notes = null) {
    try {
      const db = await this.getDb();
      
      // 1. Obține limitele pentru CCP
      const limit = await this.getLimitsForCCP(ccpId, parameterName);
      
      if (!limit) {
        throw new Error(`Nu există limite definite pentru CCP ${ccpId} și parametrul ${parameterName}`);
      }

      // 2. Verifică status
      const status = this.checkLimit(measuredValue, limit);

      // 3. Creează înregistrare
      return new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO haccp_monitoring (
            ccp_id, parameter_name, measured_value, unit,
            status, notes, monitored_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          ccpId,
          parameterName,
          measuredValue,
          limit.unit,
          status,
          notes,
          userId
        ], function(err) {
          if (err) {
            console.error('❌ [HACCP] Eroare la crearea înregistrării:', err);
            return reject(err);
          }

          const monitoringId = this.lastID;
          
          if (!monitoringId) {
            console.error('❌ [HACCP] lastID este undefined după INSERT');
            return reject(new Error('Nu s-a putut obține ID-ul înregistrării create'));
          }

          // 4. Dacă status = critical → declanșează alertă (asincron, nu blochează)
          if (status === 'critical') {
            setImmediate(async () => {
              try {
                await haccpService.triggerAlert(monitoringId, ccpId, parameterName, measuredValue, limit);
              } catch (alertErr) {
                console.error('⚠️ [HACCP] Eroare la declanșarea alertei:', alertErr);
                // Nu aruncăm eroare - monitorizarea a fost salvată, doar alerta a eșuat
              }
            });
          }

          // 5. Returnează înregistrarea creată
          db.get('SELECT * FROM haccp_monitoring WHERE id = ?', [monitoringId], (err, row) => {
            if (err) {
              console.error('❌ [HACCP] Eroare la obținerea înregistrării create:', err);
              return reject(err);
            }
            if (!row) {
              console.error(`❌ [HACCP] Înregistrarea cu ID ${monitoringId} nu a fost găsită după creare`);
              return reject(new Error(`Înregistrarea cu ID ${monitoringId} nu a fost găsită`));
            }
            resolve(row);
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Declanșează o alertă pentru o monitorizare critică
   * @param {number} monitoringId - ID-ul înregistrării de monitorizare
   * @param {number} ccpId - ID-ul CCP-ului
   * @param {string} parameterName - Numele parametrului
   * @param {number} measuredValue - Valoarea măsurată
   * @param {Object} limit - Limitele
   * @returns {Promise<Object>} - Acțiunea corectivă sugerată
   */
  async triggerAlert(monitoringId, ccpId, parameterName, measuredValue, limit) {
    const db = await this.getDb();
    
    // Obține informații despre CCP
    const ccp = await this.getCCPById(ccpId);
    
    // Creează notificare (folosind sistemul de notificări existent)
    const notificationMessage = `🔴 LIMITĂ CRITICĂ DEPĂȘITĂ!\n\n` +
      `CCP: ${ccp.ccp_number}\n` +
      `Proces: ${ccp.process_name || 'N/A'}\n` +
      `Parametru: ${parameterName}\n` +
      `Valoare măsurată: ${measuredValue}${limit.unit}\n` +
      `Limite: ${limit.min_value || 'N/A'} - ${limit.max_value || 'N/A'} ${limit.unit}\n` +
      `Acțiune necesară IMEDIATĂ!`;

    // Salvează notificare în baza de date (dacă există tabela notifications)
    db.run(`
      INSERT INTO notifications (type, title, message, status, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, ['haccp_critical', '🔴 ALERTĂ HACCP CRITICĂ', notificationMessage, 'unread'], (err) => {
      if (err) {
        console.error('⚠️ [HACCP] Nu s-a putut salva notificarea (tabela poate să nu existe):', err.message);
      }
    });

    // Returnează acțiune corectivă sugerată
    return {
      monitoring_id: monitoringId,
      ccp_id: ccpId,
      suggested_action: await this.getSuggestedAction(ccpId, parameterName, measuredValue, limit),
      notification_sent: true
    };
  }

  /**
   * Obține o acțiune corectivă sugerată pentru un CCP
   * @param {number} ccpId - ID-ul CCP-ului
   * @param {string} parameterName - Numele parametrului
   * @param {number} measuredValue - Valoare măsurată
   * @param {Object} limit - Limitele
   * @returns {Promise<string>} - Acțiune sugerată
   */
  async getSuggestedAction(ccpId, parameterName, measuredValue, limit) {
    // Acțiuni standardizate bazate pe tipul parametrului
    const actions = {
      temperature: measuredValue < limit.min_value 
        ? `Temperatura este prea scăzută. Verifică echipamentul și ajustează la ${limit.target_value || limit.min_value}${limit.unit}`
        : `Temperatura este prea ridicată. Verifică echipamentul și ajustează la ${limit.target_value || limit.max_value}${limit.unit}`,
      time: `Timpul depășește limita acceptabilă. Verifică procesul și ajustează conform procedurilor.`,
      ph: `pH-ul este în afara limitelor. Verifică și ajustează conform procedurilor.`,
      default: `Parametrul ${parameterName} depășește limitele critice. Verifică procesul și aplică acțiuni corective conform planului HACCP.`
    };

    return actions[parameterName] || actions.default;
  }

  /**
   * Obține un CCP după ID
   * @param {number} ccpId - ID-ul CCP-ului
   * @returns {Promise<Object>} - CCP-ul
   */
  async getCCPById(ccpId) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          c.*,
          p.name as process_name,
          p.category as process_category
        FROM haccp_ccp c
        LEFT JOIN haccp_processes p ON p.id = c.process_id
        WHERE c.id = ?
      `, [ccpId], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  /**
   * Creează o acțiune corectivă
   * @param {number} ccpId - ID-ul CCP-ului
   * @param {number} monitoringId - ID-ul monitorizării (opțional)
   * @param {string} actionTaken - Descrierea acțiunii
   * @param {number} takenBy - ID-ul utilizatorului
   * @returns {Promise<Object>} - Acțiunea corectivă creată
   */
  async createCorrectiveAction(ccpId, monitoringId, actionTaken, takenBy) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO haccp_corrective_actions (
          ccp_id, monitoring_id, action_taken, taken_by
        ) VALUES (?, ?, ?, ?)
      `, [ccpId, monitoringId, actionTaken, takenBy], function(err) {
        if (err) {
          console.error('❌ [HACCP] Eroare la crearea acțiunii corective:', err);
          return reject(err);
        }

        const actionId = this.lastID;
        
        if (!actionId) {
          console.error('❌ [HACCP] lastID este undefined după INSERT corrective action');
          return reject(new Error('Nu s-a putut obține ID-ul acțiunii corective create'));
        }

        // Actualizează monitoring cu corrective_action_id
        if (monitoringId) {
          db.run(`
            UPDATE haccp_monitoring
            SET corrective_action_id = ?
            WHERE id = ?
          `, [actionId, monitoringId], (updateErr) => {
            if (updateErr) {
              console.warn('⚠️ [HACCP] Nu s-a putut actualiza monitoring cu corrective_action_id:', updateErr);
            }
          });
        }

        db.get('SELECT * FROM haccp_corrective_actions WHERE id = ?', [actionId], (err, row) => {
          if (err) return reject(err);
          if (!row) {
            return reject(new Error(`Acțiunea corectivă cu ID ${actionId} nu a fost găsită după creare`));
          }
          resolve(row);
        });
      });
    });
  }

  /**
   * Marchează o acțiune corectivă ca rezolvată
   * @param {number} actionId - ID-ul acțiunii corective
   * @param {string} verificationNotes - Note de verificare
   * @returns {Promise<Object>} - Acțiunea actualizată
   */
  async resolveCorrectiveAction(actionId, verificationNotes = null) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE haccp_corrective_actions
        SET resolved = 1, resolved_at = datetime('now'), verification_notes = ?
        WHERE id = ?
      `, [verificationNotes, actionId], (err) => {
        if (err) {
          console.error('❌ [HACCP] Eroare la rezolvarea acțiunii corective:', err);
          return reject(err);
        }

        db.get('SELECT * FROM haccp_corrective_actions WHERE id = ?', [actionId], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });
    });
  }

  /**
   * Obține toate procesele HACCP
   * @returns {Promise<Array>} - Lista proceselor
   */
  async getAllProcesses() {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM haccp_processes
        ORDER BY sort_order ASC, name ASC
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * Obține toate CCP-urile pentru un proces
   * @param {number} processId - ID-ul procesului
   * @returns {Promise<Array>} - Lista CCP-urilor
   */
  async getCCPsByProcess(processId) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.*,
          COUNT(DISTINCT l.id) as limits_count
        FROM haccp_ccp c
        LEFT JOIN haccp_limits l ON l.ccp_id = c.id
        WHERE c.process_id = ?
        GROUP BY c.id
        ORDER BY c.ccp_number ASC
      `, [processId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * Obține toate limitele pentru un CCP
   * @param {number} ccpId - ID-ul CCP-ului
   * @returns {Promise<Array>} - Lista limitelor
   */
  async getLimitsByCCP(ccpId) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM haccp_limits
        WHERE ccp_id = ? AND is_active = 1
        ORDER BY parameter_name ASC
      `, [ccpId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * Obține înregistrări monitorizare cu filtre
   * @param {Object} filters - Filtre (ccp_id, status, date_from, date_to, limit, offset)
   * @returns {Promise<Array>} - Lista monitorizări
   */
  async getMonitoring(filters = {}) {
    const db = await this.getDb();
    
    let query = `
      SELECT 
        hm.*,
        hc.ccp_number,
        hc.hazard_description,
        hp.name as process_name
      FROM haccp_monitoring hm
      LEFT JOIN haccp_ccp hc ON hm.ccp_id = hc.id
      LEFT JOIN haccp_processes hp ON hc.process_id = hp.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.ccp_id) {
      query += ' AND hm.ccp_id = ?';
      params.push(filters.ccp_id);
    }

    if (filters.status) {
      query += ' AND hm.status = ?';
      params.push(filters.status);
    }

    if (filters.date_from) {
      query += ' AND date(hm.monitored_at) >= date(?)';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND date(hm.monitored_at) <= date(?)';
      params.push(filters.date_to);
    }

    query += ' ORDER BY hm.monitored_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * Obține statistici monitorizare pentru dashboard
   * @returns {Promise<Object>} - Statistici
   */
  async getMonitoringStats() {
    const db = await this.getDb();
    
    // Monitorizări astăzi
    const monitoringsToday = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM haccp_monitoring WHERE date(monitored_at) = date('now')",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    });

    // Alerte critice active
    const criticalAlerts = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM haccp_monitoring WHERE status = 'critical' AND date(monitored_at) = date('now')",
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    });

    // Acțiuni în curs
    const pendingActions = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM haccp_corrective_actions WHERE resolved = 0',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        }
      );
    });

    // Rata conformitate (procent monitorizări OK din total)
    const complianceRate = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          ROUND(
            (CAST(SUM(CASE WHEN status = 'ok' THEN 1 ELSE 0 END) AS REAL) / COUNT(*)) * 100,
            1
          ) as rate
        FROM haccp_monitoring
        WHERE date(monitored_at) >= date('now', '-7 days')`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? (row.rate || 0) : 0);
        }
      );
    });

    return {
      monitoringsToday,
      criticalAlerts,
      pendingActions,
      complianceRate
    };
  }
}

const haccpService = new HACCPService();
module.exports = haccpService;
