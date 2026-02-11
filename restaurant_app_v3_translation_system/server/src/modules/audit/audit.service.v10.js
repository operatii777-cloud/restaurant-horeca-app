
// ============================================
// HORECA AI - AUDIT INTERCEPTOR (v1.0)
// ============================================
// This service wraps ANY mutation that affects critical business data.
// It enforces the Human Override Audit Rule (v10.0).

import { PrismaClient } from '@prisma/client';
import { DEGRADED_MODES } from '../../config/degradedModes';

const prisma = new PrismaClient();

/**
 * Executes a function and logs the event (Append-Only).
 * @param {string} tenantId - The tenant context
 * @param {string} locationId - The location context
 * @param {string} eventType - The action (e.g., STOCK_MANUAL_OVERRIDE)
 * @param {string} userId - Who did it
 * @param {string} reason - Why (Mandatory for critical)
 * @param {Function} actionFn - The business logic
 */
export async function withAudit(tenantId, locationId, eventType, userId, reason, actionFn) {
    // 1. Snapshot Before State (if applicable - simplified for example)
    const beforeState = null; // In real implementation, fetch the entity first

    try {
        // 2. Execute Action
        const result = await actionFn();

        // 3. Snapshot After State
        const afterState = result; // The result of the mutation

        // 4. Log Event (Async - do not block the user unless STRICT mode)
        // If Audit fails, we still allow the action if Business Continuity > Audit
        // BUT for Fiscal, we might block.

        // Using DEGRADED MODES logic: If Analytics Load is high, we might drop non-critical logs.
        // However, Fiscal/Stock Overrides are CRITICAL. They are never dropped.

        prisma.eventLog.create({
            data: {
                tenant_id: tenantId,
                location_id: locationId,
                event_type: eventType,
                user_id: userId,
                resource_id: result?.id?.toString() || 'unknown',
                payload_before: beforeState,
                payload_after: afterState,
                metadata: { reason: reason || 'System Action' }
            }
        }).catch(err => {
            console.error('AUDIT LOG FAILURE (Critical):', err);
            // In v10.0, we might want to alert Admin if audit fails repeatedly.
        });

        return result;
    } catch (error) {
        // 5. Log Failure
        prisma.eventLog.create({
            data: {
                tenant_id: tenantId,
                location_id: locationId,
                event_type: eventType + '_FAILED',
                user_id: userId,
                metadata: { reason: reason, error: error.message }
            }
        }).catch(() => { }); // Silent fail on log error
        throw error;
    }
}
