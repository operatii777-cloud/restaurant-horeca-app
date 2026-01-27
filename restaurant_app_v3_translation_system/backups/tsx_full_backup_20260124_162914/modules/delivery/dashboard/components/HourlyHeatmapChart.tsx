// import { useTranslation } from '@/i18n/I18nContext';
import type { HeatmapData } from "../../api/types";

/**
 * FAZA 4.3 - Hourly Heatmap Chart
 * 
 * Heatmap showing delivery distribution by hour and day of week
 * 7 days × 24 hours
 * Cells colored by number of deliveries
 * Gradient: verde → galben → roșu
 */



interface HourlyHeatmapChartProps {
  data: HeatmapData[] | null;
  loading?: boolean;
}

// Day names in Romanian
const DAY_NAMES = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

// Hours 0-23
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Get color based on delivery count
 * Gradient: verde (low) → galben (medium) → roșu (high)
 */
function getHeatmapColor(count: number, maxCount: number): string {
  if (maxCount === 0) return '#f3f4f6'; // gray for no data
  
  const ratio = count / maxCount;
  
  if (ratio === 0) return '#f3f4f6'; // gray
  if (ratio < 0.33) return '#10B981'; // verde (low)
  if (ratio < 0.66) return '#F59E0B'; // galben (medium)
  return '#EF4444'; // roșu (high)
}

export function HourlyHeatmapChart({ data, loading }: HourlyHeatmapChartProps) {
//   const { t } = useTranslation();
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">"nu exista date pentru heatmap"</div>
    );
  }

  // Create a map for quick lookup: weekday-hour -> data
  const dataMap = new Map<string, HeatmapData>();
  data.forEach((item) => {
    const key = `${item.weekday}-${item.hour}`;
    dataMap.set(key, item);
  });

  // Find max count for color scaling
  const maxCount = Math.max(...data.map(d => d.totalDeliveries), 1);

  // Build heatmap grid
  const heatmapGrid = DAY_NAMES.map((dayName, dayIndex) => {
    const dayNumber = dayIndex + 1; // 1 = Monday, 7 = Sunday
    const hours = HOURS.map((hour) => {
      const key = `${dayNumber}-"Hour"`;
      const item = dataMap.get(key);
      return {
        hour,
        count: item?.totalDeliveries || 0,
        avgMinutes: item?.avgDeliveryMinutes || 0,
        color: getHeatmapColor(item?.totalDeliveries || 0, maxCount),
      };
    });
    return { dayName, dayNumber, hours };
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        {/* Header with hours */}
        <div className="flex mb-2">
          <div className="w-24 flex-shrink-0"></div>
          <div className="flex-1 grid grid-cols-24 gap-1">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="text-xs text-center text-gray-600 font-medium"
                title={`"Hour":00`}
              >
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap rows */}
        <div className="space-y-1">
          {heatmapGrid.map((day) => (
            <div key={day.dayNumber} className="flex items-center">
              <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700">
                {day.dayName}
              </div>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {day.hours.map((cell, hourIndex) => (
                  <div
                    key={`${day.dayNumber}-${hourIndex}`}
                    className="aspect-square rounded-sm border border-gray-200 cursor-pointer transition-all hover:scale-110 hover:z-10 hover:shadow-lg relative group"
                    style={{ backgroundColor: cell.color }}
                    title={`${day.dayName} ${hourIndex}:00 - ${cell.count} livrări (medie: ${Math.round(cell.avgMinutes)} min)`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-semibold">{day.dayName} {hourIndex}:00</div>
                      <div>Livrări: {cell.count}</div>
                      {cell.avgMinutes > 0 && (
                        <div>Medie: {Math.round(cell.avgMinutes)} min</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
    </div>
  );
}




