import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, ChefHat, BarChart3, Settings,
  PackageOpen, Smartphone, CalendarDays,
  Truck, ScrollText, Layers, Tag, Bell,
  LogOut, Clock, Archive, Users, Landmark,
  Gift, ShoppingCart, Beer, PartyPopper,
  Monitor, Tv, ChevronDown, ChevronRight,
  RefreshCw, Check, Trophy, Megaphone, Bike,
  CalendarClock, Briefcase, Search, Shirt,
  FileText, ClipboardCheck, Globe, Book,
  GraduationCap, MessageSquare, ShieldAlert,
  Activity, ShieldCheck, MousePointerClick,
  Smile, ExternalLink, HelpCircle,
  PanelLeftClose, PanelLeftOpen, Menu,
  ArrowLeft
} from 'lucide-react';
import './KioskSidebar.css';

/**
 * Sidebar pentru KIOSK - adaptat din HorecaAI
 * Design: Dark theme (slate-900 + amber-600)
 * Branding: Restaurant App V3 + Powered by QrOMS
 * Feature: Auto-hide / Collapse functionality
 */
export const KioskSidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    'Operational': true,
    'Front Desk': true,
    'Gestiune': true,
    'Administrare': true,
    'Display': false,
  });

  // Persist collapsed state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('kiosk-sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kiosk-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    const handleSave = () => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 800);
    };
    window.addEventListener('db-change', handleSave);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      window.removeEventListener('db-change', handleSave);
    };
  }, []);

  const toggleGroup = (title) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleNavigation = (item) => {
    if (item.external) {
      if (item.id === 'driver-mode') {
        window.location.href = item.external;
      } else {
        window.open(item.external, '_blank');
      }
    } else if (item.path) {
      // Special handling for KDS and Bar - use absolute paths with /admin-vite/ prefix
      if (item.id === 'kds-kitchen' || item.id === 'kds-bar') {
        // Use absolute path to ensure it works in both Kiosk and Admin contexts
        window.location.href = '/admin-vite' + item.path;
      } else {
        navigate(item.path);
        // Auto-collapse on mobile after navigation
        if (window.innerWidth < 768) {
          setIsCollapsed(true);
        }
      }
    }
  };

  const menuGroups = [
    {
      title: "Operational",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/kiosk/dashboard' },
        { id: 'pos', label: 'POS Vanzare', icon: ShoppingCart, path: '/kiosk/pos-split' },
        { id: 'kds-kitchen', label: 'KDS Bucătărie', icon: ChefHat, path: '/kds' },
        { id: 'kds-bar', label: 'KDS Bar', icon: Beer, path: '/bar' },
        { id: 'scoreboard', label: 'Scoreboard Bucătărie', icon: Trophy, path: '/kiosk/scoreboard' },
        // { id: 'expeditor', label: 'Expediție (Pass)', icon: Megaphone, path: '/kiosk/expeditor' }, // HIDDEN: similar cu Monitor Clienți - de revizuit
        { id: 'pontaj', label: 'Pontaj (Time Clock)', icon: Clock, path: '/kiosk/pontaj' },
        { id: 'delivery-dispatch', label: 'Dispecerat Livrări', icon: Bike, path: '/dispatch' },
        { id: 'couriers-management', label: 'Gestiune Curieri', icon: Users, path: '/couriers' },
        { id: 'driver-mode', label: 'Mod Curier', icon: Bike, path: '/courier' },
        { id: 'staff-report', label: 'Raport Ospătari Live', icon: Trophy, path: '/kiosk/staff-live-report' },
      ]
    },
    {
      title: "Front Desk",
      items: [
        { id: 'reservations', label: 'Rezervări', icon: CalendarDays, path: '/reservations' },
        { id: 'hostess', label: 'Hostess Map', icon: CalendarClock, path: '/kiosk/hostess-map' },
        { id: 'coatcheck', label: 'Garderobă & Valet', icon: Briefcase, path: '/kiosk/coatcheck' },
        { id: 'lost-found', label: 'Lost & Found', icon: Search, path: '/kiosk/lost-found' },
        { id: 'events', label: 'Evenimente (BEO)', icon: PartyPopper, path: '/kiosk/events' },
        { id: 'client-monitor', label: 'Monitor Clienți', icon: Monitor, path: '/kiosk/client-monitor' },
      ]
    },
    {
      title: "Gestiune",
      items: [
        { id: 'catalog', label: 'Catalog Produse', icon: Layers, path: '/catalog' },
        { id: 'recipes', label: 'Rețetar & Fișe', icon: ScrollText, path: '/recipes' },
        { id: 'stocks', label: 'Stocuri', icon: PackageOpen, path: '/kiosk/stocks' },
        { id: 'nir', label: 'NIR', icon: FileText, external: '/admin-advanced.html#inventory?iframe=true' },
        { id: 'bon-consum', label: 'Bon Consum', icon: FileText, external: '/admin-advanced.html#inventory?iframe=true' },
        { id: 'inventar', label: 'Inventar', icon: FileText, external: '/admin-advanced.html#inventory?iframe=true' },
        { id: 'transfer', label: 'Transferuri', icon: FileText, external: '/admin-advanced.html#inventory?iframe=true' },
        { id: 'waste', label: 'Waste', icon: FileText, path: '/kiosk/tipizate-enterprise/waste' },
        { id: 'menu-pdf', label: 'Meniu PDF', icon: FileText, path: '/menu-pdf' },
        { id: 'laundry', label: 'Gestiune Textile', icon: Shirt, path: '/kiosk/laundry' },
        { id: 'suppliers', label: 'Furnizori', icon: Truck, path: '/stocks/suppliers' },
        { id: 'invoices', label: 'Facturare B2B', icon: FileText, path: '/invoices' },
        { id: 'compliance', label: 'HACCP & Igienizare', icon: ClipboardCheck, path: '/compliance' },
      ]
    },
    {
      title: "Administrare",
      items: [
        { id: 'hq-dashboard', label: 'HQ Dashboard', icon: Globe, path: '/kiosk/hq-dashboard' },
        { id: 'reports-x', label: 'Raport X', icon: BarChart3, path: '/stocks/fiscal/reports/x' },
        { id: 'reports-z', label: 'Raport Z', icon: BarChart3, path: '/stocks/fiscal/reports/z' },
        { id: 'financial', label: 'Financiar & P&L', icon: Landmark, path: '/reports/financial' },
        { id: 'gift-cards', label: 'Gift Cards', icon: Gift, path: '/marketing/gift-cards' },
        { id: 'shift-handover', label: 'Jurnal Tură', icon: Book, path: '/kiosk/shift-handover' },
        { id: 'archive', label: 'Arhivă', icon: Archive, path: '/archive' },
        { id: 'waiters', label: 'Ospătari', icon: Users, path: '/waiters' },
        { id: 'crm', label: 'Clienți / CRM', icon: Users, path: '/marketing/loyalty' },
        { id: 'marketing', label: 'Marketing & Promo', icon: Tag, path: '/marketing' },
        { id: 'performance', label: 'Performance', icon: Activity, path: '/monitoring/performance' },
        { id: 'training', label: 'Staff Academy', icon: GraduationCap, path: '/kiosk/training' },
        { id: 'settings', label: 'Setări & Staff', icon: Settings, path: '/settings' },
        { id: 'alerts', label: 'Centru Alerte', icon: Bell, path: '/audit/alerts' },
        { id: 'chat', label: 'Comunicare', icon: MessageSquare, path: '/internal-messaging' },
      ]
    },
    {
      title: "IT & Securitate",
      items: [
        { id: 'security', label: 'Loss Prevention', icon: ShieldAlert, path: '/audit/security' },
        { id: 'network', label: 'Network Health', icon: Activity, path: '/kiosk/network-health' },
        { id: 'audit', label: 'Audit Logs', icon: ShieldCheck, path: '/audit/logs' },
      ]
    },
    {
      title: "Display",
      items: [
        { id: 'kiosk-self', label: 'Self-Service Kiosk', icon: MousePointerClick, path: '/kiosk/self-service' },
        { id: 'feedback-terminal', label: 'Feedback Terminal', icon: Smile, path: '/kiosk/feedback-terminal' },
        { id: 'qr-ordering', label: 'Meniu QR (Mobile)', icon: Smartphone, path: '/kiosk/qr-ordering' },
        { id: 'cds', label: 'Display Client (CDS)', icon: Monitor, path: '/kiosk/customer-display' },
        { id: 'menu-tv', label: 'TV Meniu Digital', icon: Tv, path: '/kiosk/menu-board' },
        { id: 'widget', label: 'Widget Site', icon: ExternalLink, path: '/kiosk/widget' },
      ]
    },
    {
      title: "Suport",
      items: [
        { id: 'help', label: 'Manual Utilizare', icon: HelpCircle, path: '/docs' },
      ]
    }
  ];

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Determine if sidebar should show (expanded or hovered)
  const shouldShowFull = !isCollapsed || isHovered;

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        className={`kiosk-sidebar__toggle ${isCollapsed ? 'kiosk-sidebar__toggle--collapsed' : ''}`}
        onClick={toggleCollapse}
        title={isCollapsed ? 'Deschide meniul' : 'Ascunde meniul'}
      >
        {isCollapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
      </button>

      <div
        className={`kiosk-sidebar ${isCollapsed ? 'kiosk-sidebar--collapsed' : ''} ${isHovered && isCollapsed ? 'kiosk-sidebar--hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header cu branding */}
        <div className="kiosk-sidebar__header">
          {shouldShowFull ? (
            <div>
              <h1 className="kiosk-sidebar__title">
                Restaurant App V3
              </h1>
              <p className="kiosk-sidebar__subtitle">
                Powered by QrOMS
              </p>
            </div>
          ) : (
            <div className="kiosk-sidebar__mini-logo">
              RA
            </div>
          )}
        </div>

        {/* Navigare cu grupuri */}
        <nav className="kiosk-sidebar__nav">
          {menuGroups.map((group, idx) => {
            const isExpanded = expandedGroups[group.title];

            return (
              <div key={idx} className="kiosk-sidebar__group">
                {shouldShowFull ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="kiosk-sidebar__group-title"
                  >
                    {group.title}
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                ) : (
                  <div className="kiosk-sidebar__group-divider" />
                )}

                {(shouldShowFull ? isExpanded : true) && (
                  <div className="kiosk-sidebar__group-items">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item)}
                          className={`kiosk-sidebar__item ${active ? 'kiosk-sidebar__item--active' : ''}`}
                          title={!shouldShowFull ? item.label : undefined}
                        >
                          <Icon size={18} />
                          {shouldShowFull && (
                            <span className="kiosk-sidebar__item-label">{item.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer cu status + user */}
        <div className="kiosk-sidebar__footer">
          {shouldShowFull ? (
            <>
              <div className="kiosk-sidebar__status">
                <div className={`kiosk-sidebar__save-status kiosk-sidebar__save-status--${saveStatus}`}>
                  {saveStatus === 'saving' ? (
                    <RefreshCw size={14} className="kiosk-sidebar__save-icon--spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {saveStatus === 'saving' ? 'Se salvează...' : 'Sincronizat'}
                </div>
                {isOnline && <span className="kiosk-sidebar__version">v3.0.0</span>}
              </div>

              {/* Buton Admin - Navigare înapoi la Admin-Vite */}
              <button
                onClick={() => window.location.href = '/admin-vite/dashboard'}
                className="kiosk-sidebar__admin-btn"
                title="Înapoi la Admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: '12px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6366f1';
                }}
              >
                <ArrowLeft size={16} />
                <span>Admin</span>
              </button>

              <div className="kiosk-sidebar__user">
                <div className="kiosk-sidebar__user-info">
                  <div className="kiosk-sidebar__user-avatar">
                    {user?.name?.slice(0, 2)?.toUpperCase() || 'GU'}
                  </div>
                  <div className="kiosk-sidebar__user-details">
                    <p className="kiosk-sidebar__user-name">{user?.name || 'Guest'}</p>
                    <p className="kiosk-sidebar__user-role">{user?.role || 'Viewer'}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="kiosk-sidebar__logout"
                  title="Deconectare"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="kiosk-sidebar__footer-mini">
              {/* Buton Admin mini - doar icon */}
              <button
                onClick={() => window.location.href = '/admin-vite/dashboard'}
                className="kiosk-sidebar__admin-btn-mini"
                title="Înapoi la Admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  marginBottom: '8px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6366f1';
                }}
              >
                <ArrowLeft size={16} />
              </button>

              <div className="kiosk-sidebar__user-avatar kiosk-sidebar__user-avatar--mini">
                {user?.name?.slice(0, 2)?.toUpperCase() || 'GU'}
              </div>
              <button
                onClick={onLogout}
                className="kiosk-sidebar__logout kiosk-sidebar__logout--mini"
                title="Deconectare"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
