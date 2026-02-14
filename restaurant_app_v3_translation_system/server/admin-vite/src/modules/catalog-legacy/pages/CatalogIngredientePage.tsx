import { useState } from 'react';
import { IngredientsPage } from '@/modules/ingredients/pages/IngredientsPage';
import { AllergensPage } from '@/modules/stocks/allergens/pages/AllergensPage';
import './CatalogIngredientePage.css';

/**
 * Catalog Ingrediente Page - Legacy catalog-ingrediente.html refactored to React
 * 
 * Combines:
 * - Ingredient management (leveraging IngredientsPage)
 * - Allergen database
 * - Food additives database (E-codes)
 */
export function CatalogIngredientePage() {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'allergens' | 'additives'>('ingredients');

  return (
    <div className="catalog-ingrediente-page">
      {/* Header */}
      <div className="catalog-header bg-white shadow-sm rounded p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0 text-gradient-primary">
            📦 Catalog Ingrediente - Bază Date Internă
          </h1>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm">
              <i className="fas fa-download me-2"></i>
              Export Catalog
            </button>
            <button className="btn btn-success btn-sm">
              <i className="fas fa-upload me-2"></i>
              Import Catalog
            </button>
            <button className="btn btn-info btn-sm">
              <i className="fas fa-sync me-2"></i>
              Sincronizare
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="catalog-tabs bg-white shadow-sm rounded mb-4">
        <ul className="nav nav-pills p-3" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
              type="button"
            >
              <i className="fas fa-box me-2"></i>
              Ingrediente
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'allergens' ? 'active' : ''}`}
              onClick={() => setActiveTab('allergens')}
              type="button"
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              Alergeni
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'additives' ? 'active' : ''}`}
              onClick={() => setActiveTab('additives')}
              type="button"
            >
              <i className="fas fa-flask me-2"></i>
              Aditivi (E-codes)
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="catalog-content">
        {activeTab === 'ingredients' && (
          <div className="tab-pane-content">
            <IngredientsPage />
          </div>
        )}

        {activeTab === 'allergens' && (
          <div className="tab-pane-content">
            <AllergensPage />
          </div>
        )}

        {activeTab === 'additives' && (
          <div className="tab-pane-content bg-white shadow-sm rounded p-4">
            <div className="text-center py-5">
              <i className="fas fa-flask fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">Aditivi Alimentari (E-codes)</h4>
              <p className="text-muted">
                Bază de date internă cu aditivi alimentari: coloranți, conservanți, stabilizatori
              </p>
              <div className="mt-4">
                <button className="btn btn-primary me-2">
                  <i className="fas fa-plus me-2"></i>
                  Adaugă Aditiv
                </button>
                <button className="btn btn-outline-primary">
                  <i className="fas fa-database me-2"></i>
                  Import Database E-codes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
