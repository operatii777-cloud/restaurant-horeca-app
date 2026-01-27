// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S15 — Category Mix Chart Component
 * 
 * Pie/Bar chart for category mix visualization
 */

import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { CategoryMixItem } from '../../api/financialReportsApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryMixChartProps {
  categories: CategoryMixItem[];
  chartType?: 'pie' | 'bar';
  title?: string;
}

export function CategoryMixChart({
  categories,
  chartType = 'pie',
  title = 'Category Mix',
}: CategoryMixChartProps) {
//   const { t } = useTranslation();
  const chartData = useMemo(() => {
//   const { t } = useTranslation();
    const sortedCategories = [...categories].sort(
      (a, b) => b.shareOfRevenue - a.shareOfRevenue
    );

    return {
      labels: sortedCategories.map((cat) => cat.categoryName),
      datasets: [
        {
          label: 'Share of Revenue (%)',
          data: sortedCategories.map((cat) => cat.shareOfRevenue),
          backgroundColor: [
            'rgba(37, 99, 235, 0.5)',
            'rgba(40, 167, 69, 0.5)',
            'rgba(255, 193, 7, 0.5)',
            'rgba(220, 53, 69, 0.5)',
            'rgba(23, 162, 184, 0.5)',
            'rgba(108, 117, 125, 0.5)',
            'rgba(255, 87, 34, 0.5)',
            'rgba(156, 39, 176, 0.5)',
          ],
          borderColor: [
            'rgba(37, 99, 235, 1)',
            'rgba(40, 167, 69, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(220, 53, 69, 1)',
            'rgba(23, 162, 184, 1)',
            'rgba(108, 117, 125, 1)',
            'rgba(255, 87, 34, 1)',
            'rgba(156, 39, 176, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [categories]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || context.parsed?.y || 0;
            const numValue = Number(value) || 0;
            return `"Label": ${numValue.toFixed(1)}%`;
          },
        },
      },
    },
  };

  const ChartComponent = chartType === 'pie' ? Pie : Bar;

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


