// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * USE ALERTS HOOK
 * 
 * Hook React pentru primire alerte real-time via Socket.IO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '@/core/sockets/socketClient';

export interface Alert {
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  data: any;
  timestamp: string;
}

export function useAlerts() {
//   const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    
    // Check initial connection status
    setIsConnected(socket.connected);

    // Listen for connection
    socket.on('connect', () => {
      setIsConnected(true);
    });

    // Listen for disconnection
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for alerts
    const handleAlert = (alert: Alert) => {
      setAlerts(prev => {
        // Add to beginning, keep max 100 alerts
        const newAlerts = [alert, ...prev];
        return newAlerts.slice(0, 100);
      });
    };

    socket.on('alert', handleAlert);

    // Cleanup
    return () => {
      socket.off('alert', handleAlert);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const removeAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getCriticalAlerts = useCallback(() => {
    return alerts.filter(a => a.severity === 'CRITICAL');
  }, [alerts]);

  const getWarningAlerts = useCallback(() => {
    return alerts.filter(a => a.severity === 'WARNING');
  }, [alerts]);

  const getInfoAlerts = useCallback(() => {
    return alerts.filter(a => a.severity === 'INFO');
  }, [alerts]);

  return {
    alerts,
    isConnected,
    clearAlerts,
    removeAlert,
    getCriticalAlerts,
    getWarningAlerts,
    getInfoAlerts,
    criticalCount: getCriticalAlerts().length,
    warningCount: getWarningAlerts().length,
    infoCount: getInfoAlerts().length,
    totalCount: alerts.length,
  };
}

