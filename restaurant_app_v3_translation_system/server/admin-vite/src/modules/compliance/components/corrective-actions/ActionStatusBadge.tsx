// import { useTranslation } from '@/i18n/I18nContext';
import React from 'react';

interface ActionStatusBadgeProps {
  resolved: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ActionStatusBadge: React.FC<ActionStatusBadgeProps> = ({ resolved, size = 'md' }) => {
//   const { t } = useTranslation();
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  if (resolved) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border bg-green-100 text-green-800 border-green-300 ${getSizeClasses()}`}>
        <i className="fas fa-check-circle"></i>
        <span>"Rezolvată"</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border bg-yellow-100 text-yellow-800 border-yellow-300 ${getSizeClasses()}`}>
      <i className="fas fa-clock"></i>
      <span>În Așteptare</span>
    </span>
  );
};




