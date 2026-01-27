import type { ReactNode } from 'react';
import './InlineEditor.css';

export interface InlineEditorProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onCancel?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  processing?: boolean;
}

export const InlineEditor = ({
  title,
  description,
  children,
  footer,
  onCancel,
  onSave,
  saveLabel = 'Salvează',
  cancelLabel = 'Anulează',
  processing = false,
}: InlineEditorProps) => {
  return (
    <section className="inline-editor">
      <header className="inline-editor__header">
        {title ? <h3>{title}</h3> : null}
        {description ? <p>{description}</p> : null}
      </header>
      <div className="inline-editor__content">{children}</div>
      <footer className="inline-editor__footer">
        {footer}
        <div className="inline-editor__actions">
          {onCancel ? (
            <button type="button" className="inline-editor__button inline-editor__button--secondary" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
          {onSave ? (
            <button
              type="button"
              className="inline-editor__button inline-editor__button--primary"
              onClick={onSave}
              disabled={processing}
            >
              {processing ? 'Se salvează…' : saveLabel}
            </button>
          ) : null}
        </div>
      </footer>
    </section>
  );
};

