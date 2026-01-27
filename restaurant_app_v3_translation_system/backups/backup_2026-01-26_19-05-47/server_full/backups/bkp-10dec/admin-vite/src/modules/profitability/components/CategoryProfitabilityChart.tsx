/**
 * S14 - Category Profitability Chart Component
 * Pie chart pentru distribuția profitabilității pe categorii
 */

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { PieChartDataPoint } from '../utils/profitabilityMappers';
import './CategoryProfitabilityChart.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryProfitabilityChartProps {
  data: PieChartDataPoint[];
  loading?: boolean;
  height?: number;
}

export const CategoryProfitabilityChart = ({
  data,
  loading = false,
  height = 400,
}: CategoryProfitabilityChartProps) => {
  if (loading || data.length === 0) {
    return (
      <div className="category-profitability-chart" style={{ height: `${height}px` }}>
        <div className="chart-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
          <p className="text-muted mt-2">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  // Generate colors for categories
  const colors = [
    'rgba(37, 99, 235, 0.8)',   // Blue
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(251, 146, 60, 0.8)',   // Orange
    'rgba(168, 85, 247, 0.8)',   // Purple
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(59, 130, 246, 0.8)',   // Light Blue
    'rgba(16, 185, 129, 0.8)',   // Teal
  ];

  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: 'Revenue',
        data: data.map((item) => item.value),
        backgroundColor: data.map((_, index) => colors[index % colors.length]),
        borderColor: data.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const categoryData = data[context.dataIndex];
            return [
              `${label}: ${value.toFixed(2)} RON (${percentage}%)`,
              `Food Cost: ${categoryData.foodCostPercent.toFixed(1)}%`,
              `Profit: ${categoryData.profit.toFixed(2)} RON`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="category-profitability-chart" style={{ height: `${height}px` }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

