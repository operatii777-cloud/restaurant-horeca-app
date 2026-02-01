/**
 * MARKETING EXECUTION SERVICE
 * 
 * Handles the actual dispatch of marketing messages (SMS/Email).
 * Supports pluggable providers (SendGrid, Twilio, etc.) and a Safety Simulation Mode.
 */

const { dbPromise } = require('../../../database');

class MarketingExecutionService {
    constructor() {
        this.SIMULATION_MODE = process.env.MARKETING_SIMULATION_MODE !== 'false'; // Default to true for safety
        this.providers = {
            email: this.mockEmailProvider,
            sms: this.mockSmsProvider
        };
    }

    /**
     * MOCK PROVIDER: Log email instead of sending
     */
    async mockEmailProvider(to, subject, body) {
        console.log(`[SIMULATION] 📧 Email to: ${to}`);
        console.log(`[SIMULATION] Subject: ${subject}`);
        console.log(`[SIMULATION] Body: ${body.substring(0, 50)}...`);
        return { success: true, id: `mock-email-${Date.now()}` };
    }

    /**
     * MOCK PROVIDER: Log SMS instead of sending
     */
    async mockSmsProvider(phone, message) {
        console.log(`[SIMULATION] 📱 SMS to: ${phone}`);
        console.log(`[SIMULATION] Message: ${message}`);
        return { success: true, id: `mock-sms-${Date.now()}` };
    }

    /**
     * Send a marketing message to a customer
     * @param {Object} customer - Customer object (must have email or phone)
     * @param {Object} campaign - Campaign data (type, template)
     */
    async sendMessage(customer, campaign) {
        try {
            const { type, subject, content } = campaign;
            const contactInfo = type === 'email' ? customer.email : customer.phone;

            if (!contactInfo) {
                console.warn(`[Marketing] Customer ${customer.id || customer.customer_token} has no ${type}`);
                return { success: false, error: `Missing ${type}` };
            }

            // 1. Check Rate Limits (Simple check: Max 1 message per week per type)
            // TODO: Implement DB check here if needed

            // 2. Select Provider
            const provider = this.providers[type];
            if (!provider) {
                throw new Error(`No provider for channel: ${type}`);
            }

            // 3. Execute (or Simulate)
            let result;
            if (this.SIMULATION_MODE) {
                result = await provider(contactInfo, subject, content);
            } else {
                // Real provider logic would go here (e.g., SendGrid API)
                console.warn(`[Marketing] Real ${type} sending not configured yet. Falling back to simulation.`);
                result = await provider(contactInfo, subject, content);
            }

            // 4. Log Communication to DB
            await this.logCommunication(customer, campaign, result);

            return result;

        } catch (error) {
            console.error('[Marketing] Execution Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Log the communication attempt to the database
     */
    async logCommunication(customer, campaign, result) {
        try {
            const db = await dbPromise;
            await new Promise((resolve, reject) => {
                db.run(`
          INSERT INTO marketing_communications (
            customer_token, channel, campaign_name, status, sent_at, metadata
          ) VALUES (?, ?, ?, ?, datetime('now'), ?)
        `, [
                    customer.customer_token || `anon_${Date.now()}`,
                    campaign.type,
                    campaign.name || 'System Auto-Pilot',
                    result.success ? 'sent' : 'failed',
                    JSON.stringify({
                        simulation: this.SIMULATION_MODE,
                        provider_id: result.id,
                        error: result.error
                    })
                ], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            // Don't fail the whole operation just because logging failed, but warn
            console.error('[Marketing] Failed to log communication:', err);
        }
    }

    /**
     * Auto-Pilot Trigger: Process a segment and send messages
     */
    async triggerAutoPilot(segmentName, customers) {
        console.log(`[Marketing] 🚀 Auto-Pilot triggered for segment: ${segmentName}`);

        // Define Strategy per Segment
        let campaign = null;

        if (segmentName === 'VIP Customers') {
            campaign = {
                type: 'sms', // VIPs get SMS for immediacy
                name: 'VIP Welcome',
                content: 'Bine ai venit in clubul VIP! Ai 20% reducere la urmatoarea comanda. Cod: VIP20'
            };
        } else if (segmentName === 'New Customers') {
            campaign = {
                type: 'email',
                name: 'New Customer Welcome',
                subject: 'Multumim pentru vizita!',
                content: 'Speram ca ti-a placut prima comanda. Iata un desert gratuit la urmatoarea vizita!'
            };
        }

        if (!campaign) {
            console.log(`[Marketing] No auto-pilot strategy for segment: ${segmentName}`);
            return { sent: 0, skipped: 0 };
        }

        let sent = 0;
        // Process top 5 customers only (to avoid spamming everyone in simulation loop)
        const targetCustomers = customers.slice(0, 5);

        for (const customer of targetCustomers) {
            // Simplistic extraction of phone/email from token if applicable, or mock it
            // In real app, we would join with specific customer table
            const mockCustomer = {
                ...customer,
                phone: customer.customer_phone || '0700000000', // Fallback for simulation
                email: customer.customer_email || 'client@example.com'
            };

            await this.sendMessage(mockCustomer, campaign);
            sent++;
        }

        return { sent, total: targetCustomers.length };
    }
}

module.exports = new MarketingExecutionService();
