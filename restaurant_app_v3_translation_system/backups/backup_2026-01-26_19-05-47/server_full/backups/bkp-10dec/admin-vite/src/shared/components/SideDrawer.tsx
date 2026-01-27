import { useEffect } from 'react';
import type { ReactNode } from 'react';
import './SideDrawer.css';

export interface SideDrawerProps {
  title?: string;
  description?: string;
  open: boolean;
  width?: number;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export const SideDrawer = ({
  title,
  description,
  open,
  width = 520,
  onClose,
  footer,
  children,
}: SideDrawerProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div className={`side-drawer ${open ? 'side-drawer--open' : ''}`} role="dialog" aria-modal="true">
      <div className="side-drawer__backdrop" onClick={onClose} />
      <aside className="side-drawer__panel" style={{ width }}>
        <header className="side-drawer__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="side-drawer__close" onClick={onClose} aria-label="Închide panelul">
            ✕
          </button>
        </header>
        <div className="side-drawer__content">{children}</div>
        {footer ? <footer className="side-drawer__footer">{footer}</footer> : null}
      </aside>
    </div>
  );
};

