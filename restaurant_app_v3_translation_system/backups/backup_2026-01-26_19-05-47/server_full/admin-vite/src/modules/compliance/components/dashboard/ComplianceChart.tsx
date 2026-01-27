// import { useTranslation } from '@/i18n/I18nContext';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComplianceDataPoint {
  date: string;
  complianceRate: number;
}

interface ComplianceChartProps {
  data: ComplianceDataPoint[];
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({ data }) => {
//   const { t } = useTranslation();
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <i className="fas fa-chart-line text-4xl mb-3 opacity-50"></i>
        <p>"nu exista date pentru afisare"</p>
      </div>
    );
  }

  const formattedData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
  }));

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Evoluția Conformității (Ultimele 7 zile)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            domain={[0, 100]}
            style={{ fontSize: '12px' }}
            label={{ value: 'Conformitate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Conformitate']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="complianceRate" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Conformitate (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};




