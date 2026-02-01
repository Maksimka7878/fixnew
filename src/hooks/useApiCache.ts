import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * useApiCache Hook
 *
 * Simple in-memory cache for API responses with TTL support.
 * Helps reduce API calls and improve performance for frequently accessed data.
 *
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns Object with cache methods
 *
 * @example
 * const { get, set, clear } = useApiCache(5 * 60 * 1000); // 5 minute cache
 *
 * // In a fetch function:
 * const cached = get('products');
 * if (cached) return cached;
 *
 * const data = await fetch('/api/products').then(r => r.json());
 * set('products', data);
 * return data;
 */
export function useApiCache(ttl: number = 5 * 60 * 1000) {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    // Check if cache has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data as T;
  }, []);

  const set = useCallback(<T,>(key: string, data: T): void => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, [ttl]);

  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;

    // Check if cache has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return false;
    }

    return true;
  }, []);

  const clear = useCallback((key?: string): void => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return { get, set, has, clear };
}
