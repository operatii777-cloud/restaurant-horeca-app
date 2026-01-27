// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S11 - e-Factura Charts Component
 * 
 * Charts for e-Factura statistics (S11 Part 5).
 */

import React, { useEffect, useState } from 'react';
import { efacturaApi } from '@/core/api/efacturaApi';
import type { EFacturaChartData } from '@/types/invoice';
import './EFacturaCharts.css';

export function EFacturaCharts() {
//   const { t } = useTranslation();
  const [chartData, setChartData] = useState<EFacturaChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const data = await efacturaApi.getChartData(
        firstDay.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      setChartData(data);
    } catch (error) {
      console.error('EFacturaCharts Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="efactura-charts-loading">
        <p>"se incarca graficele"</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  // Simple bar chart visualization
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.accepted, d.rejected, d.error))
  );

  return (
    <div className="efactura-charts">
      <div className="chart-container">
        <h3 className="chart-title">Facturi pe Zile (Luna Curentă)</h3>
        <div className="chart-bars">
          {chartData.map((data, idx) => (
            <div key={idx} className="chart-bar-group">
              <div className="chart-bar-label">
                {new Date(data.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}
              </div>
              <div className="chart-bars-container">
                <div
                  className="chart-bar chart-bar--accepted"
                  style={{
                    height: `${(data.accepted / maxValue) * 100}%`,
                  }}
                  title={`Acceptate: ${data.accepted}`}
                />
                <div
                  className="chart-bar chart-bar--rejected"
                  style={{
                    height: `${(data.rejected / maxValue) * 100}%`,
                  }}
                  title={`Respinse: ${data.rejected}`}
                />
                <div
                  className="chart-bar chart-bar--error"
                  style={{
                    height: `${(data.error / maxValue) * 100}%`,
                  }}
                  title={`Erori: ${data.error}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color legend-color--accepted"></span>
            <span>Acceptate</span>
          </div>
          <div className="legend-item">
            <span className="legend-color legend-color--rejected"></span>
            <span>Respinse</span>
          </div>
          <div className="legend-item">
            <span className="legend-color legend-color--error"></span>
            <span>Erori</span>
          </div>
        </div>
      </div>
    </div>
  );
}





