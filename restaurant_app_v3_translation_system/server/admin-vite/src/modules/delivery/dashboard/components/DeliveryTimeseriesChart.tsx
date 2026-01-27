// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Delivery Timeseries Chart
 * 
 * Line chart showing deliveries over time
 * Axes: X = dates, Y = deliveries count
 * Lines: delivered / in_transit / late deliveries
 */

import type { TimeseriesData } from "../../api/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface DeliveryTimeseriesChartProps {
  data: TimeseriesData[] | null;
  loading?: boolean;
}

export function DeliveryTimeseriesChart({ data, loading }: DeliveryTimeseriesChartProps) {
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
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nu există date pentru perioada selectată
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.day).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }),
    fullDate: item.day,
    livrate: item.totalDeliveries,
    medieMinute: Math.round(item.avgDeliveryMinutes),
    onTimeRate: (item.onTimeRate * 100).toFixed(1),
    cancelRate: (item.cancelRate * 100).toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#666"
          style={{ fontSize: '12px' }}
          label={{ value: 'Livrări', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px'
          }}
          formatter={(value: any, name: string) => {
            if (name === 'livrate') {
              return [`"Value" comenzi`, 'Livrări'];
            }
            if (name === 'medieMinute') {
              return [`"Value" min`, 'Medie Livrare'];
            }
            if (name === 'onTimeRate') {
              return [`"Value"%`, '% La Timp'];
            }
            if (name === 'cancelRate') {
              return [`"Value"%`, '% Anulate'];
            }
            return value;
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="livrate" 
          stroke="#FF6B35" 
          strokeWidth={2}
          name="Livrări"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="medieMinute" 
          stroke="#4A90E2" 
          strokeWidth={2}
          name="Medie (min)"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}



