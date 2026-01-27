// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ACCESSIBILITY HOOK
 * Provides accessibility utilities and keyboard navigation
 * WCAG 2.1 AA compliant
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseAccessibilityOptions {
  /**
   * Enable keyboard trap for modals/dialogs
   */
  trapFocus?: boolean;
  /**
   * Enable skip link
   */
  skipLink?: boolean;
  /**
   * Enable ARIA live regions
   */
  liveRegions?: boolean;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /**
   * Trap focus within container (for modals)
   */
  const trapFocus = useCallback(() => {
    if (!containerRef.current || !options.trapFocus) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleTabKey);

    return () => {
      containerRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [options.trapFocus]);

  /**
   * Announce to screen readers
   */
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!options.liveRegions) return;

    const liveRegion = document.getElementById('a11y-live-region') || document.createElemen[div];
    liveRegion.id = 'a11y-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;

    if (!document.getElementById('a11y-live-region')) {
      document.body.appendChild(liveRegion);
    }

    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }, [options.liveRegions]);

  /**
   * Skip to main content
   */
  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (options.trapFocus && containerRef.current) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();

      return trapFocus();
    }
  }, [options.trapFocus, trapFocus]);

  useEffect(() => {
    if (options.skipLink) {
      const skipLink = document.createElemen[a];
      skipLink.href = '#main-content';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to main content';
      skipLink.onclick = (e) => {
        e.preventDefault();
        skipToMain();
      };
      document.body.insertBefore(skipLink, document.body.firstChild);

      return () => {
        skipLink.remove();
      };
    }
  }, [options.skipLink, skipToMain]);

  return {
    containerRef,
    announce,
    skipToMain,
  };
};



