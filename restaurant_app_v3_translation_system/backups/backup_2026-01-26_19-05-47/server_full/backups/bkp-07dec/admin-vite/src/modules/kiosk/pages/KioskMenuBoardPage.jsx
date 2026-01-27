import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useKioskTheme, ThemeToggleButton } from '../context/KioskThemeContext';

/**
 * Digital Signage (Menu Board TV)
 * Afișaj pentru TV-uri în restaurant - rotație automată categorii + promoții
 * NOTĂ: Această pagină este întotdeauna dark pentru afișaj TV
 */
export const KioskMenuBoardPage = () => {
  const navigate = useNavigate();
  const { theme } = useKioskTheme(); // Pentru consistență cu alte pagini
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [activePromo, setActivePromo] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadData();
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    const rotator = setInterval(() => {
      setActiveCategoryIdx(prev => (prev + 1) % categories.length);
    }, 10000); // 10 secunde per categorie
    return () => clearInterval(rotator);
  }, [categories.length]);

  const loadData = async () => {
    try {
      const menuRes = await axios.get('/api/menu/all?lang=ro');
      if (menuRes.data && menuRes.data.products) {
        const activeItems = menuRes.data.products.filter(p => p.active !== false);
        setMenuItems(activeItems);
        const cats = [...new Set(activeItems.map(p => p.category || 'Altele'))];
        setCategories(cats);
      }
      try {
        const promoRes = await axios.get('/api/happyhour/active');
        if (promoRes.data && promoRes.data.active) {
          setActivePromo({ name: promoRes.data.name || 'Happy Hour', discount: promoRes.data.discount || 20, endHour: promoRes.data.end_time ? parseInt(promoRes.data.end_time.split(':')[0]) : 20 });
        }
      } catch {}
    } catch (error) {
      console.error('Eroare:', error);
    }
    setLoading(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentCategory = categories[activeCategoryIdx] || 'Meniu';
  const itemsToShow = menuItems.filter(i => (i.category || 'Altele') === currentCategory).slice(0, 9);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍽️</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Se încarcă meniul...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', color: '#fff', fontFamily: '"Inter", system-ui, sans-serif', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(71, 85, 105, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {!isFullscreen && (
            <button onClick={() => navigate('/kiosk/tables')} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>
              ← Înapoi
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', color: '#f59e0b', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Restaurant App</h1>
            <p style={{ fontSize: '16px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', margin: '4px 0 0 0' }}>Savurează Momentul</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <ThemeToggleButton size="lg" />
          <button onClick={toggleFullscreen} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>
            {isFullscreen ? '⊡ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '48px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px' }}>{time.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</div>
            <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>{time.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar Categorii */}
        <aside style={{ width: '250px', background: 'rgba(0, 0, 0, 0.15)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', borderRight: '1px solid rgba(71, 85, 105, 0.5)' }}>
          {categories.map((cat, idx) => (
            <div key={cat} onClick={() => setActiveCategoryIdx(idx)} style={{ padding: '16px 20px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.5s ease', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: idx === activeCategoryIdx ? '#f59e0b' : 'transparent', color: idx === activeCategoryIdx ? '#fff' : '#94a3b8', transform: idx === activeCategoryIdx ? 'scale(1.05)' : 'scale(1)', boxShadow: idx === activeCategoryIdx ? '0 8px 24px rgba(245, 158, 11, 0.4)' : 'none' }}>
              {cat}
              {idx === activeCategoryIdx && <div style={{ width: '10px', height: '10px', backgroundColor: '#fff', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />}
            </div>
          ))}
        </aside>

        {/* Grid Produse */}
        <main style={{ flex: 1, padding: '32px', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignContent: 'start' }}>
          {itemsToShow.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
              <span style={{ fontSize: '96px' }}>🍽️</span>
              <h2 style={{ fontSize: '32px', marginTop: '16px' }}>În Curând</h2>
            </div>
          ) : (
            itemsToShow.map((item, idx) => (
              <div key={item.id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.6s ease-out', animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(71, 85, 105, 0.5)' }}>
                  {item.image ? (
                    <img src={item.image.startsWith('http') ? item.image : `/images/menu/${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', opacity: 0.3 }}>🍽️</div>
                  )}
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</h3>
                    {item.description && <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(71, 85, 105, 0.5)' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '24px' }}>{item.price}<span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '4px' }}>RON</span></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {/* Promo Ticker */}
      {activePromo ? (
        <footer style={{ background: 'linear-gradient(90deg, #dc2626 0%, #ea580c 50%, #dc2626 100%)', padding: '16px 48px', boxShadow: '0 -8px 32px rgba(220, 38, 38, 0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
            <span style={{ fontSize: '28px' }}>⏰</span>
            {activePromo.name}: -{activePromo.discount}% la toate produsele!
            <span style={{ backgroundColor: '#fff', color: '#dc2626', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', marginLeft: '16px' }}>Până la {activePromo.endHour}:00</span>
          </div>
        </footer>
      ) : (
        <footer style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '12px 48px', borderTop: '1px solid rgba(71, 85, 105, 0.5)', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Deschis Zilnic 09:00 - 23:00 • Free Wi-Fi: QROMS_Guest
        </footer>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default KioskMenuBoardPage;
