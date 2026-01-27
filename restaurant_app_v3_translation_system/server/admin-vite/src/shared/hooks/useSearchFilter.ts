import { useMemo } from 'react';

type Selector<T> = (item: T) => string | number | boolean | null | undefined;

export function useSearchFilter<T>(
  items: T[] | null | undefined,
  searchTerm: string | null | undefined,
  selectors: Selector<T>[],
): T[] {
  return useMemo(() => {
    const source = Array.isArray(items) ? items : [];
    const trimmed = (searchTerm ?? '').trim().toLowerCase();

    if (!trimmed) {
      return source;
    }

    return source.filter((item) =>
      selectors.some((selector) => {
        try {
          const value = selector(item);
          if (value === null || value === undefined) {
            return false;
          }
          return String(value).toLowerCase().includes(trimmed);
        } catch {
          return false;
        }
      }),
    );
  }, [items, searchTerm, selectors]);
}


