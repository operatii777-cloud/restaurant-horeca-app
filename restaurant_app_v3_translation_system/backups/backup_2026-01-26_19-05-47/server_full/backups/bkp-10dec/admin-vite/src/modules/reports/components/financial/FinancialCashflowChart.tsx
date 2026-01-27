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
} from 'chart.js';
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
  const chartData = useMemo(() => {
    return {
      labels: ['Cash', 'Card', 'Vouchers', 'Other'],
      datasets: [
        {
          label: 'Inflows',
          data: [
            data.inflows.cash,
            data.inflows.card,
            data.inflows.vouchers,
            data.inflows.other,
          ],
          backgroundColor: 'rgba(40, 167, 69, 0.5)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1,
        },
        {
          label: 'Outflows',
          data: [
            data.outflows.suppliers,
            data.outflows.salaries,
            data.outflows.other,
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
            return `${value.toFixed(0)} RON`;
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
              <strong>Net Cashflow:</strong>{' '}
              <span
                className={data.netCashflow >= 0 ? 'text-success' : 'text-danger'}
              >
                {data.netCashflow.toFixed(2)} RON
              </span>
            </div>
            <div>
              <small className="text-muted">
                Period: {data.period.from} - {data.period.to}
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

