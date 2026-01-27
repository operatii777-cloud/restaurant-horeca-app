// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FRONTEND PERFORMANCE UTILITIES
 * Utilitare pentru măsurarea performanței în frontend
 * Windows-style: clean, minimal, eficient
 */

/**
 * Măsoară timpul de execuție al unei funcții
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  log = false
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (log || duration > 100) {
    console.log(`'PERF' "Name": ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Măsoară timpul de execuție al unei funcții async
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  log = false
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (log || duration > 100) {
    console.log(`'PERF' "Name": ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Debounce function - Windows-style
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - Windows-style
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load component
 */
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> {
  return importFn().then((module) => module.default);
}


