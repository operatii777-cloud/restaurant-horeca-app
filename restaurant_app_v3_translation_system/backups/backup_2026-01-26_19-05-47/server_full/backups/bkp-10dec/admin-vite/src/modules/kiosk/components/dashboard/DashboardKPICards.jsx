import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, PieChart, AlertTriangle } from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import './DashboardKPICards.css';

/**
 * 4 KPI Cards pentru Dashboard (ca în imaginea HorecaOS Assembly)
 * 1. Venituri Azi (RON) - orange
 * 2. Comenzi Astăzi - green
 * 3. Food Cost (%) - blue
 * 4. Alerte Critice - red
 */
export const DashboardKPICards = () => {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState(null);

  useEffect(() => {
    loadKPIData();
    // Refresh la fiecare 30 secunde
    const interval = setInterval(loadKPIData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadKPIData = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/api/admin/dashboard/kpi');
      
      if (response.data) {
        setKpiData(response.data);
      } else {
        // Fallback cu date mock
        setKpiData({
          todayRevenue: 12450,
          revenueChange: '+12%',
          todayOrders: 47,
          todayOrdersChange: '+8',
          cogsToday: 3600,
          inventoryAlerts: 3,
        });
      }
    } catch (error) {
      console.error('Error loading KPI data:', error);
      // Date mock în caz de eroare
      setKpiData({
        todayRevenue: 0,
        revenueChange: '0%',
        todayOrders: 0,
        todayOrdersChange: '0',
        cogsToday: 0,
        inventoryAlerts: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !kpiData) {
    return (
      <div className="kpi-cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card kpi-card--loading">
            <div className="kpi-card__skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  const foodCostPercentage = kpiData.todayRevenue > 0 
    ? ((kpiData.cogsToday / kpiData.todayRevenue) * 100).toFixed(1)
    : 0;

  const cards = [
    {
      id: 'revenue',
      title: 'Venituri Azi (RON)',
      value: kpiData.todayRevenue.toLocaleString('ro-RO'),
      change: kpiData.revenueChange,
      trend: kpiData.revenueChange.startsWith('+') ? 'up' : 'down',
      icon: DollarSign,
      color: 'orange',
    },
    {
      id: 'orders',
      title: 'Comenzi Astăzi',
      value: kpiData.todayOrders,
      change: kpiData.todayOrdersChange,
      trend: kpiData.todayOrdersChange.startsWith('+') ? 'up' : 'down',
      icon: ShoppingBag,
      color: 'green',
    },
    {
      id: 'food-cost',
      title: 'Food Cost',
      value: `${foodCostPercentage}%`,
      change: '-2.1%',
      trend: 'down',
      icon: PieChart,
      color: 'blue',
    },
    {
      id: 'alerts',
      title: 'Alerte Critice',
      value: kpiData.inventoryAlerts || 0,
      change: null,
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <div className="kpi-cards">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <div key={card.id} className={`kpi-card kpi-card--${card.color}`}>
            <div className="kpi-card__header">
              <div className={`kpi-card__icon kpi-card__icon--${card.color}`}>
                <Icon size={24} />
              </div>
              <span className="kpi-card__title">{card.title}</span>
            </div>
            
            <div className="kpi-card__body">
              <div className="kpi-card__value">{card.value}</div>
              
              {card.change && (
                <div className={`kpi-card__change kpi-card__change--${card.trend}`}>
                  <TrendIcon size={16} />
                  <span>{card.change}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

