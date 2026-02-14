import React from 'react';
import { Modal } from './Modal';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BulkImportResult {
  id: number;
  name: string;
  success: boolean;
  error?: string;
}

interface BulkImportProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  totalItems: number;
  processedItems: number;
  results: BulkImportResult[];
  isComplete: boolean;
}

export const BulkImportProgressModal: React.FC<BulkImportProgressModalProps> = ({
  isOpen,
  onClose,
  title,
  totalItems,
  processedItems,
  results,
  isComplete
}) => {
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  const progress = totalItems > 0 ? (processedItems / totalItems) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={isComplete ? onClose : () => {}} title={title} size="lg">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progres: {processedItems} / {totalItems}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-gray-600">Succes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-gray-600">Erori</div>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.name}
                  </div>
                  {result.error && (
                    <div className="text-sm text-red-700 mt-1">
                      {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Indicator */}
        {!isComplete && processedItems < totalItems && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-gray-700">Se importă...</span>
          </div>
        )}

        {/* Actions */}
        {isComplete && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Închide
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
