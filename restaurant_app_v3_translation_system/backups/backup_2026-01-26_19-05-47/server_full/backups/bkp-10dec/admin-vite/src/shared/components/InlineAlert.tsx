import './InlineAlert.css';

type InlineAlertVariant = 'error' | 'info' | 'success' | 'warning';

type InlineAlertProps = {
  message: string;
  title?: string;
  type?: InlineAlertVariant;
  variant?: InlineAlertVariant;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
};

export const InlineAlert = ({
  message,
  title,
  type = 'info',
  variant,
  actionLabel,
  onAction,
  onClose,
}: InlineAlertProps) => {
  const visualVariant = variant ?? type ?? 'info';
  const hasActions = Boolean((actionLabel && onAction) || onClose);

  return (
    <div className={`inline-alert inline-alert--${visualVariant}`} role="status">
      {title ? <strong className="inline-alert__title">{title}</strong> : null}
      <span className="inline-alert__message">{message}</span>
      {hasActions ? (
        <span className="inline-alert__actions">
          {actionLabel && onAction ? (
            <button type="button" className="inline-alert__button" onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
          {onClose ? (
            <button type="button" className="inline-alert__close" onClick={onClose} aria-label="Închide alerta">
              ✕
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
};
