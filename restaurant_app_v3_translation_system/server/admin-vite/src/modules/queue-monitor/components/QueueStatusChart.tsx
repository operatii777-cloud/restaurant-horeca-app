// import { useTranslation } from '@/i18n/I18nContext';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface QueueStatusChartProps {
  ordersByStatus?: {
    pending?: number;
    processing?: number;
    completed?: number;
    failed?: number;
  };
}

export function QueueStatusChart({ ordersByStatus }: QueueStatusChartProps) {
//   const { t } = useTranslation();
  const data = [
    {
      name: 'Pending',
      value: ordersByStatus?.pending || 0,
      color: '#6c757d',
    },
    {
      name: 'Processing',
      value: ordersByStatus?.processing || 0,
      color: '#ffc107',
    },
    {
      name: 'Completed',
      value: ordersByStatus?.completed || 0,
      color: '#28a745',
    },
    {
      name: 'Failed',
      value: ordersByStatus?.failed || 0,
      color: '#dc3545',
    },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-"Index"`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

