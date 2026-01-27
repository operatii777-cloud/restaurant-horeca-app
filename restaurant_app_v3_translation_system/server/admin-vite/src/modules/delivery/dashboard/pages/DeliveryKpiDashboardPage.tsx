// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S17.H - Delivery KPI Dashboard Page
 */

import { useState } from 'react';
import { useDeliveryOverview, useDeliveryByCourier, useDeliveryTimeseries, useDeliveryHeatmap } from '../hooks/useDeliveryKpi';
import { DeliveryKpiCards } from '../components/DeliveryKpiCards';
import { DeliveryTimeseriesChart } from '../components/DeliveryTimeseriesChart';
import { PlatformMixChart } from '../components/PlatformMixChart';
import { HourlyHeatmapChart } from '../components/HourlyHeatmapChart';

export function DeliveryKpiDashboardPage() {
//   const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  // Calculate default date range (last 30 days)
  const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    return {
      from: thirtyDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  };
  
  const defaultRange = getDefaultDateRange();
  const filters = {
    dateFrom: dateFrom || defaultRange.from,
    dateTo: dateTo || defaultRange.to
  };
  
  const { data: overview, isLoading: overviewLoading } = useDeliveryOverview(filters);
  const { data: couriers, isLoading: couriersLoading } = useDeliveryByCourier(filters);
  const { data: timeseries, isLoading: timeseriesLoading } = useDeliveryTimeseries(filters);
  const { data: heatmap, isLoading: heatmapLoading } = useDeliveryHeatmap(filters);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">"delivery kpi dashboard"</h1>
        
        {/* Date Filters */}
        <div className="flex gap-4">
          <label className="sr-only">"data de la"</label>
          <input
            type="date"
            value={dateFrom || defaultRange.from}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            title="data de la"
            aria-label="data de la"
          />
          <label className="sr-only">"data pana la"</label>
          <input
            type="date"
            value={dateTo || defaultRange.to}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            title="data pana la"
            aria-label="data pana la"
          />
        </div>
      </div>
      
      {/* KPI Cards */}
      <DeliveryKpiCards overview={overview} loading={overviewLoading} />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeseries Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">"evolutie zilnica"</h2>
          <DeliveryTimeseriesChart data={timeseries || null} loading={timeseriesLoading} />
        </div>
        
        {/* Platform Mix Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">"platform mix"</h2>
          <PlatformMixChart overview={overview} loading={overviewLoading} />
        </div>
      </div>
      
      {/* Courier Score Table */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">"scor curieri"</h2>
        {couriersLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Curier</th>
                  <th className="text-right p-2">"Livrări"</th>
                  <th className="text-right p-2">Medie (min)</th>
                  <th className="text-right p-2">% La Timp</th>
                  <th className="text-right p-2">% Anulate</th>
                  <th className="text-right p-2">Scor</th>
                </tr>
              </thead>
              <tbody>
                {couriers?.map((courier) => (
                  <tr key={courier.courierId} className="border-b">
                    <td className="p-2 font-medium">{courier.name}</td>
                    <td className="p-2 text-right">{courier.totalDeliveries}</td>
                    <td className="p-2 text-right">{courier.avgDeliveryMinutes}</td>
                    <td className="p-2 text-right">{(courier.onTimeRate * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right">{(courier.cancelRate * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right">
                      <span className={`font-bold ${
                        courier.score >= 4.5 ? 'text-green-600' :
                        courier.score >= 4 ? 'text-blue-600' :
                        courier.score >= 3 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {courier.score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Heatmap */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Heatmap Orară / Zi Săptămână</h2>
        <HourlyHeatmapChart data={heatmap || null} loading={heatmapLoading} />
      </div>
    </div>
  );
}




