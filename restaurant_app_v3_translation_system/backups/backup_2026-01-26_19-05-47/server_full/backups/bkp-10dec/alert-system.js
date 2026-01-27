/**
 * 🚨 ALERT SYSTEM - Email/SMS pentru evenimente critice
 * Inspirat din Toast POS, Square, Lightspeed
 */

const nodemailer = require('nodemailer');
// const twilio = require('twilio'); // Decomentează când instalezi twilio

class AlertSystem {
  constructor() {
    this.emailClient = null;
    this.smsClient = null;
    this.initialized = false;
  }

  /**
   * Inițializează clienții email și SMS
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Email client (nodemailer)
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.emailClient = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true pentru 465, false pentru alte porturi
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        console.log('✅ Alert System - Email client inițializat');
      } else {
        console.warn('⚠️ Alert System - SMTP configurări lipsă, email alerts dezactivate');
      }

      // SMS client (twilio) - opțional
      // if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
      //   this.smsClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      //   console.log('✅ Alert System - SMS client inițializat');
      // } else {
      //   console.warn('⚠️ Alert System - Twilio configurări lipsă, SMS alerts dezactivate');
      // }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Eroare la inițializarea Alert System:', error);
    }
  }

  /**
   * Trimite alertă (email/SMS) pentru evenimente critice
   * @param {string} type - Tip alertă (STOCK_CRITICAL, ORDERS_DELAYED, PAYMENT_FAILED, SECURITY_BREACH)
   * @param {string} severity - Severitate (critical, high, medium, low)
   * @param {string} message - Mesaj alertă
   * @param {object} data - Date suplimentare
   */
  async sendAlert(type, severity, message, data = {}) {
    await this.initialize();

    const alert = {
      type,
      severity, // 'critical', 'high', 'medium', 'low'
      message,
      data,
      timestamp: new Date().toISOString()
    };

    try {
      // Log în DB (dacă există tabel system_alerts)
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      
      db.run(`
        INSERT INTO system_alerts (type, severity, message, data, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `, [type, severity, message, JSON.stringify(data), alert.timestamp], (err) => {
        if (err && !err.message.includes('no such table')) {
          console.error('❌ Eroare la logarea alertă:', err);
        }
      });

      // Trimite notificări pe baza severității
      if (severity === 'critical') {
        await this.sendEmail(alert);
        // await this.sendSMS(alert); // Decomentează când instalezi twilio
      } else if (severity === 'high') {
        await this.sendEmail(alert);
      }

      // Socket.IO pentru dashboard real-time (dacă există)
      try {
        const { io } = require('./server');
        if (io) {
          io.emit('system:alert', alert);
        }
      } catch (err) {
        // Socket.IO nu este disponibil - ignoră
      }

      console.log(`🚨 Alert ${severity.toUpperCase()}: ${message}`);
    } catch (error) {
      console.error('❌ Eroare la trimiterea alertă:', error);
    }
  }

  /**
   * Trimite email alertă
   */
  async sendEmail(alert) {
    if (!this.emailClient) {
      console.warn('⚠️ Email client nu este inițializat');
      return;
    }

    try {
      // Obține destinatarii (admin, manager)
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      
      db.all(
        `SELECT email FROM users u 
         JOIN user_roles ur ON u.role_id = ur.id 
         WHERE ur.role_name IN ('Super Admin', 'Manager') AND u.is_active = 1 AND email IS NOT NULL`,
        async (err, recipients) => {
          if (err || !recipients || recipients.length === 0) {
            console.warn('⚠️ Nu există destinatari pentru email alerts');
            return;
          }

          const recipientEmails = recipients.map(r => r.email).join(', ');

          try {
            await this.emailClient.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER,
              to: recipientEmails,
              subject: `[${alert.severity.toUpperCase()}] ${alert.message}`,
              html: `
                <h2>🚨 Alertă Sistem HORECA</h2>
                <p><strong>Tip:</strong> ${alert.type}</p>
                <p><strong>Severitate:</strong> ${alert.severity}</p>
                <p><strong>Mesaj:</strong> ${alert.message}</p>
                <p><strong>Data:</strong> ${new Date(alert.timestamp).toLocaleString('ro-RO')}</p>
                <pre>${JSON.stringify(alert.data, null, 2)}</pre>
                <hr>
                <p><small>Acest email a fost generat automat de sistemul HORECA.</small></p>
              `
            });
            console.log(`✅ Email alert trimis către: ${recipientEmails}`);
          } catch (emailError) {
            console.error('❌ Eroare la trimiterea email:', emailError);
          }
        }
      );
    } catch (error) {
      console.error('❌ Eroare la sendEmail:', error);
    }
  }

  /**
   * Trimite SMS alertă (opțional - necesită Twilio)
   */
  async sendSMS(alert) {
    // Decomentează când instalezi twilio
    // if (!this.smsClient) {
    //   console.warn('⚠️ SMS client nu este inițializat');
    //   return;
    // }

    // try {
    //   const { dbPromise } = require('./database');
    //   const db = await dbPromise;
    //   
    //   db.all(
    //     `SELECT phone FROM users WHERE role = 'Super Admin' AND phone IS NOT NULL`,
    //     async (err, phones) => {
    //       if (err || !phones || phones.length === 0) return;
    //       
    //       for (const { phone } of phones) {
    //         try {
    //           await this.smsClient.messages.create({
    //             body: `[HORECA ALERT] ${alert.message}`,
    //             from: process.env.TWILIO_PHONE,
    //             to: phone
    //           });
    //         } catch (smsError) {
    //           console.error(`❌ Eroare la trimiterea SMS către ${phone}:`, smsError);
    //         }
    //       }
    //     }
    //   );
    // } catch (error) {
    //   console.error('❌ Eroare la sendSMS:', error);
    // }
  }
}

// Singleton instance
const alertSystem = new AlertSystem();

// Funcții helper pentru alerte comune
async function checkCriticalStock() {
  try {
    const { dbPromise } = require('./database');
    const db = await dbPromise;
    
    db.all(
      `SELECT name, quantity, min_quantity FROM inventory 
       WHERE quantity <= min_quantity AND quantity > 0`,
      async (err, criticalItems) => {
        if (err) return;
        
        if (criticalItems && criticalItems.length > 0) {
          await alertSystem.sendAlert(
            'STOCK_CRITICAL',
            'high',
            `${criticalItems.length} produse cu stoc critic`,
            { items: criticalItems }
          );
        }
      }
    );
  } catch (error) {
    console.error('❌ Eroare la checkCriticalStock:', error);
  }
}

async function checkPendingOrders() {
  try {
    const { dbPromise } = require('./database');
    const db = await dbPromise;
    
    db.all(
      `SELECT id, table_number, created_at, status 
       FROM orders 
       WHERE status = 'pending' 
       AND datetime(created_at, '+15 minutes') < datetime('now')`,
      async (err, pendingOrders) => {
        if (err) return;
        
        if (pendingOrders && pendingOrders.length > 0) {
          await alertSystem.sendAlert(
            'ORDERS_DELAYED',
            'critical',
            `${pendingOrders.length} comenzi nepreluate > 15 min`,
            { orders: pendingOrders }
          );
        }
      }
    );
  } catch (error) {
    console.error('❌ Eroare la checkPendingOrders:', error);
  }
}

module.exports = {
  alertSystem,
  checkCriticalStock,
  checkPendingOrders
};

