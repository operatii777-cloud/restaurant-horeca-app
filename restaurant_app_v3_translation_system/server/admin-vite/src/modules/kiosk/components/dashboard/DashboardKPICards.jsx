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
      
      console.log('[DashboardKPICards] API Response:', response.data);
      
      // Endpoint-ul returnează { success: true, todayRevenue, todayOrders, ... }
      if (response && response.data) {
        const data = response.data;
        const kpiData = {
          todayRevenue: data.todayRevenue || 0,
          revenueChange: data.revenueChange || '0%',
          todayOrders: data.todayOrders || 0,
          todayOrdersChange: data.todayOrdersChange || '0',
          cogsToday: data.cogsToday || 0,
          inventoryAlerts: data.inventoryAlerts || 0,
        };
        
        console.log('[DashboardKPICards] Parsed KPI Data:', kpiData);
        setKpiData(kpiData);
      } else {
        console.warn('[DashboardKPICards] No data in response');
        setKpiData({
          todayRevenue: 0,
          revenueChange: '0%',
          todayOrders: 0,
          todayOrdersChange: '0',
          cogsToday: 0,
          inventoryAlerts: 0,
        });
      }
    } catch (error) {
      console.error('[DashboardKPICards] Error loading KPI data:', error);
      console.error('[DashboardKPICards] Error details:', error.response?.data || error.message);
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

  const foodCostPercentage = (kpiData.todayRevenue && kpiData.todayRevenue > 0) 
    ? ((kpiData.cogsToday || 0) / kpiData.todayRevenue * 100).toFixed(1)
    : 0;

  const cards = [
    {
      id: 'revenue',
      title: 'Venituri Azi (RON)',
      value: (kpiData.todayRevenue || 0).toLocaleString('ro-RO'),
      change: kpiData.revenueChange || '0%',
      trend: (kpiData.revenueChange || '0%').startsWith('+') ? 'up' : 'down',
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

