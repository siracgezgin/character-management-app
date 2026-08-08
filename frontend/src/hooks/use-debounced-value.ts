'use client';

import { useEffect, useState } from 'react';

/**
 * Delays propagation of a rapidly changing value.
 *
 * This deliberately debounces the value that feeds the React Query key rather
 * than the URL write itself. The URL therefore updates on every keystroke - so
 * copying it mid-typing always yields the state actually on screen - while the
 * network only sees one request once typing pauses.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
}
