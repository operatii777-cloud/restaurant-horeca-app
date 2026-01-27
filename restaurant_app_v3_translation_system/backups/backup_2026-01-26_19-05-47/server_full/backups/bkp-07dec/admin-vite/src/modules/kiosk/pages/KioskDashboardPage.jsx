import React from 'react';
import { DashboardKPICards } from '../components/dashboard/DashboardKPICards';
import { DashboardRecentOrders } from '../components/dashboard/DashboardRecentOrders';
import { DashboardTopProducts } from '../components/dashboard/DashboardTopProducts';
import './KioskDashboardPage.css';

/**
 * Pagina principală Dashboard pentru KIOSK
 * Layout inspirat din HorecaOS Assembly dashboard.html
 */
export const KioskDashboardPage = () => {
  return (
    <div className="kiosk-dashboard">
      {/* Header */}
      <div className="kiosk-dashboard__header">
        <div>
          <h1 className="kiosk-dashboard__title">Dashboard</h1>
          <p className="kiosk-dashboard__subtitle">
            Bun venit! Iată statusul restaurantului tău.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kiosk-dashboard__section">
        <DashboardKPICards />
      </div>

      {/* Grid: Comenzi Recente + Top Produse */}
      <div className="kiosk-dashboard__grid">
        <div className="kiosk-dashboard__main">
          <DashboardRecentOrders />
        </div>
        <div className="kiosk-dashboard__sidebar">
          <DashboardTopProducts />
        </div>
      </div>
    </div>
  );
};

