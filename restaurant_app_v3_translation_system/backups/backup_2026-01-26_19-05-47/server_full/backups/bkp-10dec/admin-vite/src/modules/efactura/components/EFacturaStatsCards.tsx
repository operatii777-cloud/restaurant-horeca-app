/**
 * PHASE S11 - e-Factura Stats Cards Component
 * 
 * Statistics cards for e-Factura dashboard (S11 Part 5).
 */

import React, { useEffect, useState } from 'react';
import { efacturaApi } from '../../../core/api/efacturaApi';
import type { EFacturaStats } from '../../../types/invoice';
import './EFacturaStatsCards.css';

export function EFacturaStatsCards() {
  const [stats, setStats] = useState<EFacturaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const data = await efacturaApi.getStats(
        firstDay.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      setStats(data);
    } catch (error) {
      console.error('[EFacturaStatsCards] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="efactura-stats-cards">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="efactura-stat-card efactura-stat-card--loading">
            <div className="stat-skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="efactura-stats-cards">
      <div className="efactura-stat-card efactura-stat-card--total">
        <div className="stat-label">Total Facturi</div>
        <div className="stat-value">{stats.totalInvoices}</div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--accepted">
        <div className="stat-label">Acceptate</div>
        <div className="stat-value">{stats.acceptedCount}</div>
        <div className="stat-amount">
          {stats.totalAmountAccepted.toFixed(2)} RON
        </div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--rejected">
        <div className="stat-label">Respinse</div>
        <div className="stat-value">{stats.rejectedCount}</div>
        <div className="stat-amount">
          {stats.totalAmountRejected.toFixed(2)} RON
        </div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--error">
        <div className="stat-label">Erori</div>
        <div className="stat-value">{stats.errorCount}</div>
      </div>

      <div className="efactura-stat-card efactura-stat-card--pending">
        <div className="stat-label">În Coadă</div>
        <div className="stat-value">{stats.pendingCount + stats.queueCount}</div>
      </div>
    </div>
  );
}

