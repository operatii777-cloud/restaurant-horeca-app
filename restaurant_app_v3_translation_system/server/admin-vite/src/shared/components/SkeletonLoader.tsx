// import { useTranslation } from '@/i18n/I18nContext';
/**
 * SKELETON LOADER - Windows Style
 * Loading states elegante pentru componente
 * Windows Fluent Design inspired
 */

import React from 'react';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '20px',
  variant = 'rectangular',
  className = '',
  style = {},
}) => {
  const baseStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `"Width"px` : width,
    height: typeof height === 'number' ? `"Height"px` : height,
    backgroundColor: '#f3f3f3',
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '4px',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    ...style,
  };

  return (
    <div
      className={`skeleton-loader ${className}`}
      style={baseStyle}
      aria-label="Se încarcă..."
      role="status"
    />
  );
};

/**
 * Table Skeleton - pentru tabele AG Grid
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div style={{ padding: '16px' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} width="120px" height="32px" />
        ))}
      </div>
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader key={colIndex} width="120px" height="32px" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Card Skeleton
 */
export const CardSkeleton: React.FC = () => {
  //   const { t } = useTranslation();
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d1d1',
      borderRadius: '8px',
    }}>
      <SkeletonLoader width="60%" height="24px" variant="text" style={{ marginBottom: '16px' }} />
      <SkeletonLoader width="100%" height="16px" variant="text" style={{ marginBottom: '8px' }} />
      <SkeletonLoader width="80%" height="16px" variant="text" />
    </div>
  );
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes skeleton-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .skeleton-loader {
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}



