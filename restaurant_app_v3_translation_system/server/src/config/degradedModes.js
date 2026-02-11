
// ===========================================
// HORECA AI - DEGRADED MODE CATALOG (v1.0)
// ===========================================
// This file defines the behavior of the system under partial failure.
// It is the "Survival Guide" for the R.O.S.

export const DEGRADED_MODES = {
    // ------------------------------------------------------------
    // 1. FISCAL HARDWARE FAILURE (Printer Jam / Connection Lost)
    // ------------------------------------------------------------
    FISCAL_FAILURE: {
        status: 'ACTIVE', // or 'INACTIVE'
        trigger: 'PRINTER_TIMEOUT_2S',
        behavior: {
            POS: 'ALLOW_ORDER', // Do not block order taking
            PAYMENT: 'QUEUE_ON_DB', // Save payment, mark fiscal as PENDING
            UI: 'SHOW_WARNING_BANNER', // "Imprimanta Fiscală Offline - Bonul se va tipări automat la reconectare"
            JOB: 'RETRY_EVERY_30S'
        }
    },

    // ------------------------------------------------------------
    // 2. CLOUD SYNC FAILURE (Internet Offline)
    // ------------------------------------------------------------
    CLOUD_OFFLINE: {
        status: 'ACTIVE',
        trigger: 'PING_FAIL_5S',
        behavior: {
            POS: 'LOCAL_ONLY', // Read/Write to SQLite WAL
            DASHBOARD: 'SHOW_STALE_DATA_WARNING', // "Datele sunt locale. Ultima sincronizare: acum 2 ore"
            SYNC: 'QUEUE_OPERATIONS', // Store mutations in `sync_queue` table
            ANAF: 'STORE_XML_LOCALLY' // Do not attempt SPV upload
        }
    },

    // ------------------------------------------------------------
    // 3. INVENTORY SERVICE LATENCY (Stock API Slow)
    // ------------------------------------------------------------
    STOCK_LATENCY: {
        status: 'INACTIVE',
        trigger: 'RESPONSE_TIME_GT_200MS',
        behavior: {
            POS: 'OPTIMISTIC_DECREMENT', // Assume stock is available
            VALIDATION: 'SKIP_STRICT_CHECK', // Do not block sale for stock check
            AUDIT: 'LOG_POTENTIAL_MISMATCH' // Reconcile later
        }
    },

    // ------------------------------------------------------------
    // 4. ANALYTICS OVERLOAD (High Database Load)
    // ------------------------------------------------------------
    ANALYTICS_LOAD: {
        status: 'INACTIVE',
        trigger: 'CPU_GT_80_PERCENT',
        behavior: {
            REPORTS: 'DISABLE_REALTIME', // "Rapoartele sunt temporar dezactivate pentru performanță"
            POS: 'PRIORITY_HIGH' // Allocate all resources to transaction processing
        }
    }
};
