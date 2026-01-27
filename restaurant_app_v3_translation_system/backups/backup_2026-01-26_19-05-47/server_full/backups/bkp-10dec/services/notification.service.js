/**
 * NOTIFICATION SERVICE - Email, SMS, Push Notifications
 * Data: 03 Decembrie 2025
 */

const nodemailer = require('nodemailer');

class NotificationService {
  
  constructor() {
    // Configurare SMTP (Gmail, Mailgun, SendGrid, etc.)
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true pentru 465, false pentru alte porturi
      auth: {
        user: process.env.SMTP_USER || 'restaurant@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    });
  }
  
  /**
   * Trimite email expiry alerts către manageri
   */
  async sendExpiryAlerts(alerts) {
    if (alerts.length === 0) return;
    
    const criticalAlerts = alerts.filter(a => a.alert_level === 'red' || a.alert_level === 'expired');
    
    if (criticalAlerts.length === 0) return;
    
    const emailBody = this.generateExpiryEmailHTML(criticalAlerts);
    
    const mailOptions = {
      from: '"Restaurant App" <alerts@restaurant-app.ro>',
      to: process.env.MANAGER_EMAIL || 'manager@restaurant.ro',
      subject: `🚨 ALERT: ${criticalAlerts.length} ingrediente expiră în < 24h!`,
      html: emailBody
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return false;
    }
  }
  
  /**
   * Generează HTML pentru email expiry alerts
   */
  generateExpiryEmailHTML(alerts) {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .alert { border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; background: #fee2e2; }
          .alert-critical { background: #fecaca; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 ALERTE EXPIRARE CRITICE</h1>
          <p>Restaurant App - ${new Date().toLocaleDateString('ro-RO')}</p>
        </div>
        
        <div style="padding: 20px;">
          <p><strong>ATENȚIE!</strong> Următoarele ingrediente expiră în mai puțin de 24 ore:</p>
          
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Lot</th>
                <th>Expirare</th>
                <th>Zile</th>
                <th>Cantitate</th>
                <th>Valoare</th>
                <th>Locație</th>
                <th>Acțiune</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    alerts.forEach(alert => {
      html += `
        <tr style="background: ${alert.alert_level === 'expired' ? '#fecaca' : '#fee2e2'}">
          <td><strong>${alert.ingredient_name}</strong></td>
          <td>${alert.batch_number}</td>
          <td>${alert.expiry_date}</td>
          <td><strong>${alert.days_until_expiry}</strong></td>
          <td>${alert.remaining_quantity} ${alert.unit}</td>
          <td>${alert.value_at_risk?.toFixed(2)} RON</td>
          <td>${alert.location_name}</td>
          <td><strong>${alert.action_recommended}</strong></td>
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
          
          <div class="alert alert-critical">
            <strong>⚠️ ACȚIUNI URGENTE NECESARE:</strong>
            <ul>
              <li>Verifică stocurile IMEDIAT</li>
              <li>Folosește ingredientele în rețete urgente</li>
              <li>Transferă între gestiuni dacă e posibil</li>
              <li>Retrage din stoc dacă sunt expirate</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Restaurant App V3 - Expiry Management System</p>
          <p>Acest email a fost generat automat de sistemul FEFO</p>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Trimite email recall alert către ANSVSA + clienți
   */
  async sendRecallAlert(recall) {
    const emailBody = this.generateRecallEmailHTML(recall);
    
    const mailOptions = {
      from: '"Restaurant App - URGENT" <alerts@restaurant-app.ro>',
      to: [
        process.env.MANAGER_EMAIL,
        process.env.CHEF_EMAIL,
        'ansvsa@email.ro' // TODO: Email real ANSVSA
      ].filter(Boolean).join(','),
      subject: `🚨 RECALL ALERT: ${recall.recall_number} - ${recall.severity.toUpperCase()}`,
      html: emailBody
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Recall alert email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Recall email error:', error.message);
      return false;
    }
  }
  
  generateRecallEmailHTML(recall) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: #991b1b; color: white; padding: 20px; text-align: center; }
          .alert { border: 3px solid #dc2626; padding: 20px; margin: 20px; background: #fee2e2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 RECALL ALERT - ${recall.severity.toUpperCase()}</h1>
          <h2>${recall.recall_number}</h2>
        </div>
        
        <div class="alert">
          <h3>Detalii Recall:</h3>
          <p><strong>Dată:</strong> ${recall.recall_date}</p>
          <p><strong>Tip:</strong> ${recall.recall_type}</p>
          <p><strong>Motiv:</strong> ${recall.reason}</p>
          <p><strong>Risc sănătate:</strong> ${recall.health_risk}</p>
          <p><strong>Produse afectate:</strong> ${recall.affected_products_count}</p>
          <p><strong>Comenzi afectate:</strong> ${recall.affected_orders_count}</p>
          
          <h3 style="color: #991b1b;">ACȚIUNI LUATE:</h3>
          <p>${recall.action_taken}</p>
        </div>
        
        <div style="padding: 20px;">
          <p><strong>Acest email necesită confirmare de primire și acțiune imediată!</strong></p>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Trimite notificare aprobare Technical Sheet
   */
  async sendTechnicalSheetApproval(techSheet, approverType) {
    const to = approverType === 'chef' 
      ? process.env.CHEF_EMAIL 
      : process.env.MANAGER_EMAIL;
    
    if (!to) return false;
    
    const mailOptions = {
      from: '"Restaurant App" <notifications@restaurant-app.ro>',
      to,
      subject: `📋 Fișă Tehnică necesită aprobare: ${techSheet.name_ro}`,
      html: `
        <h2>Fișă Tehnică Nouă</h2>
        <p>Produs: <strong>${techSheet.name_ro}</strong></p>
        <p>Status: <strong>${techSheet.status}</strong></p>
        <p>Necesită aprobare de la: <strong>${approverType.toUpperCase()}</strong></p>
        <p>
          <a href="http://localhost:3001/admin-vite/technical-sheets/${techSheet.id}" 
             style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Vezi Fișa Tehnică
          </a>
        </p>
      `
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return false;
    }
  }
}

module.exports = new NotificationService();

