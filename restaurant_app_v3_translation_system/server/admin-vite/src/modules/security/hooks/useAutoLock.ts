// import { useTranslation } from '@/i18n/I18nContext';
/**
 * useAutoLock Hook
 * 
 * Automatically locks the screen after a period of inactivity
 * Similar to Toast/Lightspeed standby mode
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface AutoLockOptions {
  timeout?: number; // Timeout in milliseconds (default: 5 minutes)
  enabled?: boolean;
  onLock?: () => void;
  onActivity?: () => void;
  events?: string[]; // Events to track for activity
}

interface AutoLockState {
  isLocked: boolean;
  timeUntilLock: number; // Seconds until lock
  lastActivity: Date;
}

const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click'
];

export function useAutoLock(options: AutoLockOptions = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    enabled = true,
    onLock,
    onActivity,
    events = DEFAULT_EVENTS
  } = options;

  const [state, setState] = useState<AutoLockState>({
    isLocked: false,
    timeUntilLock: Math.floor(timeout / 1000),
    lastActivity: new Date()
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Reset activity timer
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Update last activity
    const now = new Date();
    setState(prev => ({
      ...prev,
      lastActivity: now,
      timeUntilLock: Math.floor(timeout / 1000)
    }));

    // Start countdown
    countdownRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeUntilLock: Math.max(0, prev.timeUntilLock - 1)
      }));
    }, 1000);

    // Set lock timer
    timerRef.current = setTimeout(() => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      setState(prev => ({ ...prev, isLocked: true, timeUntilLock: 0 }));
      onLock?.();
    }, timeout);

    onActivity?.();
  }, [enabled, timeout, onLock, onActivity]);

  // Handle activity events
  const handleActivity = useCallback(() => {
    if (!state.isLocked) {
      resetTimer();
    }
  }, [state.isLocked, resetTimer]);

  // Unlock function
  const unlock = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLocked: false,
      lastActivity: new Date(),
      timeUntilLock: Math.floor(timeout / 1000)
    }));
    resetTimer();
  }, [resetTimer, timeout]);

  // Manual lock function
  const lock = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setState(prev => ({ ...prev, isLocked: true, timeUntilLock: 0 }));
    onLock?.();
  }, [onLock]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [enabled, events, handleActivity, resetTimer]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (): string => {
    const minutes = Math.floor(state.timeUntilLock / 60);
    const seconds = state.timeUntilLock % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isLocked: state.isLocked,
    timeUntilLock: state.timeUntilLock,
    timeUntilLockFormatted: formatTimeRemaining(),
    lastActivity: state.lastActivity,
    lock,
    unlock,
    resetTimer
  };
}

export default useAutoLock;


