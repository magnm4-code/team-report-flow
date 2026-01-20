import { useState, useEffect } from 'react';

export const useLayoutOrder = <T extends string>(
  storageKey: string,
  defaultOrder: T[]
): [T[], (newOrder: T[]) => void] => {
  const [order, setOrder] = useState<T[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all default items are present (in case new items were added)
        const merged = [...parsed, ...defaultOrder.filter(item => !parsed.includes(item))];
        // Remove any items that are no longer in defaults
        return merged.filter(item => defaultOrder.includes(item));
      } catch {
        return defaultOrder;
      }
    }
    return defaultOrder;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(order));
  }, [storageKey, order]);

  return [order, setOrder];
};
