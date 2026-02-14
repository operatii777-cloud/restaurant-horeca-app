import { useState } from 'react';
import { OrdersManagementPage } from '@/modules/orders/pages/OrdersManagementPage';
import InventoryDashboardPage from '@/modules/stocks/inventory/pages/InventoryDashboardPage';
import { AdvancedStockDashboardPage } from '@/modules/stocks/dashboard/pages/AdvancedStockDashboardPage';
import { AdvancedReportsPage } from '@/modules/reports/advanced/pages/AdvancedReportsPage';
import { PortionsPage } from '@/modules/portions/pages/PortionsPage';
import { VarianceReportsPage } from '@/modules/variance/pages/VarianceReportsPage';
import { ExecutiveDashboardPage } from '@/modules/executive-dashboard/pages/ExecutiveDashboardPage';
import './AdminAdvancedPage.css';

/**
 * Admin Advanced Page - Legacy admin-advanced.html refactored to React
 * 
 * Advanced admin interface for:
 * - Executive dashboard with analytics
 * - Fiscal document management
 * - Order management
 * - Advanced inventory management
 * - Portion control
 * - Variance reporting
 * - Advanced reporting
 */
export function AdminAdvancedPage() {
  const [activeSection, setActiveSection] = useState<
    | 'dashboard'
    | 'orders'
    | 'inventory'
    | 'stock-dashboard'
    | 'portion-control'
    | 'variance'
    | 'reports'
  >('dashboard');

  return (
    <div className="admin-advanced-page">
      {/* Main Header */}
      <div className="admin-advanced-header bg-white shadow-sm mb-4">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col-md-6">
              <h1 className="h3 mb-0 text-gradient-advanced">
                <i className="fas fa-shield-alt me-2"></i>
                Admin Avansat Restaurant - Management Profesional
              </h1>
            </div>
            <div className="col-md-6 text-end">
              <div className="d-inline-flex gap-2">
                <button className="btn btn-sm btn-outline-warning">
                  <i className="fas fa-file-invoice me-1"></i>
                  Raport Fiscal
                </button>
                <button className="btn btn-sm btn-outline-info">
                  <i className="fas fa-download me-1"></i>
                  Export ANAF
                </button>
                <button className="btn btn-sm btn-outline-danger">
                  <i className="fas fa-archive me-1"></i>
                  Arhivă
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sidebar */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2">
            <div className="admin-advanced-sidebar bg-white shadow-sm rounded p-3">
              <nav className="nav flex-column">
                <button
                  className={`nav-link advanced-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveSection('dashboard')}
                >
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Executive Dashboard
                </button>
                <button
                  className={`nav-link advanced-nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveSection('orders')}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Comenzi
                </button>
                <button
                  className={`nav-link advanced-nav-btn ${activeSection === 'inventory' ? 'active' : ''}`}
                  onClick={() => setActiveSection('inventory')}
                >
                  <i className="fas fa-warehouse me-2"></i>
                  Inventar
                </button>
                <button
                  className={`nav-link advanced-nav-btn ${activeSection === 'stock-dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveSection('stock-dashboard')}
                >
                  <i className="fas fa-chart-bar me-2"></i>
                  Dashboard Stocuri
                </button>
                <button
                  className={`nav-link advanced-nav-btn ${activeSection === 'portion-control' ? 'active' : ''}`}
                  onClick={() => setActiveSection('portion-control')}
                >
                  <i className="fas fa-balance-scale me-2"></i>
                  Controlul Porțiilor
                </button>
                <button
                  className={`nav-link advanced-nav-btn ${activeSection === 'variance' ? 'active' : ''}`}
                  onClick={() => setActiveSection('variance')}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  Raportare Varianță
                </button>
                <button
                  className={`nav-link advanced-nav-btn ${activeSection === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveSection('reports')}
                >
                  <i className="fas fa-file-chart-line me-2"></i>
                  Rapoarte Avansate
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-md-10">
            <div className="admin-advanced-content">
              {activeSection === 'dashboard' && (
                <div className="section-content">
                  <ExecutiveDashboardPage />
                </div>
              )}

              {activeSection === 'orders' && (
                <div className="section-content">
                  <OrdersManagementPage />
                </div>
              )}

              {activeSection === 'inventory' && (
                <div className="section-content">
                  <InventoryDashboardPage />
                </div>
              )}

              {activeSection === 'stock-dashboard' && (
                <div className="section-content">
                  <AdvancedStockDashboardPage />
                </div>
              )}

              {activeSection === 'portion-control' && (
                <div className="section-content">
                  <PortionsPage />
                </div>
              )}

              {activeSection === 'variance' && (
                <div className="section-content">
                  <VarianceReportsPage />
                </div>
              )}

              {activeSection === 'reports' && (
                <div className="section-content">
                  <AdvancedReportsPage />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
