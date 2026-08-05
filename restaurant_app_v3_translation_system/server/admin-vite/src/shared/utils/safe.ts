/**
 * Defensive accessors for API-driven UI values.
 * Prevents crashes from .toFixed() / .map() / .length on null/undefined.
 */

export function safeNum(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function safeFixed(value: unknown, digits = 2, fallback = 0): string {
  return safeNum(value, fallback).toFixed(digits);
}

export function safeArr<T = unknown>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function safeObj<T extends Record<string, unknown>>(
  value: unknown,
  fallback: T = {} as T
): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  return fallback;
}
