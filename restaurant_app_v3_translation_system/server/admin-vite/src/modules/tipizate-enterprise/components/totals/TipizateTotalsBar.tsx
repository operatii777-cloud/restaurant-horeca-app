/**
 * PHASE S5.3 - Tipizate Totals Bar
 * Generic totals display component for all tipizate documents
 */

import React from 'react';
import { totalsFor, nameFor } from '../../config/tipizate.config';
import { TipizatType, TipizatTotals } from '../../api/types';

interface TipizateTotalsBarProps {
  type: TipizatType;
  totals: TipizatTotals | Record<string, number>;
}

export const TipizateTotalsBar: React.FC<TipizateTotalsBarProps> = ({ type, totals }) => {
  const fields = totalsFor(type);
  const documentName = nameFor(type);

  if (!totals) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <div className="flex flex-wrap gap-8 p-6 mt-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {fields.map((field) => {
        const value = totals[field] || 0;
        const isCurrency = field.toLowerCase().includes('total') || 
                          field.toLowerCase().includes('amount') ||
                          field.toLowerCase().includes('value') ||
                          field.toLowerCase().includes('price') ||
                          field.toLowerCase().includes('cost') ||
                          field.toLowerCase().includes('income') ||
                          field.toLowerCase().includes('expense') ||
                          field.toLowerCase().includes('balance') ||
                          field.toLowerCase().includes('sales') ||
                          field.toLowerCase().includes('payment') ||
                          field.toLowerCase().includes('vat');

        return (
          <div key={field} className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isCurrency ? formatCurrency(value) : formatNumber(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};


