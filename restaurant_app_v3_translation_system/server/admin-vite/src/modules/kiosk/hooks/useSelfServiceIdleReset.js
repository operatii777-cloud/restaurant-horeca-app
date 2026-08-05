import { useEffect, useRef, useCallback } from 'react';

/**
 * Self-service kiosk idle reset.
 * After `timeoutMs` without pointer/keyboard activity, calls onIdle
 * so the next customer does not see the previous cart/session.
 */
export function useSelfServiceIdleReset(onIdle, timeoutMs = 90_000, enabled = true) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const arm = useCallback(() => {
    clear();
    if (!enabled) return;
    timerRef.current = setTimeout(() => {
      onIdleRef.current?.();
    }, timeoutMs);
  }, [clear, enabled, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      clear();
      return undefined;
    }

    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => arm();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    arm();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clear();
    };
  }, [arm, clear, enabled]);

  return { resetIdleTimer: arm, clearIdleTimer: clear };
}
