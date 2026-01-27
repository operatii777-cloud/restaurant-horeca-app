// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S14 - Daily COGS Timeline Chart Component
 * Line chart pentru Revenue, COGS, Profit pe perioadă
 */

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartDataPoint } from '../utils/profitabilityMappers';
import './DailyCogsTimelineChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyCogsTimelineChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  height?: number;
}

export const DailyCogsTimelineChart = ({
  data,
  loading = false,
  height = 400,
}: DailyCogsTimelineChartProps) => {
//   const { t } = useTranslation();
  if (loading || data.length === 0) {
    return (
      <div className="daily-cogs-timeline-chart" style={{ height: `"Height"px` }}>
        <div className="chart-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">"se incarca"</span>
          </div>
          <p className="text-muted mt-2">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: 'Venituri',
        data: data.map((item) => item.revenue),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'COGS',
        data: data.map((item) => item.cogs),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Profit',
        data: data.map((item) => item.profit),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} RON`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toFixed(0) + ' RON';
          },
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="daily-cogs-timeline-chart" style={{ height: `"Height"px` }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};




