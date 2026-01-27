// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.2 - Platform Mix Chart
 * 
 * Donut chart showing delivery platform distribution
 * Platforms: Online, POS, Glovo, Bolt, Tazz, FriendsRide
 * Custom colors: verde, albastru, oranj, mov etc.
 */

import type { DeliveryOverview } from "../../api/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';


interface PlatformMixChartProps {
  overview: DeliveryOverview | null;
  loading?: boolean;
}

// Custom colors for platforms
const PLATFORM_COLORS: Record<string, string> = {
  'Online': '#10B981',      // verde
  'POS': '#3B82F6',         // albastru
  'Glovo': '#F59E0B',       // oranj
  'Bolt': '#8B5CF6',        // mov
  'Tazz': '#EF4444',        // roșu
  'FriendsRide': '#EC4899', // roz
  'Wolt': '#06B6D4',        // cyan
  'Other': '#6B7280',       // gri
};

// Default colors array (fallback)
const DEFAULT_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', 
  '#EF4444', '#EC4899', '#06B6D4', '#6B7280'
];

export function PlatformMixChart({ overview, loading }: PlatformMixChartProps) {
//   const { t } = useTranslation();
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!overview || !overview.platformMix || overview.platformMix.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">"nu exista date pentru platform mix"</div>
    );
  }

  // Format data for chart
  const chartData = overview.platformMix.map((platform) => ({
    name: platform.platform,
    value: platform.count,
    percentage: (platform.share * 100).toFixed(1),
  }));

  // Custom label function
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value} (${entry.percentage}%)`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
//   const { t } = useTranslation();
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.value}</span> comenzi
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.payload.percentage}%</span> din total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-"Index"`} 
              fill={PLATFORM_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value: string) => {
            const platform = chartData.find(p => p.name === value);
            return platform ? `"Value" (${platform.percentage}%)` : value;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}




