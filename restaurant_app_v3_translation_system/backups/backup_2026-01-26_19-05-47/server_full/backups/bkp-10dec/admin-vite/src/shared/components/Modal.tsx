import { useEffect, useRef, type ReactNode } from 'react';
import './Modal.css';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

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
};

const sizeClassMap: Record<ModalSize, string> = {
  sm: 'modal__content--sm',
  md: 'modal__content--md',
  lg: 'modal__content--lg',
  xl: 'modal__content--xl',
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
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = ariaLabelledBy ?? (title ? `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined);

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
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={handleOverlayClick} ref={overlayRef}>
      <div className={`modal__content ${sizeClassMap[size]}`}>
        <header className="modal__header">
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
              ✕
            </button>
          ) : null}
        </header>

        <div className="modal__body">{children}</div>

        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
