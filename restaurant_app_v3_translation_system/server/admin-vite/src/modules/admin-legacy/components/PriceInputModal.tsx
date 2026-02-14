import React, { useState } from 'react';
import { Modal } from './Modal';
import { DollarSign } from 'lucide-react';

interface PriceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: number, imageUrl?: string, description?: string) => void;
  recipeName: string;
  suggestedPrice?: number;
  loading?: boolean;
}

export const PriceInputModal: React.FC<PriceInputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recipeName,
  suggestedPrice,
  loading = false
}) => {
  const [price, setPrice] = useState(suggestedPrice?.toString() || '');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      setError('Prețul trebuie să fie un număr pozitiv');
      return;
    }

    onConfirm(priceNum, imageUrl || undefined, description || undefined);
  };

  const handleClose = () => {
    setPrice(suggestedPrice?.toString() || '');
    setImageUrl('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importă Rețetă" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Recipe Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rețetă
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">{recipeName}</span>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Preț de vânzare (RON) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`block w-full pl-10 pr-4 py-2 border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {suggestedPrice && (
              <p className="mt-1 text-sm text-gray-500">
                Preț sugerat: {suggestedPrice.toFixed(2)} RON
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL imagine (opțional)
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Custom Description (Optional) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descriere personalizată (opțional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Descriere personalizată pentru meniu..."
            />
          </div>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Se importă...
              </>
            ) : (
              'Importă în Meniu'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
