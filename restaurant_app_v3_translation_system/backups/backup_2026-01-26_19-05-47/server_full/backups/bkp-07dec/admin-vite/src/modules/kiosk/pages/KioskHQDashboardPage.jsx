import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Row, Col, Table, ProgressBar, Alert } from 'react-bootstrap';
import { 
  Globe, TrendingUp, TrendingDown, DollarSign, Users,
  ShoppingCart, Clock, Star, AlertTriangle, CheckCircle,
  MapPin, Building, BarChart3
} from 'lucide-react';
import './KioskHQDashboardPage.css';

/**
 * KioskHQDashboardPage - Headquarters Multi-Location Dashboard
 * Features:
 * - Agregare KPIs din toate locațiile
 * - Comparații între restaurante
 * - Alertă pentru locații sub-performante
 * - Real-time overview
 */
export const KioskHQDashboardPage = () => {
  const [locations, setLocations] = useState([]);
  const [totalStats, setTotalStats] = useState({
    revenue: 0,
    orders: 0,
    avgTicket: 0,
    staff: 0
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Fetch locations
      const locRes = await fetch('/api/locations');
      const locData = await locRes.json();
      const locs = locData.locations || locData || [];
      
      // Mock data for multi-location stats
      const enrichedLocations = locs.length > 0 ? locs.map((loc, idx) => ({
        ...loc,
        revenue: 15000 + Math.random() * 10000,
        orders: 80 + Math.floor(Math.random() * 60),
        avgTicket: 45 + Math.random() * 25,
        staffOnShift: 4 + Math.floor(Math.random() * 8),
        rating: 4.2 + Math.random() * 0.7,
        trend: Math.random() > 0.3 ? 'up' : 'down',
        trendPercent: (Math.random() * 20).toFixed(1),
        status: Math.random() > 0.1 ? 'online' : 'offline'
      })) : [
        { id: 1, name: 'Restaurant Central', city: 'București', revenue: 22500, orders: 125, avgTicket: 58, staffOnShift: 12, rating: 4.8, trend: 'up', trendPercent: 12.5, status: 'online' },
        { id: 2, name: 'Restaurant Nord', city: 'București', revenue: 18200, orders: 98, avgTicket: 52, staffOnShift: 8, rating: 4.6, trend: 'up', trendPercent: 8.3, status: 'online' },
        { id: 3, name: 'Bistro Mall', city: 'Cluj-Napoca', revenue: 15800, orders: 85, avgTicket: 48, staffOnShift: 6, rating: 4.5, trend: 'down', trendPercent: 3.2, status: 'online' },
        { id: 4, name: 'Restaurant Sud', city: 'Timișoara', revenue: 12400, orders: 72, avgTicket: 45, staffOnShift: 5, rating: 4.3, trend: 'up', trendPercent: 5.7, status: 'offline' }
      ];
      
      // Calculate totals
      const totals = enrichedLocations.reduce((acc, loc) => ({
        revenue: acc.revenue + loc.revenue,
        orders: acc.orders + loc.orders,
        staff: acc.staff + loc.staffOnShift
      }), { revenue: 0, orders: 0, staff: 0 });
      
      totals.avgTicket = totals.orders > 0 ? totals.revenue / totals.orders : 0;
      
      setLocations(enrichedLocations);
      setTotalStats(totals);
      setLoading(false);
    } catch (err) {
      console.error('Error loading HQ data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(value);
  };

  const getBestPerformer = () => {
    return locations.reduce((best, loc) => loc.revenue > best.revenue ? loc : best, locations[0]);
  };

  return (
    <div className="hq-dashboard">
      {/* Header */}
      <div className="hq-header">
        <div className="hq-header__left">
          <h1 className="hq-title">
            <Globe className="hq-title-icon" />
            HQ Dashboard
          </h1>
          <p className="hq-subtitle">Multi-Location Overview • Real-time Analytics</p>
        </div>
        <div className="hq-header__right">
          <Badge bg="success" className="hq-live-badge">
            <span className="pulse-dot"></span> LIVE
          </Badge>
        </div>
      </div>

      {/* Aggregate KPIs */}
      <div className="hq-kpis">
        <Card className="hq-kpi hq-kpi--revenue">
          <Card.Body>
            <div className="hq-kpi__icon"><DollarSign /></div>
            <div className="hq-kpi__content">
              <div className="hq-kpi__value">{formatCurrency(totalStats.revenue)}</div>
              <div className="hq-kpi__label">Venituri Totale Azi</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="hq-kpi hq-kpi--orders">
          <Card.Body>
            <div className="hq-kpi__icon"><ShoppingCart /></div>
            <div className="hq-kpi__content">
              <div className="hq-kpi__value">{totalStats.orders}</div>
              <div className="hq-kpi__label">Comenzi Totale</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="hq-kpi hq-kpi--ticket">
          <Card.Body>
            <div className="hq-kpi__icon"><BarChart3 /></div>
            <div className="hq-kpi__content">
              <div className="hq-kpi__value">{formatCurrency(totalStats.avgTicket)}</div>
              <div className="hq-kpi__label">Bon Mediu</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="hq-kpi hq-kpi--staff">
          <Card.Body>
            <div className="hq-kpi__icon"><Users /></div>
            <div className="hq-kpi__content">
              <div className="hq-kpi__value">{totalStats.staff}</div>
              <div className="hq-kpi__label">Staff Activ</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="hq-kpi hq-kpi--locations">
          <Card.Body>
            <div className="hq-kpi__icon"><Building /></div>
            <div className="hq-kpi__content">
              <div className="hq-kpi__value">{locations.length}</div>
              <div className="hq-kpi__label">Locații Active</div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Best Performer Alert */}
      {locations.length > 0 && (
        <Alert variant="success" className="hq-alert">
          <CheckCircle size={20} className="me-2" />
          <strong>Top Performer:</strong> {getBestPerformer()?.name} cu {formatCurrency(getBestPerformer()?.revenue)} venituri azi
        </Alert>
      )}

      {/* Offline Alert */}
      {locations.filter(l => l.status === 'offline').length > 0 && (
        <Alert variant="danger" className="hq-alert">
          <AlertTriangle size={20} className="me-2" />
          <strong>Atenție:</strong> {locations.filter(l => l.status === 'offline').length} locații offline!
        </Alert>
      )}

      {/* Locations Comparison Table */}
      <Card className="hq-section">
        <Card.Header className="hq-section-header">
          <h2><MapPin size={20} /> Comparație Locații</h2>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="hq-table">
            <thead>
              <tr>
                <th>Locație</th>
                <th>Oraș</th>
                <th>Venituri</th>
                <th>Trend</th>
                <th>Comenzi</th>
                <th>Bon Mediu</th>
                <th>Staff</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="hq-table__icon">
                        <Building size={16} />
                      </div>
                      <strong>{loc.name}</strong>
                    </div>
                  </td>
                  <td><Badge bg="secondary">{loc.city}</Badge></td>
                  <td><strong>{formatCurrency(loc.revenue)}</strong></td>
                  <td>
                    <span className={`hq-trend hq-trend--${loc.trend}`}>
                      {loc.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {loc.trendPercent}%
                    </span>
                  </td>
                  <td>{loc.orders}</td>
                  <td>{formatCurrency(loc.avgTicket)}</td>
                  <td>
                    <Badge bg="info">{loc.staffOnShift}</Badge>
                  </td>
                  <td>
                    <span className="d-flex align-items-center gap-1">
                      <Star size={14} className="text-warning" fill="#fbbf24" />
                      {loc.rating?.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <Badge bg={loc.status === 'online' ? 'success' : 'danger'}>
                      {loc.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Revenue Comparison Chart (simplified bars) */}
      <Card className="hq-section">
        <Card.Header className="hq-section-header">
          <h2><BarChart3 size={20} /> Comparație Venituri</h2>
        </Card.Header>
        <Card.Body>
          <div className="hq-bars">
            {locations.map((loc) => {
              const maxRevenue = Math.max(...locations.map(l => l.revenue));
              const percentage = (loc.revenue / maxRevenue) * 100;
              
              return (
                <div key={loc.id} className="hq-bar">
                  <div className="hq-bar__label">{loc.name}</div>
                  <div className="hq-bar__track">
                    <div 
                      className="hq-bar__fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="hq-bar__value">{formatCurrency(loc.revenue)}</div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default KioskHQDashboardPage;

