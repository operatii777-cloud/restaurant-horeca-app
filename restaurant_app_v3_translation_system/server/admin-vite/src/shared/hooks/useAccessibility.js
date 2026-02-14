"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ACCESSIBILITY HOOK
 * Provides accessibility utilities and keyboard navigation
 * WCAG 2.1 AA compliant
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAccessibility = void 0;
var react_1 = require("react");
var useAccessibility = function (options) {
    if (options === void 0) { options = {}; }
    var containerRef = (0, react_1.useRef)(null);
    var previousActiveElement = (0, react_1.useRef)(null);
    /**
     * Trap focus within container (for modals)
     */
    var trapFocus = (0, react_1.useCallback)(function () {
        if (!containerRef.current || !options.trapFocus)
            return;
        var focusableElements = containerRef.current.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
        var firstElement = focusableElements[0];
        var lastElement = focusableElements[focusableElements.length - 1];
        var handleTabKey = function (e) {
            if (e.key !== 'Tab')
                return;
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement === null || lastElement === void 0 ? void 0 : lastElement.focus();
                }
            }
            else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement === null || firstElement === void 0 ? void 0 : firstElement.focus();
                }
            }
        };
        containerRef.current.addEventListener('keydown', handleTabKey);
        return function () {
            var _a;
            (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('keydown', handleTabKey);
        };
    }, [options.trapFocus]);
    /**
     * Announce to screen readers
     */
    var announce = (0, react_1.useCallback)(function (message, priority) {
        if (priority === void 0) { priority = 'polite'; }
        if (!options.liveRegions)
            return;
        var liveRegion = document.getElementById('a11y-live-region') || document.createElemen[div];
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
        setTimeout(function () {
            liveRegion.textContent = '';
        }, 1000);
    }, [options.liveRegions]);
    /**
     * Skip to main content
     */
    var skipToMain = (0, react_1.useCallback)(function () {
        var mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);
    (0, react_1.useEffect)(function () {
        if (options.trapFocus && containerRef.current) {
            previousActiveElement.current = document.activeElement;
            var firstFocusable = containerRef.current.querySelector('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
            firstFocusable === null || firstFocusable === void 0 ? void 0 : firstFocusable.focus();
            return trapFocus();
        }
    }, [options.trapFocus, trapFocus]);
    (0, react_1.useEffect)(function () {
        if (options.skipLink) {
            var skipLink_1 = document.createElemen[a];
            skipLink_1.href = '#main-content';
            skipLink_1.className = 'skip-link';
            skipLink_1.textContent = 'Skip to main content';
            skipLink_1.onclick = function (e) {
                e.preventDefault();
                skipToMain();
            };
            document.body.insertBefore(skipLink_1, document.body.firstChild);
            return function () {
                skipLink_1.remove();
            };
        }
    }, [options.skipLink, skipToMain]);
    return {
        containerRef: containerRef,
        announce: announce,
        skipToMain: skipToMain,
    };
};
exports.useAccessibility = useAccessibility;
