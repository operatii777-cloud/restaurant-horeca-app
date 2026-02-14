import React, { useState } from 'react';
import { Modal } from './Modal';
import { DollarSign, Package } from 'lucide-react';

interface IngredientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { costPerUnit?: number; currentStock: number; minStock: number; supplier?: string }) => void;
  ingredientName: string;
  estimatedCost?: number;
  loading?: boolean;
}

export const IngredientImportModal: React.FC<IngredientImportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ingredientName,
  estimatedCost,
  loading = false
}) => {
  const [costPerUnit, setCostPerUnit] = useState(estimatedCost?.toString() || '');
  const [currentStock, setCurrentStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [supplier, setSupplier] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cost = costPerUnit ? parseFloat(costPerUnit) : undefined;
    const stock = parseFloat(currentStock);
    const minStockNum = parseFloat(minStock);

    if (costPerUnit && (isNaN(cost!) || cost! < 0)) {
      setError('Costul trebuie să fie un număr pozitiv');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setError('Stocul curent trebuie să fie un număr pozitiv');
      return;
    }

    if (isNaN(minStockNum) || minStockNum < 0) {
      setError('Stocul minim trebuie să fie un număr pozitiv');
      return;
    }

    onConfirm({
      costPerUnit: cost,
      currentStock: stock,
      minStock: minStockNum,
      supplier: supplier || undefined
    });
  };

  const handleClose = () => {
    setCostPerUnit(estimatedCost?.toString() || '');
    setCurrentStock('0');
    setMinStock('0');
    setSupplier('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importă Ingredient" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Ingredient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredient
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">{ingredientName}</span>
            </div>
          </div>

          {/* Cost Per Unit */}
          <div>
            <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700 mb-2">
              Cost per unitate (RON)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="costPerUnit"
                type="number"
                step="0.01"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                autoFocus
              />
            </div>
            {estimatedCost && (
              <p className="mt-1 text-sm text-gray-500">
                Cost estimat: {estimatedCost.toFixed(2)} RON
              </p>
            )}
          </div>

          {/* Current Stock */}
          <div>
            <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-2">
              Stoc curent <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="currentStock"
                type="number"
                step="0.01"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className={`block w-full pl-10 pr-4 py-2 border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Min Stock */}
          <div>
            <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
              Stoc minim
            </label>
            <input
              id="minStock"
              type="number"
              step="0.01"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Supplier (Optional) */}
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
              Furnizor (opțional)
            </label>
            <input
              id="supplier"
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nume furnizor"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Anulează
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Se importă...
              </>
            ) : (
              'Importă în Stoc'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
