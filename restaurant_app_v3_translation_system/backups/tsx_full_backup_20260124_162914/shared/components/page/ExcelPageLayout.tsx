// import { useTranslation } from '@/i18n/I18nContext';
/**
 * ExcelPageLayout STANDARD FINAL (boogiT-like)
 * STANDARDUL UNIC pentru toate paginile Admin-Vite
 * Compact: padding 16, gap 12
 * Contrast: folosește token-uri CSS (nu white/black hardcodat)
 * Sticky header + sticky toolbar
 */

import React from "react";
import "./ExcelPageLayout.css";

type ExcelPageLayoutProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;

  /** zona din dreapta în header (ex: Export / Print / Add) */
  headerActions?: React.ReactNode;

  /** toolbar compact: filtre, search, butoane */
  toolbar?: React.ReactNode;

  /** footer compact: totaluri / branding */
  footer?: React.ReactNode;

  /** conținutul paginii (cards, grids, charts etc.) */
  children: React.ReactNode;

  /** opțional: clase extra pt page-specific tweaks (dar fără spacing hacks) */
  className?: string;
};

export const ExcelPageLayout: React.FC<ExcelPageLayoutProps> = ({
  title,
  subtitle,
  headerActions,
  toolbar,
  footer,
  children,
  className,
}) => {
  return (
    <section className={`excel-page ${className || ""}`}>
      {/* HEADER (sticky) */}
      <header className="excel-page__header">
        <div className="excel-page__header-left">
          <h1 className="excel-page__title">{title}</h1>
          {subtitle ? <div className="excel-page__subtitle">{subtitle}</div> : null}
        </div>

        {headerActions ? <div className="excel-page__header-actions">{headerActions}</div> : null}
      </header>

      {/* TOOLBAR (sticky sub-header) */}
      {toolbar ? <div className="excel-page__toolbar">{toolbar}</div> : null}

      {/* BODY */}
      <main className="excel-page__body" role="region" aria-label="continut pagina">
        {children}
      </main>

      {/* FOOTER */}
      {footer ? <footer className="excel-page__footer">{footer}</footer> : null}
    </section>
  );
};


