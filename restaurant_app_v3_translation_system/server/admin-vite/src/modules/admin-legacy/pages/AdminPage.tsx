import { useState } from 'react';
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import { MenuManagementPage } from '@/modules/menu/pages/MenuManagementPage';
import { WaitersPage } from '@/modules/waiters/pages/WaitersPage';
import { StockManagementPage } from '@/modules/stocks/pages/StockManagementPage';
import { InternalMessagingPage } from '@/modules/internal-messaging/pages/InternalMessagingPage';
import { MenuPDFBuilderPage } from '@/modules/menu-pdf/pages/MenuPDFBuilderPage';
import './AdminPage.css';

/**
 * Admin Page - Legacy admin.html refactored to React
 * 
 * Main admin interface combining:
 * - Dashboard with analytics
 * - Menu management
 * - Waiter management
 * - Stock management
 * - Internal messaging
 * - PDF builder for technical sheets
 */
export function AdminPage() {
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'menu' | 'waiters' | 'stocks' | 'messages' | 'pdf-builder'
  >('dashboard');

  return (
    <div className="admin-page">
      {/* Main Header */}
      <div className="admin-header bg-white shadow-sm mb-4">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col-md-6">
              <h1 className="h3 mb-0 text-gradient-admin">
                <i className="fas fa-cog me-2"></i>
                Panou Administrare Restaurant
              </h1>
            </div>
            <div className="col-md-6 text-end">
              <div className="d-inline-flex gap-2">
                <button className="btn btn-sm btn-outline-primary">
                  <i className="fas fa-bell me-1"></i>
                  Notificări
                  <span className="badge bg-danger ms-1">3</span>
                </button>
                <button className="btn btn-sm btn-outline-success">
                  <i className="fas fa-sync me-1"></i>
                  Sincronizare
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
            <div className="admin-sidebar bg-white shadow-sm rounded p-3">
              <nav className="nav flex-column">
                <button
                  className={`nav-link admin-nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveSection('dashboard')}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  Dashboard
                </button>
                <button
                  className={`nav-link admin-nav-btn ${activeSection === 'menu' ? 'active' : ''}`}
                  onClick={() => setActiveSection('menu')}
                >
                  <i className="fas fa-utensils me-2"></i>
                  Meniuri
                </button>
                <button
                  className={`nav-link admin-nav-btn ${activeSection === 'waiters' ? 'active' : ''}`}
                  onClick={() => setActiveSection('waiters')}
                >
                  <i className="fas fa-user-tie me-2"></i>
                  Ospătari
                </button>
                <button
                  className={`nav-link admin-nav-btn ${activeSection === 'stocks' ? 'active' : ''}`}
                  onClick={() => setActiveSection('stocks')}
                >
                  <i className="fas fa-boxes me-2"></i>
                  Stocuri
                </button>
                <button
                  className={`nav-link admin-nav-btn ${activeSection === 'messages' ? 'active' : ''}`}
                  onClick={() => setActiveSection('messages')}
                >
                  <i className="fas fa-comments me-2"></i>
                  Mesaje
                </button>
                <button
                  className={`nav-link admin-nav-btn ${activeSection === 'pdf-builder' ? 'active' : ''}`}
                  onClick={() => setActiveSection('pdf-builder')}
                >
                  <i className="fas fa-file-pdf me-2"></i>
                  PDF Builder
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-md-10">
            <div className="admin-content">
              {activeSection === 'dashboard' && (
                <div className="section-content">
                  <DashboardPage />
                </div>
              )}

              {activeSection === 'menu' && (
                <div className="section-content">
                  <MenuManagementPage />
                </div>
              )}

              {activeSection === 'waiters' && (
                <div className="section-content">
                  <WaitersPage />
                </div>
              )}

              {activeSection === 'stocks' && (
                <div className="section-content">
                  <StockManagementPage />
                </div>
              )}

              {activeSection === 'messages' && (
                <div className="section-content">
                  <InternalMessagingPage />
                </div>
              )}

              {activeSection === 'pdf-builder' && (
                <div className="section-content">
                  <MenuPDFBuilderPage />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
