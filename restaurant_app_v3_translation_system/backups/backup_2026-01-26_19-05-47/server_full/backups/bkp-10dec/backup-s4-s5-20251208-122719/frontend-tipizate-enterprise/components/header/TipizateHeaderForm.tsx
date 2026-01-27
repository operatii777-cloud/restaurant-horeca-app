/**
 * PHASE S5.3 - Tipizate Header Form
 * Generic header form component for all tipizate documents
 */

import React from 'react';
import { headerFor } from '../../config/tipizate.config';
import { TipizatType } from '../../api/types';

interface TipizateHeaderFormProps {
  type: TipizatType;
  form: Record<string, any>;
  setForm: (form: Record<string, any>) => void;
  loading?: boolean;
}

export const TipizateHeaderForm: React.FC<TipizateHeaderFormProps> = ({
  type,
  form,
  setForm,
  loading = false,
}) => {
  const fields = headerFor(type);

  const handleChange = (name: string, value: any) => {
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {field.type === 'text' && (
            <input
              type="text"
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form[field.name] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={loading}
              required={field.required}
            />
          )}

          {field.type === 'number' && (
            <input
              type="number"
              step="0.01"
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form[field.name] ?? ''}
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
              disabled={loading}
              required={field.required}
            />
          )}

          {field.type === 'date' && (
            <input
              type="date"
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form[field.name] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={loading}
              required={field.required}
            />
          )}

          {field.type === 'select' && (
            <select
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form[field.name] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={loading}
              required={field.required}
            >
              <option value="">Selectează...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === 'autocomplete' && (
            <input
              type="text"
              className="h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form[field.name] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={loading}
              required={field.required}
              placeholder={`Introdu ${field.label.toLowerCase()}...`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

