import React from 'react';
import type { Process } from '../../services/haccp.service';

interface ProcessCardProps {
  process: Process;
  onClick?: (process: Process) => void;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ process, onClick }) => {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      receiving: 'Recep?ie',
      storage: 'Stocare',
      preparation: 'Preparare',
      cooking: 'Gatire',
      serving: 'Servire'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      receiving: 'bg-blue-100 text-blue-800 border-blue-300',
      storage: 'bg-green-100 text-green-800 border-green-300',
      preparation: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      cooking: 'bg-orange-100 text-orange-800 border-orange-300',
      serving: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div
      className={`p-5 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-all ${onClick ? 'hover:scale-[1.02]' : ''} bg-white`}
      onClick={() => onClick?.(process)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{process.name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(process.category)}`}>
          {getCategoryLabel(process.category)}
        </span>
      </div>
      
      {process.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{process.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          <i className="fas fa-calendar mr-1"></i>
          {new Date(process.created_at).toLocaleDateString('ro-RO')}
        </span>
        {onClick && (
          <span className="text-blue-600 hover:text-blue-800">
            Vezi CCP-uri <i className="fas fa-arrow-right ml-1"></i>
          </span>
        )}
      </div>
    </div>
  );
};




