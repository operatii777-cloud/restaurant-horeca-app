/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ALERTS DISPLAY COMPONENT
 * 
 * Component React pentru afișare alerte real-time
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect } from 'react';
import { Card, Badge, Button, Alert as BootstrapAlert } from 'react-bootstrap';
import { useAlerts, type Alert } from '../hooks/useAlerts';
import { toast } from 'react-toastify';
import type { TypeOptions } from '@/types/react-toastify';
import './AlertsDisplay.css';

interface AlertsDisplayProps {
  maxVisible?: number;
  showToast?: boolean;
  autoDismiss?: boolean;
  dismissDelay?: number;
}


export const AlertsDisplay: React.FC<AlertsDisplayProps> = ({
  maxVisible = 10,
  showToast = true,
  autoDismiss = false,
  dismissDelay = 5000,
}) => {
  // Eliminat hook-ul de traduceri, folosim doar text static
  const {
    alerts,
    isConnected,
    removeAlert,
    clearAlerts,
    criticalCount,
    warningCount,
    infoCount,
    totalCount,
  } = useAlerts();

  // Show toast notifications for new alerts
  useEffect(() => {
    if (!showToast || alerts.length === 0) return;

    const latestAlert = alerts[0];
    
    // Only show toast for critical and warning alerts
    if (latestAlert.severity === 'CRITICAL' || latestAlert.severity === 'WARNING') {
      const toastOptions = {
        type: (latestAlert.severity === 'CRITICAL' ? 'error' : 'warning') as TypeOptions,
        autoClose: dismissDelay,
        position: 'top-right' as const,
      };

      toast(latestAlert.message, toastOptions);
    }
  }, [alerts, showToast, dismissDelay]);

  // Auto-dismiss alerts after delay
  useEffect(() => {
    if (!autoDismiss) return;

    const timer = setTimeout(() => {
      // Remove oldest alerts (keep only recent ones)
      if (alerts.length > maxVisible) {
        alerts.slice(maxVisible).forEach((_, index) => {
          removeAlert(maxVisible + index);
        });
      }
    }, dismissDelay);

    return () => clearTimeout(timer);
  }, [alerts, autoDismiss, dismissDelay, maxVisible, removeAlert]);

  const getSeverityVariant = (severity: Alert['severity']): 'danger' | 'warning' | 'info' => {
    switch (severity) {
      case 'CRITICAL':
        return 'danger';
      case 'WARNING':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getSeverityIcon = (severity: Alert['severity']): string => {
    switch (severity) {
      case 'CRITICAL':
        return '🚨';
      case 'WARNING':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const visibleAlerts = alerts.slice(0, maxVisible);

  return (
    <Card className="alerts-display-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Alerte Sistem</h5>
          <small className="text-muted">
            {isConnected ? (
              <Badge bg="success">Conectat</Badge>
            ) : (
              <Badge bg="secondary">Deconectat</Badge>
            )}
          </small>
        </div>
        <div className="d-flex gap-2">
          {criticalCount > 0 && (
            <Badge bg="danger">{criticalCount} Critice</Badge>
          )}
          {warningCount > 0 && (
            <Badge bg="warning" text="dark">{warningCount} Avertismente</Badge>
          )}
          {infoCount > 0 && (
            <Badge bg="info">{infoCount} Info</Badge>
          )}
          {totalCount > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={clearAlerts}
            >Șterge toate</Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="alerts-body">
        {visibleAlerts.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p className="mb-0">Nu există alerte</p>
            <small>Sistemul funcționează normal</small>
          </div>
        ) : (
          <div className="alerts-list">
            {visibleAlerts.map((alert, index) => (
              <BootstrapAlert
                key={`${alert.timestamp}-"Index"`}
                variant={getSeverityVariant(alert.severity)}
                className="alert-item"
                dismissible
                onClose={() => removeAlert(index)}
              >
                <div className="d-flex align-items-start">
                  <span className="alert-icon me-2">{getSeverityIcon(alert.severity)}</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong>{alert.message}</strong>
                      <small className="text-muted ms-2">
                        {new Date(alert.timestamp).toLocaleTimeString('ro-RO')}
                      </small>
                    </div>
                    {alert.data && Object.keys(alert.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-muted" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>Detalii</summary>
                        <pre className="mt-2 mb-0" style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: "Auto" }}>
                          {JSON.stringify(alert.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </BootstrapAlert>
            ))}
          </div>
        )}
        {alerts.length > maxVisible && (
          <div className="text-center mt-3">
            <small className="text-muted">
              Afișate {maxVisible} din {totalCount} alerte
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
