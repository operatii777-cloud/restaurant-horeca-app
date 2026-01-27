import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, ProgressBar, Table } from 'react-bootstrap';
import { 
  Trophy, Clock, ChefHat, Flame, Star, 
  TrendingUp, Award, Target, Zap, Medal
} from 'lucide-react';
import './KioskScoreboardPage.css';

/**
 * KioskScoreboardPage - Scoreboard Bucătărie (Gamification)
 * Features:
 * - Ranking bucătari pe timp mediu preparare
 * - Comenzi finalizate / oră
 * - Streak-uri (comenzi consecutive sub target)
 * - Live leaderboard
 */
export const KioskScoreboardPage = () => {
  const [stats, setStats] = useState({
    cooks: [],
    totalOrders: 0,
    avgPrepTime: 0,
    fastestOrder: null,
    ordersThisHour: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      // Fetch today's KDS/kitchen stats
      const today = new Date().toISOString().split('T')[0];
      
      // Orders stats
      const ordersRes = await fetch(`/api/orders?date=${today}&status=completed`);
      const ordersData = await ordersRes.json();
      const orders = ordersData.orders || ordersData || [];
      
      // Calculate cook stats (mock data for now - will be connected to real KDS data)
      const cookStats = [
        { id: 1, name: 'Chef Alexandru', orders: 45, avgTime: 8.5, streak: 12, rating: 4.9, position: 'Head Chef' },
        { id: 2, name: 'Maria Popescu', orders: 38, avgTime: 9.2, streak: 8, rating: 4.7, position: 'Sous Chef' },
        { id: 3, name: 'Ion Marinescu', orders: 42, avgTime: 10.1, streak: 5, rating: 4.6, position: 'Line Cook' },
        { id: 4, name: 'Elena Vasilescu', orders: 35, avgTime: 11.3, streak: 3, rating: 4.5, position: 'Line Cook' },
        { id: 5, name: 'Andrei Dumitrescu', orders: 28, avgTime: 12.5, streak: 2, rating: 4.4, position: 'Prep Cook' },
      ].sort((a, b) => a.avgTime - b.avgTime);

      // Calculate totals
      const totalOrders = cookStats.reduce((sum, c) => sum + c.orders, 0);
      const avgPrepTime = cookStats.reduce((sum, c) => sum + c.avgTime, 0) / cookStats.length;
      
      setStats({
        cooks: cookStats,
        totalOrders,
        avgPrepTime: avgPrepTime.toFixed(1),
        fastestOrder: cookStats[0],
        ordersThisHour: Math.floor(Math.random() * 15) + 5
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading scoreboard:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Get medal color based on position
  const getMedal = (index) => {
    switch (index) {
      case 0: return { icon: Medal, color: '#fbbf24', label: '🥇' };
      case 1: return { icon: Medal, color: '#94a3b8', label: '🥈' };
      case 2: return { icon: Medal, color: '#cd7f32', label: '🥉' };
      default: return null;
    }
  };

  // Calculate performance bar color
  const getPerfColor = (avgTime) => {
    if (avgTime <= 8) return 'success';
    if (avgTime <= 12) return 'warning';
    return 'danger';
  };

  return (
    <div className="scoreboard-page">
      {/* Header */}
      <div className="scoreboard-header">
        <div className="scoreboard-header__left">
          <h1 className="scoreboard-title">
            <Trophy className="scoreboard-title-icon" />
            Scoreboard Bucătărie
          </h1>
          <p className="scoreboard-subtitle">Live Performance • Gamification Kitchen</p>
        </div>
        <div className="scoreboard-header__right">
          <div className="scoreboard-time">
            {currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="scoreboard-kpis">
        <Card className="scoreboard-kpi scoreboard-kpi--orders">
          <Card.Body>
            <div className="scoreboard-kpi__icon"><ChefHat /></div>
            <div className="scoreboard-kpi__content">
              <div className="scoreboard-kpi__value">{stats.totalOrders}</div>
              <div className="scoreboard-kpi__label">Comenzi Azi</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="scoreboard-kpi scoreboard-kpi--time">
          <Card.Body>
            <div className="scoreboard-kpi__icon"><Clock /></div>
            <div className="scoreboard-kpi__content">
              <div className="scoreboard-kpi__value">{stats.avgPrepTime}m</div>
              <div className="scoreboard-kpi__label">Timp Mediu</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="scoreboard-kpi scoreboard-kpi--hour">
          <Card.Body>
            <div className="scoreboard-kpi__icon"><Zap /></div>
            <div className="scoreboard-kpi__content">
              <div className="scoreboard-kpi__value">{stats.ordersThisHour}</div>
              <div className="scoreboard-kpi__label">Comenzi/Oră</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="scoreboard-kpi scoreboard-kpi--target">
          <Card.Body>
            <div className="scoreboard-kpi__icon"><Target /></div>
            <div className="scoreboard-kpi__content">
              <div className="scoreboard-kpi__value">10m</div>
              <div className="scoreboard-kpi__label">Target</div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="scoreboard-leaderboard">
        <Card.Header className="scoreboard-leaderboard__header">
          <h2><Award /> Live Leaderboard</h2>
          <Badge bg="success" className="pulse">LIVE</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="scoreboard-podium">
            {stats.cooks.slice(0, 3).map((cook, idx) => (
              <div 
                key={cook.id} 
                className={`scoreboard-podium__item scoreboard-podium__item--${idx + 1}`}
              >
                <div className="scoreboard-podium__medal">
                  {getMedal(idx)?.label}
                </div>
                <div className="scoreboard-podium__avatar">
                  {cook.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="scoreboard-podium__name">{cook.name}</div>
                <div className="scoreboard-podium__position">{cook.position}</div>
                <div className="scoreboard-podium__stats">
                  <span><Clock size={14} /> {cook.avgTime}m</span>
                  <span><ChefHat size={14} /> {cook.orders}</span>
                </div>
                <div className="scoreboard-podium__streak">
                  <Flame size={16} /> Streak: {cook.streak}
                </div>
              </div>
            ))}
          </div>

          <Table responsive className="scoreboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Bucătar</th>
                <th>Poziție</th>
                <th>Comenzi</th>
                <th>Timp Mediu</th>
                <th>Streak</th>
                <th>Rating</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {stats.cooks.map((cook, idx) => (
                <tr key={cook.id} className={idx < 3 ? 'scoreboard-table__top' : ''}>
                  <td>
                    {idx < 3 ? getMedal(idx)?.label : idx + 1}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="scoreboard-table__avatar">
                        {cook.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <strong>{cook.name}</strong>
                    </div>
                  </td>
                  <td><Badge bg="secondary">{cook.position}</Badge></td>
                  <td><strong>{cook.orders}</strong></td>
                  <td>
                    <span className={`text-${getPerfColor(cook.avgTime)}`}>
                      {cook.avgTime}m
                    </span>
                  </td>
                  <td>
                    <Badge bg={cook.streak >= 10 ? 'danger' : cook.streak >= 5 ? 'warning' : 'secondary'}>
                      <Flame size={12} /> {cook.streak}
                    </Badge>
                  </td>
                  <td>
                    <span className="d-flex align-items-center gap-1">
                      <Star size={14} className="text-warning" fill="#fbbf24" />
                      {cook.rating}
                    </span>
                  </td>
                  <td style={{ minWidth: '120px' }}>
                    <ProgressBar 
                      now={Math.max(0, 100 - (cook.avgTime - 5) * 10)}
                      variant={getPerfColor(cook.avgTime)}
                      style={{ height: '8px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Motivational Footer */}
      <div className="scoreboard-footer">
        <div className="scoreboard-footer__message">
          <Flame className="text-warning" size={24} />
          <span>Target: Sub 10 minute per comandă! Keep the streak going! 🔥</span>
        </div>
      </div>
    </div>
  );
};

export default KioskScoreboardPage;

