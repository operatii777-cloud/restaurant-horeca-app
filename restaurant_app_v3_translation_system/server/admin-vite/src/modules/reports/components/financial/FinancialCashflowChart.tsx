// import { useTranslation } from '@/i18n/I18nContext';
/**
 * S15 — Financial Cashflow Chart Component
 * 
 * Bar chart for cashflow visualization (inflows vs outflows)
 */

import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { CashflowData } from '../../api/financialReportsApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialCashflowChartProps {
  data: CashflowData;
  title?: string;
}

export function FinancialCashflowChart({
  data,
  title = 'Cashflow',
}: FinancialCashflowChartProps) {
//   const { t } = useTranslation();
  const chartData = useMemo(() => {
//   const { t } = useTranslation();
    return {
      labels: ['Cash', 'Card', 'Vouchers', 'Other'],
      datasets: [
        {
          label: 'Inflows',
          data: [
            data?.inflows?.cash ?? 0,
            data?.inflows?.card ?? 0,
            data?.inflows?.vouchers ?? 0,
            data?.inflows?.other ?? 0,
          ],
          backgroundColor: 'rgba(40, 167, 69, 0.5)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1,
        },
        {
          label: 'Outflows',
          data: [
            data?.outflows?.suppliers ?? 0,
            data?.outflows?.salaries ?? 0,
            data?.outflows?.other ?? 0,
            0, // Placeholder for alignment
          ],
          backgroundColor: 'rgba(220, 53, 69, 0.5)',
          borderColor: 'rgba(220, 53, 69, 1)',
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

  return (
    <Card>
      <Card.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Net Cashflow:</strong>' '
              <span
                className={(data?.netCashflow ?? 0) >= 0 ? 'text-success' : 'text-danger'}
              >
                {(data?.netCashflow ?? 0).toFixed(2)} RON
              </span>
            </div>
            <div>
              <small className="text-muted">
                Period: {data?.period?.from ?? 'N/A'} - {data?.period?.to ?? 'N/A'}
              </small>
            </div>
          </div>
        </div>
        <div style={{ height: '400px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
}


