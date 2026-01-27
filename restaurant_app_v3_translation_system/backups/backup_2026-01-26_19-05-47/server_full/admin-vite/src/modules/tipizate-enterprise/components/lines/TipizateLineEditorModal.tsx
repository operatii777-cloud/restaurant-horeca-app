/**
 * PHASE S5.3 - Tipizate Line Editor Modal
 * Modal component for editing individual tipizate document lines
 */

import type { TipizatLine } from "../../api/types";
import React, { useState, useEffect } from 'react';
import { IngredientAutocomplete } from '../shared/IngredientAutocomplete';


interface TipizateLineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (line: TipizatLine) => void;
  line?: TipizatLine | null;
  mode?: 'create' | 'edit';
  loading?: boolean;
}

export const TipizateLineEditorModal: React.FC<TipizateLineEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  line = null,
  mode = 'create',
  loading = false,
}) => {
  const [formData, setFormData] = useState<TipizatLine>({
    ingredient_id: 0,
    ingredient_name: '',
    quantity: 0,
    unit: 'buc',
    price: 0,
  });

  useEffect(() => {
    if (line) {
      setFormData(line);
    } else {
      // Reset form for new line
      setFormData({
        ingredient_id: 0,
        ingredient_name: '',
        quantity: 0,
        unit: 'buc',
        price: 0,
      });
    }
  }, [line, isOpen]);


  const handleFieldChange = (field: keyof TipizatLine, value: any) => {
    const updated = { ...formData, [field]: value };

    // Auto-calculate total when quantity or price changes
    if (field === 'quantity' || field === 'price') {
      updated.total = (updated.quantity || 0) * (updated.price || 0);
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
            {/* Product Name with Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Produs <span className="text-red-500">*</span>
              </label>
              <IngredientAutocomplete
                value={formData.ingredient_name}
                onChange={(name, ingredient) => {
                  handleFieldChange('ingredient_name', name);
                  if (ingredient) {
                    // Auto-fill unit if available
                    if (ingredient.unit && !formData.unit) {
                      handleFieldChange('unit', ingredient.unit);
                    }
                    // Auto-fill ingredient_id
                    handleFieldChange('ingredient_id', ingredient.id);
                  }
                }}
                placeholder="Caută ingredient..."
                disabled={loading}
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cod Produs
              </label>
              <input
                type="text"
                value={`ING-${formData.ingredient_id || ''}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                placeholder="Cod produs (automat)"
              />
            </div>

            {/* Grid: Unit, Quantity, Price */}
            <div className="grid grid-cols-3 gap-4">
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
                  value={formData.price || 0}
                  onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

            </div>

            {/* Total Display */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON',
                  }).format(formData.total || 0)}
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
              disabled={!formData.ingredient_name || formData.quantity <= 0 || !formData.price}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm border-2 border-blue-700"
              style={{
                backgroundColor: !formData.ingredient_name || formData.quantity <= 0 || !formData.price ? undefined : '#1e40af !important',
                color: '#ffffff !important',
                fontWeight: 'bold'
              }}
            >
              {mode === 'create' ? 'Adaugă' : 'Salvează'}
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> pentru închidere •' '
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> pentru salvare
          </div>
        </div>
      </div>
    </div>
  );
};

