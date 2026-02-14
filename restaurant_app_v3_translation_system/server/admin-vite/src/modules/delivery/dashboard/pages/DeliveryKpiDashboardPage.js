"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S17.H - Delivery KPI Dashboard Page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryKpiDashboardPage = DeliveryKpiDashboardPage;
var react_1 = require("react");
var useDeliveryKpi_1 = require("../hooks/useDeliveryKpi");
var DeliveryKpiCards_1 = require("../components/DeliveryKpiCards");
var DeliveryTimeseriesChart_1 = require("../components/DeliveryTimeseriesChart");
var PlatformMixChart_1 = require("../components/PlatformMixChart");
var HourlyHeatmapChart_1 = require("../components/HourlyHeatmapChart");
function DeliveryKpiDashboardPage() {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(''), dateFrom = _a[0], setDateFrom = _a[1];
    var _b = (0, react_1.useState)(''), dateTo = _b[0], setDateTo = _b[1];
    // Calculate default date range (last 30 days)
    var getDefaultDateRange = function () {
        var today = new Date();
        var thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
            from: thirtyDaysAgo.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        };
    };
    var defaultRange = getDefaultDateRange();
    var filters = {
        dateFrom: dateFrom || defaultRange.from,
        dateTo: dateTo || defaultRange.to
    };
    var _c = (0, useDeliveryKpi_1.useDeliveryOverview)(filters), overview = _c.data, overviewLoading = _c.isLoading;
    var _d = (0, useDeliveryKpi_1.useDeliveryByCourier)(filters), couriers = _d.data, couriersLoading = _d.isLoading;
    var _e = (0, useDeliveryKpi_1.useDeliveryTimeseries)(filters), timeseries = _e.data, timeseriesLoading = _e.isLoading;
    var _f = (0, useDeliveryKpi_1.useDeliveryHeatmap)(filters), heatmap = _f.data, heatmapLoading = _f.isLoading;
    return (<div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">"delivery kpi dashboard"</h1>
        
        {/* Date Filters */}
        <div className="flex gap-4">
          <label className="sr-only">"data de la"</label>
          <input type="date" value={dateFrom || defaultRange.from} onChange={function (e) { return setDateFrom(e.target.value); }} className="px-4 py-2 border rounded-lg" title="data de la" aria-label="data de la"/>
          <label className="sr-only">"data pana la"</label>
          <input type="date" value={dateTo || defaultRange.to} onChange={function (e) { return setDateTo(e.target.value); }} className="px-4 py-2 border rounded-lg" title="data pana la" aria-label="data pana la"/>
        </div>
      </div>
      
      {/* KPI Cards */}
      <DeliveryKpiCards_1.DeliveryKpiCards overview={overview} loading={overviewLoading}/>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeseries Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">"evolutie zilnica"</h2>
          <DeliveryTimeseriesChart_1.DeliveryTimeseriesChart data={timeseries || null} loading={timeseriesLoading}/>
        </div>
        
        {/* Platform Mix Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">"platform mix"</h2>
          <PlatformMixChart_1.PlatformMixChart overview={overview} loading={overviewLoading}/>
        </div>
      </div>
      
      {/* Courier Score Table */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">"scor curieri"</h2>
        {couriersLoading ? (<div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
          </div>) : (<div className="overflow-x-auto">
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
                {couriers === null || couriers === void 0 ? void 0 : couriers.map(function (courier) { return (<tr key={courier.courierId} className="border-b">
                    <td className="p-2 font-medium">{courier.name}</td>
                    <td className="p-2 text-right">{courier.totalDeliveries}</td>
                    <td className="p-2 text-right">{courier.avgDeliveryMinutes}</td>
                    <td className="p-2 text-right">{(courier.onTimeRate * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right">{(courier.cancelRate * 100).toFixed(1)}%</td>
                    <td className="p-2 text-right">
                      <span className={"font-bold ".concat(courier.score >= 4.5 ? 'text-green-600' :
                    courier.score >= 4 ? 'text-blue-600' :
                        courier.score >= 3 ? 'text-yellow-600' :
                            'text-red-600')}>
                        {courier.score.toFixed(1)}
                      </span>
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </div>)}
      </div>
      
      {/* Heatmap */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Heatmap Orară / Zi Săptămână</h2>
        <HourlyHeatmapChart_1.HourlyHeatmapChart data={heatmap || null} loading={heatmapLoading}/>
      </div>
    </div>);
}
