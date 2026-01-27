// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - Invoice Logs Panel Component
 * 
 * Displays ANAF submission logs and journal entries.
 */

import React, { useEffect, useState } from 'react';
import { efacturaApi } from '@/core/api/efacturaApi';
import './InvoiceLogsPanel.css';

interface ANAFLogEntry {
  id: number;
  timestamp: string;
  status: string;
  message?: string;
  responseXml?: string;
  attempts: number;
}

export function InvoiceLogsPanel({ invoiceId }: { invoiceId: number }) {
//   const { t } = useTranslation();
  const [logs, setLogs] = useState<ANAFLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [invoiceId]);

  const loadLogs = async () => {
    try {
      // Assuming endpoint: GET /api/anaf/journal?invoiceId=:id
      const response = await fetch(`/api/anaf/journal?invoiceId=${invoiceId}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('InvoiceLogsPanel Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="invoice-logs-loading">
        <p>"se incarca jurnalul"</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="invoice-logs-empty">
        <p>"nu exista intrari in jurnal pentru aceasta factura"</p>
      </div>
    );
  }

  return (
    <div className="invoice-logs-panel">
      <h3 className="logs-title">Jurnal ANAF</h3>
      <div className="logs-list">
        {logs.map((log) => (
          <div key={log.id} className="log-entry">
            <div className="log-header">
              <span className="log-timestamp">
                {new Date(log.timestamp).toLocaleString('ro-RO')}
              </span>
              <span className={`log-status log-status--${log.status.toLowerCase()}`}>
                {log.status}
              </span>
            </div>
            {log.message && (
              <div className="log-message">{log.message}</div>
            )}
            {log.attempts > 0 && (
              <div className="log-attempts">Tentative: {log.attempts}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}





