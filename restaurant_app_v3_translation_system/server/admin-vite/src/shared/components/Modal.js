"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = Modal;
// ﻿import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
require("./Modal.css");
var sizeClassMap = {
    sm: 'modal__content--sm',
    md: 'modal__content--md',
    lg: 'modal__content--lg',
    xl: 'modal__content--xl',
    full: 'modal__content--full',
};
function Modal(_a) {
    var isOpen = _a.isOpen, title = _a.title, description = _a.description, _b = _a.size, size = _b === void 0 ? 'lg' : _b, onClose = _a.onClose, children = _a.children, footer = _a.footer, _c = _a.dismissible, dismissible = _c === void 0 ? true : _c, ariaLabelledBy = _a.ariaLabelledBy, _d = _a.draggable, draggable = _d === void 0 ? false : _d, positionStorageKey = _a.positionStorageKey;
    //   const { t } = useTranslation();
    var overlayRef = (0, react_1.useRef)(null);
    var contentRef = (0, react_1.useRef)(null);
    var headerRef = (0, react_1.useRef)(null);
    var _e = (0, react_1.useState)(null), position = _e[0], setPosition = _e[1];
    var _f = (0, react_1.useState)(false), isDragging = _f[0], setIsDragging = _f[1];
    var _g = (0, react_1.useState)(null), dragOffset = _g[0], setDragOffset = _g[1];
    var titleId = ariaLabelledBy !== null && ariaLabelledBy !== void 0 ? ariaLabelledBy : (title ? "modal-title-".concat(title.replace(/\s+/g, '-').toLowerCase()) : undefined);
    // [Check] Restaurează poziția din localStorage când modalul se deschide
    (0, react_1.useEffect)(function () {
        if (!isOpen || !draggable || !positionStorageKey)
            return;
        var saved = localStorage.getItem(positionStorageKey);
        if (saved) {
            try {
                var parsed = JSON.parse(saved);
                setPosition({ x: parsed.x || 0, y: parsed.y || 0 });
            }
            catch (e) {
                console.warn('Failed to parse saved position:', e);
            }
        }
    }, [isOpen, draggable, positionStorageKey]);
    // [Check] Salvează poziția în localStorage când se schimbă
    (0, react_1.useEffect)(function () {
        if (!draggable || !positionStorageKey || !position)
            return;
        localStorage.setItem(positionStorageKey, JSON.stringify(position));
    }, [position, draggable, positionStorageKey]);
    // [Check] Hook pentru drag and drop - trebuie să fie întotdeauna declarat
    (0, react_1.useEffect)(function () {
        if (!isDragging || !draggable)
            return;
        var handleMouseMove = function (e) {
            //   const { t } = useTranslation();
            if (!contentRef.current || !dragOffset)
                return;
            var newX = e.clientX - dragOffset.x;
            var newY = e.clientY - dragOffset.y;
            // Limitează la viewport
            var maxX = window.innerWidth - contentRef.current.offsetWidth;
            var maxY = window.innerHeight - contentRef.current.offsetHeight;
            var clampedX = Math.max(0, Math.min(newX, maxX));
            var clampedY = Math.max(0, Math.min(newY, maxY));
            setPosition({ x: clampedX, y: clampedY });
        };
        var handleMouseUp = function () {
            setIsDragging(false);
            setDragOffset(null);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return function () {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, draggable]);
    (0, react_1.useEffect)(function () {
        if (!isOpen) {
            return;
        }
        var handleKeyDown = function (event) {
            if (event.key === 'Escape' && dismissible) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return function () { return document.removeEventListener('keydown', handleKeyDown); };
    }, [dismissible, isOpen, onClose]);
    if (!isOpen) {
        return null;
    }
    var handleOverlayClick = function (event) {
        if (!dismissible)
            return;
        // Verifică dacă click-ul este exact pe overlay (nu pe content)
        if (event.target === overlayRef.current) {
            onClose();
        }
    };
    // [Check] Handlers pentru drag and drop - doar pe header
    var handleHeaderMouseDown = function (e) {
        if (!draggable || !contentRef.current)
            return;
        // Nu trage dacă e pe un element interactiv
        if (e.target.closest('button, input, select, textarea, a'))
            return;
        e.preventDefault(); // Previne comportamentul default
        e.stopPropagation(); // Previne propagarea către overlay
        setIsDragging(true);
        var rect = contentRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };
    var modalClassName = [
        'modal',
        size === 'full' ? 'modal--top-aligned' : '',
        draggable ? 'modal--draggable' : '',
    ].filter(Boolean).join(' ');
    var contentStyle = draggable && position
        ? {
            position: 'absolute',
            left: "".concat(position.x, "px"),
            top: "".concat(position.y, "px"),
            margin: 0,
        }
        : {};
    return (<div className={modalClassName} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={handleOverlayClick} ref={overlayRef}>
      <div ref={contentRef} className={"modal__content ".concat(sizeClassMap[size])} style={contentStyle} onClick={function (e) {
            // Previne închiderea când se click pe content
            e.stopPropagation();
        }}>
        <header ref={headerRef} className={"modal__header ".concat(draggable ? 'modal__header--draggable' : '')} onMouseDown={draggable ? handleHeaderMouseDown : undefined} onClick={function (e) {
            // Previne închiderea când se click pe header
            e.stopPropagation();
        }}>
          <div>
            {title ? (<h2 id={titleId} className="modal__title">
                {title}
              </h2>) : null}
            {description ? <p className="modal__description">{description}</p> : null}
          </div>
          {dismissible ? (<button type="button" className="modal__close" aria-label="Închide" onClick={onClose}>
              ✕
            </button>) : null}
        </header>

        <div className="modal__body">{children}</div>

        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>);
}
