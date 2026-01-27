/**
 * S15 — Financial P&L Chart Component
 *
 * Bar/Line chart for P&L visualization
 */

import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { DailySummaryItem } from '../../api/financialReportsApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialPnlChartProps {
  data: DailySummaryItem[];
  chartType?: 'bar' | 'line';
  title?: string;
}

export function FinancialPnlChart({
  data,
  chartType = 'bar',
  title = 'Profit & Loss',
}: FinancialPnlChartProps) {
  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.day),
      datasets: [
        {
          label: 'Venituri',
          data: data.map((item) => item.revenue),
          backgroundColor: 'rgba(37, 99, 235, 0.5)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'COGS',
          data: data.map((item) => item.cogsTotal),
          backgroundColor: 'rgba(220, 53, 69, 0.5)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1,
        },
        {
          label: 'Profit Brut',
          data: data.map((item) => item.grossProfit),
          backgroundColor: 'rgba(40, 167, 69, 0.5)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed?.y ?? 0;
            return `${context.dataset.label}: ${Number(value).toFixed(2)} RON`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            const numValue = Number(value) || 0;
            return `${numValue.toFixed(0)} RON`;
          },
        },
      },
    },
  };

  const ChartComponent = chartType === 'bar' ? Bar : Line;

  return (
    <Card>
      <Card.Body>
        <div style={{ height: '400px' }}>
          <ChartComponent data={chartData} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
}
