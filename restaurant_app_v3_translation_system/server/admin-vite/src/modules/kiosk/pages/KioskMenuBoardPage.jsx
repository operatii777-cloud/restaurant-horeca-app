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
      // API-ul returnează produsele în data.data sau data.products sau data.menu
      const products = menuRes.data?.data || menuRes.data?.products || menuRes.data?.menu || [];
      if (products && products.length > 0) {
        const activeItems = products
          .filter(p => p.is_active !== false && p.is_sellable !== false)
          .map(p => {
            // Asigură-te că name este setat corect (nu description)
            // Dacă name este gol sau pare a fi description (prea lung, conține virgule), folosește name_en
            let productName = p.name || p.name_en || 'Produs fără nume';
            
            // Detectează dacă name este de fapt description (heuristica)
            // Descrierile sunt de obicei mai lungi de 50 caractere sau conțin virgule/liste de ingrediente
            const nameLength = productName.length;
            const hasCommas = productName.includes(',');
            const hasIngredients = productName.includes('cu') || productName.includes('și') || productName.includes('servit');
            const looksLikeDescription = nameLength > 50 || (hasCommas && nameLength > 30) || (hasIngredients && nameLength > 40);
            
            // Dacă name pare a fi description și există name_en, folosește name_en
            if (looksLikeDescription && p.name_en && p.name_en.trim() !== '') {
              productName = p.name_en;
              console.log(`⚠️ Menu Board: Product ID ${p.id} - name looks like description, using name_en: "${p.name_en}"`);
            }
            
            // Construiește URL-ul corect pentru imagine
            let imageUrl = p.image_url || p.image || null;
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
              imageUrl = `/images/menu/${imageUrl}`;
            }
            
            return {
              ...p,
              name: productName, // Nume corect (nu description)
              description: p.description && p.description !== productName ? p.description : null, // Descriere separată
              image_url: imageUrl, // URL corect pentru imagine
            };
          });
        
        console.log('📦 Menu Board - Loaded products:', activeItems.length);
        if (activeItems.length > 0) {
          console.log('📦 Sample product:', {
            id: activeItems[0].id,
            name: activeItems[0].name,
            name_en: activeItems[0].name_en,
            description: activeItems[0].description,
            image_url: activeItems[0].image_url,
            price: activeItems[0].price
          });
        }
        
        setMenuItems(activeItems);
        const cats = [...new Set(activeItems.map(p => p.category || p.category_name || 'Altele'))];
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
                  {(() => {
                    const imageUrl = item.image_url || item.image;
                    if (imageUrl) {
                      // Construiește URL-ul corect pentru imagine
                      let finalImageUrl = imageUrl;
                      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
                        // Dacă este doar numele fișierului, adaugă path-ul complet
                        finalImageUrl = `/images/menu/${imageUrl}`;
                      } else if (imageUrl.startsWith('/')) {
                        // Dacă începe cu /, este deja un path relativ
                        finalImageUrl = imageUrl;
                      }
                      
                      return (
                        <img 
                          src={finalImageUrl} 
                          alt={item.name || item.name_en || 'Produs'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => { 
                            // Dacă imaginea nu se încarcă, afișează placeholder
                            e.target.style.display = 'none';
                            const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                            if (placeholder) placeholder.style.display = 'flex';
                          }} 
                        />
                      );
                    }
                    return null;
                  })()}
                  {/* Placeholder pentru când nu există imagine sau când imaginea eșuează */}
                  <div className="image-placeholder" style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: (!item.image_url && !item.image) ? 'flex' : 'none',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '48px', 
                    opacity: 0.3,
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}>
                    🍽️
                  </div>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Nume produs - IMPORTANT: folosește name, nu description */}
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', lineHeight: 1.3, minHeight: '54px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.name || item.name_en || 'Produs fără nume'}
                    </h3>
                    {/* Descriere - doar dacă există și este diferită de nume */}
                    {item.description && item.description !== item.name && item.description !== item.name_en && (
                      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '4px' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(71, 85, 105, 0.5)' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '24px' }}>
                      {typeof item.price === 'number' ? item.price.toFixed(2) : item.price || '0.00'}
                      <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '4px' }}>RON</span>
                    </div>
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
