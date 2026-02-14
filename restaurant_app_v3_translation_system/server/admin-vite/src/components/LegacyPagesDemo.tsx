import { useState } from 'react';
import { AdminPage } from '@/modules/admin-legacy';
import { AdminAdvancedPage } from '@/modules/admin-legacy';
import { CatalogRetetePage } from '@/modules/catalog-legacy';
import { CatalogIngredientePage } from '@/modules/catalog-legacy';
import './LegacyPagesDemo.css';

/**
 * Demo component showing how to import and use legacy pages
 * 
 * This demonstrates the flexibility of the refactored components:
 * - Can be imported individually
 * - Can be switched dynamically
 * - Each page is a standalone React component
 */
export function LegacyPagesDemo() {
  const [activePage, setActivePage] = useState<
    'admin' | 'admin-advanced' | 'catalog-retete' | 'catalog-ingrediente'
  >('admin');

  return (
    <div className="legacy-pages-demo">
      {/* Page Selector */}
      <div className="page-selector bg-white shadow-sm mb-4 p-3 rounded">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h2 className="h5 mb-0">
                <i className="fas fa-layer-group me-2"></i>
                Legacy Pages Demo
              </h2>
              <small className="text-muted">Selectează pagina legacy refactorizată</small>
            </div>
            <div className="col-md-8">
              <div className="btn-group w-100" role="group">
                <button
                  className={`btn ${activePage === 'admin' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActivePage('admin')}
                >
                  <i className="fas fa-cog me-1"></i>
                  Admin
                </button>
                <button
                  className={`btn ${activePage === 'admin-advanced' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActivePage('admin-advanced')}
                >
                  <i className="fas fa-shield-alt me-1"></i>
                  Admin Advanced
                </button>
                <button
                  className={`btn ${activePage === 'catalog-retete' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActivePage('catalog-retete')}
                >
                  <i className="fas fa-utensils me-1"></i>
                  Catalog Rețete
                </button>
                <button
                  className={`btn ${activePage === 'catalog-ingrediente' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActivePage('catalog-ingrediente')}
                >
                  <i className="fas fa-box me-1"></i>
                  Catalog Ingrediente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner bg-info text-white rounded p-3 mb-3">
        <div className="d-flex align-items-center">
          <i className="fas fa-info-circle fa-2x me-3"></i>
          <div>
            <strong>Demonstrație Import Modular</strong>
            <p className="mb-0 small">
              Toate cele 4 pagini legacy HTML au fost refactorizate în React și pot fi importate 
              individual sau combinate după preferințe.
            </p>
          </div>
        </div>
      </div>

      {/* Current Page Info */}
      <div className="current-page-info bg-light border rounded p-3 mb-4">
        <div className="row">
          <div className="col-md-6">
            <strong>Pagină Curentă:</strong> 
            <code className="ms-2">
              {activePage === 'admin' && 'AdminPage'}
              {activePage === 'admin-advanced' && 'AdminAdvancedPage'}
              {activePage === 'catalog-retete' && 'CatalogRetetePage'}
              {activePage === 'catalog-ingrediente' && 'CatalogIngredientePage'}
            </code>
          </div>
          <div className="col-md-6">
            <strong>Import:</strong>
            <code className="ms-2">
              {activePage === 'admin' && "import { AdminPage } from '@/modules/admin-legacy'"}
              {activePage === 'admin-advanced' && "import { AdminAdvancedPage } from '@/modules/admin-legacy'"}
              {activePage === 'catalog-retete' && "import { CatalogRetetePage } from '@/modules/catalog-legacy'"}
              {activePage === 'catalog-ingrediente' && "import { CatalogIngredientePage } from '@/modules/catalog-legacy'"}
            </code>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {activePage === 'admin' && <AdminPage />}
        {activePage === 'admin-advanced' && <AdminAdvancedPage />}
        {activePage === 'catalog-retete' && <CatalogRetetePage />}
        {activePage === 'catalog-ingrediente' && <CatalogIngredientePage />}
      </div>
    </div>
  );
}
