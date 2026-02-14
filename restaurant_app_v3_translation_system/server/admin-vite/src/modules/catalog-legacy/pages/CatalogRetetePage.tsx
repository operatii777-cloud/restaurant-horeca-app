import { useState } from 'react';
import { RecipesPage } from '@/modules/recipes/pages/RecipesPage';
import { AllergensPage } from '@/modules/stocks/allergens/pages/AllergensPage';
import './CatalogRetetePage.css';

/**
 * Catalog Retete Page - Legacy catalog-retete.html refactored to React
 * 
 * Combines:
 * - Recipe management (leveraging RecipesPage)
 * - Allergen management
 * - Food additives management (E-codes)
 */
export function CatalogRetetePage() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'allergens' | 'additives'>('recipes');

  return (
    <div className="catalog-retete-page">
      {/* Header */}
      <div className="catalog-header bg-white shadow-sm rounded p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0 text-gradient-primary">
            📚 Catalog Rețete Template
          </h1>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm">
              <i className="fas fa-download me-2"></i>
              Export Template
            </button>
            <button className="btn btn-success btn-sm">
              <i className="fas fa-upload me-2"></i>
              Import Template
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="catalog-tabs bg-white shadow-sm rounded mb-4">
        <ul className="nav nav-pills p-3" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'recipes' ? 'active' : ''}`}
              onClick={() => setActiveTab('recipes')}
              type="button"
            >
              <i className="fas fa-utensils me-2"></i>
              Rețete
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
        {activeTab === 'recipes' && (
          <div className="tab-pane-content">
            <RecipesPage />
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
                Gestionare aditivi alimentari: coloranți, conservanți, stabilizatori
              </p>
              <button className="btn btn-primary mt-3">
                <i className="fas fa-plus me-2"></i>
                Adaugă Aditiv
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
