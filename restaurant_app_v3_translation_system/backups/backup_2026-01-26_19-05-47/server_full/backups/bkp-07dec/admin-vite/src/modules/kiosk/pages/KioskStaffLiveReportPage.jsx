import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import { Trophy, TrendingUp, ShoppingBag, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { getStaffLiveReport, checkKioskSession } from '../api/KioskApi';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './KioskStaffLiveReportPage.css';

/**
 * Leaderboard Live - Top 5 Ospătari
 * Refresh: Manual sau automat la 1 oră
 */
export const KioskStaffLiveReportPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const currentSession = checkKioskSession();
    if (!currentSession) {
      navigate('/kiosk/login');
      return;
    }

    // Doar admin și supervisor pot accesa
    if (currentSession.role !== 'admin' && currentSession.role !== 'supervisor') {
      alert('Acces restricționat. Doar administratorii și supervizorii pot accesa rapoarte ospătari.');
      navigate('/kiosk/tables');
      return;
    }

    setSession(currentSession);
    loadLeaderboard();
    
    // Refresh automat la 1 oră (3600000 ms)
    const interval = setInterval(loadLeaderboard, 3600000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadLeaderboard = async () => {
    setError(null);
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Obținem toate comenzile din ziua curentă
      const ordersResponse = await httpClient.get('/api/orders');
      
      if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
        const todayOrders = ordersResponse.data.filter(order => {
          const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
          return orderDate === today && order.waiter_username;
        });

        // Grupăm după ospătar
        const waiterStats = {};
        
        todayOrders.forEach(order => {
          const waiter = order.waiter_username;
          if (!waiterStats[waiter]) {
            waiterStats[waiter] = {
              username: waiter,
              totalSales: 0,
              totalOrders: 0,
              paidOrders: 0,
              averageOrder: 0,
            };
          }
          
          waiterStats[waiter].totalSales += order.total || 0;
          waiterStats[waiter].totalOrders += 1;
          if (order.is_paid === 1) {
            waiterStats[waiter].paidOrders += 1;
          }
        });

        // Calculăm medie și convertim în array
        const waitersArray = Object.values(waiterStats).map(w => ({
          ...w,
          averageOrder: w.totalOrders > 0 ? w.totalSales / w.totalOrders : 0,
        }));

        // Sortăm după vânzări și luăm TOP 5
        const top5 = waitersArray
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5);

        setLeaderboard(top5);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('❌ Eroare la încărcarea leaderboard:', err);
      setError('Nu s-a putut încărca leaderboard-ul.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  const getMedalColor = (rank) => {
    const colors = {
      0: 'linear-gradient(135deg, #fbbf24, #f59e0b)', // gold
      1: 'linear-gradient(135deg, #d1d5db, #9ca3af)', // silver
      2: 'linear-gradient(135deg, #cd7f32, #b8692f)', // bronze
    };
    return colors[rank] || 'linear-gradient(135deg, #64748b, #475569)';
  };

  return (
    <div className="staff-leaderboard">
      {/* Header */}
      <div className="staff-leaderboard__header">
        <div>
          <h2 className="staff-leaderboard__title">
            <Trophy size={28} />
            Scoreboard Ospătari Live
          </h2>
          <p className="staff-leaderboard__subtitle">
            Performanța echipei în timp real - Top 5 Ospătari
          </p>
        </div>
        <div className="staff-leaderboard__actions">
          <Button 
            variant="outline-light" 
            size="lg"
            onClick={loadLeaderboard}
            disabled={loading}
            className="me-2"
          >
            {loading ? (
              <><RefreshCw size={18} className="me-2 rotating" />Actualizare...</>
            ) : (
              <><RefreshCw size={18} className="me-2" />Refresh</>
            )}
          </Button>
          <Button variant="outline-light" size="lg" onClick={() => navigate('/kiosk/tables')}>
            <i className="fas fa-arrow-left me-2"></i>Înapoi
          </Button>
        </div>
      </div>

      {/* Last Update Info */}
      {lastUpdate && (
        <div className="staff-leaderboard__update-info">
          <Clock size={14} className="me-1" />
          Ultima actualizare: {lastUpdate.toLocaleTimeString('ro-RO')}
          <span className="ms-2 text-muted">• Refresh automat la 1 oră</span>
        </div>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Leaderboard */}
      {loading && leaderboard.length === 0 ? (
        <div className="staff-leaderboard__loading">
          <RefreshCw size={48} className="rotating mb-3" />
          <p>Se încarcă scoreboard-ul...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="fas fa-info-circle me-2"></i>
          Nu există date disponibile pentru azi. Niciun ospătar nu are comenzi încă.
        </Alert>
      ) : (
        <div className="staff-leaderboard__list">
          {leaderboard.map((waiter, index) => (
            <div 
              key={waiter.username} 
              className={`leaderboard-card leaderboard-card--rank-${index + 1}`}
            >
              {/* Rank Badge */}
              <div 
                className="leaderboard-card__rank"
                style={{ background: getMedalColor(index) }}
              >
                {index < 3 ? <Trophy size={24} /> : <span className="rank-number">{index + 1}</span>}
              </div>

              {/* Waiter Info */}
              <div className="leaderboard-card__info">
                <div className="leaderboard-card__name">
                  <i className="fas fa-user-tie me-2"></i>
                  {waiter.username}
                </div>
                {index === 0 && (
                  <Badge bg="warning" className="leaderboard-card__badge">
                    <Trophy size={12} className="me-1" />Top Performer
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="leaderboard-card__stats">
                <div className="stat-item">
                  <DollarSign size={16} className="stat-icon stat-icon--sales" />
                  <div className="stat-content">
                    <div className="stat-value">{waiter.totalSales.toFixed(2)} RON</div>
                    <div className="stat-label">Vânzări</div>
                  </div>
                </div>

                <div className="stat-item">
                  <ShoppingBag size={16} className="stat-icon stat-icon--orders" />
                  <div className="stat-content">
                    <div className="stat-value">{waiter.totalOrders}</div>
                    <div className="stat-label">Comenzi</div>
                  </div>
                </div>

                <div className="stat-item">
                  <TrendingUp size={16} className="stat-icon stat-icon--avg" />
                  <div className="stat-content">
                    <div className="stat-value">{waiter.averageOrder.toFixed(2)} RON</div>
                    <div className="stat-label">Medie/Comandă</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="leaderboard-card__progress">
                <div 
                  className="leaderboard-card__progress-bar"
                  style={{ 
                    width: leaderboard[0] ? `${(waiter.totalSales / leaderboard[0].totalSales) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
