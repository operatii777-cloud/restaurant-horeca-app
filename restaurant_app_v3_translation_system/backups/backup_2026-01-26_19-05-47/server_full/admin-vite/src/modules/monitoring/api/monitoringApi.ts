/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MONITORING API CLIENT
 * 
 * API client pentru monitoring și health checks
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { httpClient } from '@/shared/api/httpClient';

export interface MonitoringHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    formatted: string;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usage_percent: number;
    status: 'ok' | 'warning' | 'critical';
  };
  disk: {
    status: 'ok' | 'warning' | 'critical' | 'error';
    note?: string;
    error?: string;
  };
  database: {
    status: 'healthy' | 'error';
    response_time_ms: number;
    table_count: number;
    status_level: 'ok' | 'warning' | 'slow' | 'critical';
    error?: string;
  };
  performance: {
    avg_response_time: number;
    min_response_time: number;
    max_response_time: number;
    sample_count: number;
    status: 'ok' | 'warning' | 'slow' | 'no_data';
  };
  timestamp: string;
}

export interface MonitoringAlert {
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  data: any;
  timestamp: string;
}

export const monitoringApi = {
  /**
   * GET /api/monitoring/health
   * Obține status complet monitoring
   */
  getHealth: () => {
    return httpClient.get<{ success: boolean; data: MonitoringHealth }>(
      '/api/monitoring/health'
    );
  },

  /**
   * GET /api/monitoring/alerts
   * Obține alerte monitoring
   */
  getAlerts: () => {
    return httpClient.get<{ success: boolean; alerts: MonitoringAlert[] }>(
      '/api/monitoring/alerts'
    );
  },
};
