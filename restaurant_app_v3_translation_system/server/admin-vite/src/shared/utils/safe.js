/**
 * Defensive accessors for API-driven UI values.
 * JS twin of safe.ts for modules that import .js builds.
 */

export function safeNum(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function safeFixed(value, digits = 2, fallback = 0) {
  return safeNum(value, fallback).toFixed(digits);
}

export function safeArr(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

export function safeObj(value, fallback = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  return fallback;
}
