/**
 * PHASE S5.3 - Tipizate Status Badge
 * Status badge component with color coding for tipizate documents
 */

import React from 'react';
import { TipizatStatus } from '../api/types';

interface TipizateStatusBadgeProps {
  status: TipizatStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TipizateStatusBadge: React.FC<TipizateStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const statusConfig = {
    DRAFT: {
      label: 'Ciornă',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-800 dark:text-gray-200',
      borderColor: 'border-gray-300 dark:border-gray-600',
      icon: '📝',
    },
    VALIDATED: {
      label: 'Validat',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-800 dark:text-blue-200',
      borderColor: 'border-blue-300 dark:border-blue-600',
      icon: '✓',
    },
    SIGNED: {
      label: 'Semnat',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-800 dark:text-green-200',
      borderColor: 'border-green-300 dark:border-green-600',
      icon: '✍️',
    },
    LOCKED: {
      label: 'Blocat',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      borderColor: 'border-yellow-300 dark:border-yellow-600',
      icon: '🔒',
    },
    ARCHIVED: {
      label: 'Arhivat',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-800 dark:text-purple-200',
      borderColor: 'border-purple-300 dark:border-purple-600',
      icon: '📦',
    },
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        border rounded-full font-semibold
        ${sizeClasses[size]}
        ${className}
      `}
      title={`Status: ${config.label}`}
    >
      <span className="text-xs">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

