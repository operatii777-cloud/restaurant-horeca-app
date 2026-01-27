/**
 * PHASE S5.3 - Tipizate Line Editor Modal
 * Modal component for editing individual tipizate document lines
 */

import React, { useState, useEffect } from 'react';
import { TipizatLine } from '../../api/types';

interface TipizateLineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (line: TipizatLine) => void;
  line?: TipizatLine | null;
  mode?: 'create' | 'edit';
}

export const TipizateLineEditorModal: React.FC<TipizateLineEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  line = null,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<TipizatLine>({
    lineNumber: 1,
    productName: '',
    productCode: '',
    unit: 'buc',
    quantity: 0,
    unitPrice: 0,
    vatRate: 19,
    totalWithoutVat: 0,
    totalVat: 0,
    totalWithVat: 0,
    notes: '',
  });

  useEffect(() => {
    if (line) {
      setFormData(line);
    } else {
      // Reset form for new line
      setFormData({
        lineNumber: 1,
        productName: '',
        productCode: '',
        unit: 'buc',
        quantity: 0,
        unitPrice: 0,
        vatRate: 19,
        totalWithoutVat: 0,
        totalVat: 0,
        totalWithVat: 0,
        notes: '',
      });
    }
  }, [line, isOpen]);

  const calculateTotals = (qty: number, price: number, vat: number) => {
    const totalWithoutVat = qty * price;
    const totalVat = (totalWithoutVat * vat) / 100;
    const totalWithVat = totalWithoutVat + totalVat;
    return { totalWithoutVat, totalVat, totalWithVat };
  };

  const handleFieldChange = (field: keyof TipizatLine, value: any) => {
    const updated = { ...formData, [field]: value };

    // Auto-calculate totals when quantity, price, or VAT changes
    if (field === 'quantity' || field === 'unitPrice' || field === 'vatRate') {
      const totals = calculateTotals(
        field === 'quantity' ? value : updated.quantity,
        field === 'unitPrice' ? value : updated.unitPrice,
        field === 'vatRate' ? value : updated.vatRate
      );
      Object.assign(updated, totals);
    }

    setFormData(updated);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 transform transition-all"
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Adaugă Linie' : 'Editează Linie'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Închide"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Produs <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleFieldChange('productName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nume produs"
                autoFocus
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cod Produs
              </label>
              <input
                type="text"
                value={formData.productCode || ''}
                onChange={(e) => handleFieldChange('productCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cod produs (opțional)"
              />
            </div>

            {/* Grid: Unit, Quantity, Price, VAT */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  UM
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleFieldChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="buc">buc</option>
                  <option value="kg">kg</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="pachet">pachet</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cantitate <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preț Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => handleFieldChange('unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* VAT Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  TVA %
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.vatRate}
                  onChange={(e) => handleFieldChange('vatRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="19"
                />
              </div>
            </div>

            {/* Totals Display */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON',
                  }).format(formData.totalWithoutVat)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">TVA:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON',
                  }).format(formData.totalVat)}
                </span>
              </div>
              <div className="flex justify-between text-base border-t border-gray-300 dark:border-gray-600 pt-2">
                <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON',
                  }).format(formData.totalWithVat)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Note opționale..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Anulează
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.productName || formData.quantity <= 0 || formData.unitPrice <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'create' ? 'Adaugă' : 'Salvează'}
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> pentru închidere •{' '}
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> pentru salvare
          </div>
        </div>
      </div>
    </div>
  );
};

