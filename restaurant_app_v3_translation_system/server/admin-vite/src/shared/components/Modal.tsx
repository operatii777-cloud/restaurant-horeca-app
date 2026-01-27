// ﻿import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import './Modal.css';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  size?: ModalSize;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
  ariaLabelledBy?: string;
  draggable?: boolean; // [Check] Prop pentru drag and drop
  positionStorageKey?: string; // [Check] Key pentru localStorage
};

const sizeClassMap: Record<ModalSize, string> = {
  sm: 'modal__content--sm',
  md: 'modal__content--md',
  lg: 'modal__content--lg',
  xl: 'modal__content--xl',
  full: 'modal__content--full',
};

export function Modal({
  isOpen,
  title,
  description,
  size = 'lg',
  onClose,
  children,
  footer,
  dismissible = true,
  ariaLabelledBy,
  draggable = false,
  positionStorageKey,
}: ModalProps) {
//   const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const titleId = ariaLabelledBy ?? (title ? `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  // [Check] Restaurează poziția din localStorage când modalul se deschide
  useEffect(() => {
    if (!isOpen || !draggable || !positionStorageKey) return;
    
    const saved = localStorage.getItem(positionStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition({ x: parsed.x || 0, y: parsed.y || 0 });
      } catch (e) {
        console.warn('Failed to parse saved position:', e);
      }
    }
  }, [isOpen, draggable, positionStorageKey]);

  // [Check] Salvează poziția în localStorage când se schimbă
  useEffect(() => {
    if (!draggable || !positionStorageKey || !position) return;
    
    localStorage.setItem(positionStorageKey, JSON.stringify(position));
  }, [position, draggable, positionStorageKey]);

  // [Check] Hook pentru drag and drop - trebuie să fie întotdeauna declarat
  useEffect(() => {
    if (!isDragging || !draggable) return;

    const handleMouseMove = (e: MouseEvent) => {
//   const { t } = useTranslation();
      if (!contentRef.current || !dragOffset) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Limitează la viewport
      const maxX = window.innerWidth - contentRef.current.offsetWidth;
      const maxY = window.innerHeight - contentRef.current.offsetHeight;
      
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      
      setPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragOffset(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, draggable]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dismissible) return;
    // Verifică dacă click-ul este exact pe overlay (nu pe content)
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  // [Check] Handlers pentru drag and drop - doar pe header
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable || !contentRef.current) return;
    // Nu trage dacă e pe un element interactiv
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;
    
    e.preventDefault(); // Previne comportamentul default
    e.stopPropagation(); // Previne propagarea către overlay
    
    setIsDragging(true);
    const rect = contentRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const modalClassName = [
    'modal',
    size === 'full' ? 'modal--top-aligned' : '',
    draggable ? 'modal--draggable' : '',
  ].filter(Boolean).join(' ');

  const contentStyle = draggable && position
    ? {
        position: 'absolute' as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        margin: 0,
      }
    : {};

  return (
    <div className={modalClassName} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={handleOverlayClick} ref={overlayRef}>
      <div 
        ref={contentRef}
        className={`modal__content ${sizeClassMap[size]}`}
        style={contentStyle}
        onClick={(e) => {
          // Previne închiderea când se click pe content
          e.stopPropagation();
        }}
      >
        <header 
          ref={headerRef}
          className={`modal__header ${draggable ? 'modal__header--draggable' : ''}`}
          onMouseDown={draggable ? handleHeaderMouseDown : undefined}
          onClick={(e) => {
            // Previne închiderea când se click pe header
            e.stopPropagation();
          }}
        >
          <div>
            {title ? (
              <h2 id={titleId} className="modal__title">
                {title}
              </h2>
            ) : null}
            {description ? <p className="modal__description">{description}</p> : null}
          </div>
          {dismissible ? (
            <button type="button" className="modal__close" aria-label="Închide" onClick={onClose}>
              âœ•
            </button>
          ) : null}
        </header>

        <div className="modal__body">{children}</div>

        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}



