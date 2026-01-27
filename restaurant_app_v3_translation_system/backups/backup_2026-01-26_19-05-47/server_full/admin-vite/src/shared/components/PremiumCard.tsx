/**
 * PREMIUM CARD COMPONENT
 * Industry-leading card component with perfect accessibility
 * Inspired by: Stripe, Linear, Vercel, Shadcn UI
 */

import React from 'react';

export interface PremiumCardProps {
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "Default" | 'elevated' | 'outlined';
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  title,
  description,
  header,
  footer,
  children,
  className = '',
  variant = "Default",
}) => {
  const variantClasses = {
    default: 'card',
    elevated: 'card card-elevated',
    outlined: 'card card-outlined',
  };

  const classes = [variantClasses[variant], className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {(title || description || header) && (
        <div className="card-header">
          {header || (
            <>
              {title && <h3 className="card-title">{title}</h3>}
              {description && <p className="card-description">{description}</p>}
            </>
          )}
        </div>
      )}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};


