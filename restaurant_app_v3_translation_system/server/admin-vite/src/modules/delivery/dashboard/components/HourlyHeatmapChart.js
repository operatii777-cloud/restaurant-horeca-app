"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HourlyHeatmapChart = HourlyHeatmapChart;
// Day names in Romanian
var DAY_NAMES = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];
// Hours 0-23
var HOURS = Array.from({ length: 24 }, function (_, i) { return i; });
/**
 * Get color based on delivery count
 * Gradient: verde (low) → galben (medium) → roșu (high)
 */
function getHeatmapColor(count, maxCount) {
    if (maxCount === 0)
        return '#f3f4f6'; // gray for no data
    var ratio = count / maxCount;
    if (ratio === 0)
        return '#f3f4f6'; // gray
    if (ratio < 0.33)
        return '#10B981'; // verde (low)
    if (ratio < 0.66)
        return '#F59E0B'; // galben (medium)
    return '#EF4444'; // roșu (high)
}
function HourlyHeatmapChart(_a) {
    var data = _a.data, loading = _a.loading;
    //   const { t } = useTranslation();
    if (loading) {
        return (<div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>);
    }
    if (!data || data.length === 0) {
        return (<div className="h-64 flex items-center justify-center text-gray-500">"nu exista date pentru heatmap"</div>);
    }
    // Create a map for quick lookup: weekday-hour -> data
    var dataMap = new Map();
    data.forEach(function (item) {
        var key = "".concat(item.weekday, "-").concat(item.hour);
        dataMap.set(key, item);
    });
    // Find max count for color scaling
    var maxCount = Math.max.apply(Math, __spreadArray(__spreadArray([], data.map(function (d) { return d.totalDeliveries; }), false), [1], false));
    // Build heatmap grid
    var heatmapGrid = DAY_NAMES.map(function (dayName, dayIndex) {
        var dayNumber = dayIndex + 1; // 1 = Monday, 7 = Sunday
        var hours = HOURS.map(function (hour) {
            var key = "".concat(dayNumber, "-\"Hour\"");
            var item = dataMap.get(key);
            return {
                hour: hour,
                count: (item === null || item === void 0 ? void 0 : item.totalDeliveries) || 0,
                avgMinutes: (item === null || item === void 0 ? void 0 : item.avgDeliveryMinutes) || 0,
                color: getHeatmapColor((item === null || item === void 0 ? void 0 : item.totalDeliveries) || 0, maxCount),
            };
        });
        return { dayName: dayName, dayNumber: dayNumber, hours: hours };
    });
    return (<div className="w-full overflow-x-auto">
      <div className="min-w-full">
        {/* Header with hours */}
        <div className="flex mb-2">
          <div className="w-24 flex-shrink-0"></div>
          <div className="flex-1 grid grid-cols-24 gap-1">
            {HOURS.map(function (hour) { return (<div key={hour} className="text-xs text-center text-gray-600 font-medium" title={"\"Hour\":00"}>
                {hour}
              </div>); })}
          </div>
        </div>

        {/* Heatmap rows */}
        <div className="space-y-1">
          {heatmapGrid.map(function (day) { return (<div key={day.dayNumber} className="flex items-center">
              <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700">
                {day.dayName}
              </div>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {day.hours.map(function (cell, hourIndex) { return (<div key={"".concat(day.dayNumber, "-").concat(hourIndex)} className="aspect-square rounded-sm border border-gray-200 cursor-pointer transition-all hover:scale-110 hover:z-10 hover:shadow-lg relative group" style={{ backgroundColor: cell.color }} title={"".concat(day.dayName, " ").concat(hourIndex, ":00 - ").concat(cell.count, " livr\u0103ri (medie: ").concat(Math.round(cell.avgMinutes), " min)")}>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-semibold">{day.dayName} {hourIndex}:00</div>
                      <div>Livrări: {cell.count}</div>
                      {cell.avgMinutes > 0 && (<div>Medie: {Math.round(cell.avgMinutes)} min</div>)}
                    </div>
                  </div>); })}
              </div>
            </div>); })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="text-xs text-gray-600">Intensitate:</div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-200"></div>
            <span className="text-xs text-gray-600">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-xs text-gray-600">"Scăzut"</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-xs text-gray-600">Mediu</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-xs text-gray-600">Ridicat</span>
          </div>
        </div>
      </div>
    </div>);
}
