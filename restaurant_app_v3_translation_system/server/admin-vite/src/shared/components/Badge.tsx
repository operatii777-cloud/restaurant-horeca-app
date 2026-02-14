// import { useTranslation } from '@/i18n/I18nContext';
import type { ReactNode } from 'react';
import './Badge.css';

type BadgeVariant = "Default" | 'info' | 'success' | 'warning' | 'danger';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  pill?: boolean;
  className?: string;
};

export const Badge = ({
  children,
  variant = "Default",
  icon,
  pill = false,
  className = '',
}: BadgeProps) => {
//   const { t } = useTranslation();
  const classes = ['badge', `badge--${variant}`];
  if (pill) {
    classes.push('badge--pill');
  }
  if (className) {
    classes.push(className);
  }

  return (
    <span className={classes.join(' ').trim()}>
      {icon ? <span className="badge__icon" aria-hidden="true">{icon}</span> : null}
      <span className="badge__content">{children}</span>
    </span>
  );
};
