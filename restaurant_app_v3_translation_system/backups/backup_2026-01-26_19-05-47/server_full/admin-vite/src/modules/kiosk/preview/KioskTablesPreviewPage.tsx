// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - KIOSK Tables Preview Page
 * 
 * React implementation replacing kiosk-tables-ui-preview.html.
 * Preview page showing 3 UI variants for KIOSK tables interface.
 */

import React from 'react';
import './KioskTablesPreviewPage.css';

/**
 * KIOSK Tables Preview Page Component
 */
export function KioskTablesPreviewPage() {
//   const { t } = useTranslation();
  // Mock tables data for preview
  const mockTables = [
    { id: 1, number: '1', status: 'free' },
    { id: 2, number: '2', status: 'occupied' },
    { id: 3, number: '3', status: 'free' },
    { id: 4, number: '4', status: 'reserved' },
    { id: 5, number: '5', status: 'free' },
    { id: 6, number: '6', status: 'occupied' },
    { id: 7, number: '7', status: 'free' },
    { id: 8, number: '8', status: 'reserved' },
    { id: 9, number: '9', status: 'free' },
    { id: 10, number: '10', status: 'occupied' },
    { id: 11, number: '11', status: 'free' },
    { id: 12, number: '12', status: 'free' },
  ];
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'free': return 'free';
      case 'occupied': return 'occupied';
      case 'reserved': return 'reserved';
      default: return 'free';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'free': return '✅';
      case 'occupied': return '🔴';
      case 'reserved': return '🔵';
      default: return '✅';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'free': return 'Liberă';
      case 'occupied': return 'Ocupată';
      case 'reserved': return 'Rezervată';
      default: return 'Liberă';
    }
  };
  
  return (
    <div className="kiosk-preview-page">
      <div className="kiosk-preview-container">
        <header className="kiosk-preview-header">
          <h1>Preview UI Mese KIOSK - 3 Variante</h1>
          <p>"demonstratie pentru interfata de selectie mese in "</p>
        </header>
        
        {/* Variant 1: Glassmorphism Modern */}
        <section className="kiosk-preview-variant variant-1">
          <div className="variant-title">
            <span>Varianta 1: Glassmorphism Modern</span>
            <span className="badge badge-modern">"Modern"</span>
          </div>
          <div className="variant-description">"design modern cu efect glassmorphism animatii flui"</div>
          <div className="tables-grid">
            {mockTables.map((table) => (
              <div
                key={table.id}
                className={`table-card table-card--${getStatusClass(table.status)}`}
              >
                <div className="table-icon">{getStatusIcon(table.status)}</div>
                <div className="table-number">Masa {table.number}</div>
                <div className="table-status">{getStatusLabel(table.status)}</div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Variant 2: Minimalist Clean */}
        <section className="kiosk-preview-variant variant-2">
          <div className="variant-title">
            <span>Varianta 2: Minimalist Clean</span>
            <span className="badge badge-minimal">Minimalist</span>
          </div>
          <div className="variant-description">"design minimalist si curat focus pe functionalitat"</div>
          <div className="tables-grid">
            {mockTables.map((table) => (
              <div
                key={table.id}
                className={`table-card table-card--${getStatusClass(table.status)}`}
              >
                <div className="table-number">Masa {table.number}</div>
                <div className="table-status">{getStatusLabel(table.status)}</div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Variant 3: Colorful Vibrant */}
        <section className="kiosk-preview-variant variant-3">
          <div className="variant-title">
            <span>Varianta 3: Colorful Vibrant</span>
            <span className="badge badge-vibrant">Colorful</span>
          </div>
          <div className="variant-description">"design vibrant cu culori distincte pentru fiecare "</div>
          <div className="tables-grid">
            {mockTables.map((table) => (
              <div
                key={table.id}
                className={`table-card table-card--${getStatusClass(table.status)}`}
              >
                <div className="table-icon">{getStatusIcon(table.status)}</div>
                <div className="table-number">Masa {table.number}</div>
                <div className="table-status">{getStatusLabel(table.status)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}




