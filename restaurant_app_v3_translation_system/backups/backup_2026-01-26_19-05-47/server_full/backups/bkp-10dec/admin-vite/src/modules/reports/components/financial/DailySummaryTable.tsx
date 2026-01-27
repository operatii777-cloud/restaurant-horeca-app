/**
 * S15 — Daily Summary Table Component
 * 
 * Table for displaying daily financial summary
 */

import React from 'react';
import { Card, Table } from 'react-bootstrap';
import type { DailySummaryItem } from '../../api/financialReportsApi';

interface DailySummaryTableProps {
  data: DailySummaryItem[];
  title?: string;
}

export function DailySummaryTable({
  data,
  title = 'Daily Summary',
}: DailySummaryTableProps) {
  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} RON`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body>
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Zi</th>
              <th className="text-end">Venituri</th>
              <th className="text-end">COGS</th>
              <th className="text-end">Profit Brut</th>
              <th className="text-end">Food Cost %</th>
              <th className="text-end">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  Nu există date pentru perioada selectată
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{new Date(item.day).toLocaleDateString('ro-RO')}</strong>
                  </td>
                  <td className="text-end">{formatCurrency(item.revenue)}</td>
                  <td className="text-end">{formatCurrency(item.cogsTotal)}</td>
                  <td className="text-end">
                    <strong className={item.grossProfit >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(item.grossProfit)}
                    </strong>
                  </td>
                  <td className="text-end">
                    <span
                      className={
                        item.foodCostPercent > 40
                          ? 'text-danger'
                          : item.foodCostPercent > 30
                          ? 'text-warning'
                          : 'text-success'
                      }
                    >
                      {formatPercent(item.foodCostPercent)}
                    </span>
                  </td>
                  <td className="text-end">
                    <span
                      className={
                        item.marginPercent > 60
                          ? 'text-success'
                          : item.marginPercent > 40
                          ? 'text-warning'
                          : 'text-danger'
                      }
                    >
                      {formatPercent(item.marginPercent)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className="table-info">
                <td>
                  <strong>TOTAL</strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatCurrency(
                      data.reduce((sum, item) => sum + item.revenue, 0)
                    )}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatCurrency(
                      data.reduce((sum, item) => sum + item.cogsTotal, 0)
                    )}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatCurrency(
                      data.reduce((sum, item) => sum + item.grossProfit, 0)
                    )}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatPercent(
                      data.reduce((sum, item) => sum + item.revenue, 0) > 0
                        ? (data.reduce((sum, item) => sum + item.cogsTotal, 0) /
                            data.reduce((sum, item) => sum + item.revenue, 0)) *
                          100
                        : 0
                    )}
                  </strong>
                </td>
                <td className="text-end">
                  <strong>
                    {formatPercent(
                      data.reduce((sum, item) => sum + item.revenue, 0) > 0
                        ? (data.reduce((sum, item) => sum + item.grossProfit, 0) /
                            data.reduce((sum, item) => sum + item.revenue, 0)) *
                          100
                        : 0
                    )}
                  </strong>
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </Card.Body>
    </Card>
  );
}

