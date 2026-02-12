"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryKpiCards = DeliveryKpiCards;
function DeliveryKpiCards(_a) {
    var overview = _a.overview, loading = _a.loading;
    //   const { t } = useTranslation();
    if (loading || !overview) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(function (i) { return (<div key={i} className="bg-white rounded-lg p-6 shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>); })}
      </div>);
    }
    // Calculate additional metrics
    var avgPickupTime = overview.avgAssignMinutes || 0;
    var avgTransitTime = overview.avgTransitMinutes || 0;
    var topPlatform = overview.platformMix && overview.platformMix.length > 0
        ? overview.platformMix[0].platform
        : 'N/A';
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Deliveries */}
      <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
        <div className="text-sm font-medium text-gray-600 mb-1">Total Livrări</div>
        <div className="text-3xl font-bold text-[#FF6B35]">{overview.totalDeliveries}</div>
        <div className="text-xs text-gray-500 mt-1">comenzi delivery</div>
      </div>

      {/* Average Delivery Time */}
      <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
        <div className="text-sm font-medium text-gray-600 mb-1">Medie Livrare</div>
        <div className="text-3xl font-bold text-blue-600">
          {Math.round(overview.avgDeliveryMinutes)}
        </div>
        <div className="text-xs text-gray-500 mt-1">minute</div>
      </div>

      {/* Average Pickup Time */}
      <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
        <div className="text-sm font-medium text-gray-600 mb-1">Medie Pickup</div>
        <div className="text-3xl font-bold text-purple-600">
          {Math.round(avgPickupTime)}
        </div>
        <div className="text-xs text-gray-500 mt-1">minute</div>
      </div>

      {/* SLA % On-Time */}
      <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
        <div className="text-sm font-medium text-gray-600 mb-1">% La Timp (SLA)</div>
        <div className={"text-3xl font-bold ".concat(overview.onTimeRate >= 0.9 ? 'text-green-600' :
            overview.onTimeRate >= 0.7 ? 'text-yellow-600' :
                'text-red-600')}>
          {(overview.onTimeRate * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 mt-1">Target: 90%</div>
      </div>

      {/* Top Platform */}
      <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
        <div className="text-sm font-medium text-gray-600 mb-1">Platform Top</div>
        <div className="text-2xl font-bold text-indigo-600 truncate">
          {topPlatform}
        </div>
        {overview.platformMix && overview.platformMix.length > 0 && (<div className="text-xs text-gray-500 mt-1">
            {(overview.platformMix[0].share * 100).toFixed(1)}% din total
          </div>)}
      </div>
    </div>);
}
