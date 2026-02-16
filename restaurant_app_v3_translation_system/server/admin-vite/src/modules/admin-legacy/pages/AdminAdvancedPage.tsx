import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  Package,
  Clock,
  Target,
  Users,
  FileText,
  AlertTriangle,
  PieChart,
  Calendar,
  Truck,
  Clipboard,
  Receipt,
  Settings,
  MessageSquare,
  Activity
} from 'lucide-react';

interface AdvancedMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  route?: string;
  category: 'analytics' | 'operations' | 'reports' | 'fiscal';
}

export const AdminAdvancedPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const advancedMenuItems: AdvancedMenuItem[] = [
    // Analytics
    {
      id: 'executive-dashboard',
      label: 'Dashboard Executiv',
      icon: <BarChart3 className="w-6 h-6" />,
      description: 'Metrici cheie și KPI-uri',
      route: '/stocks/dashboard/executive',
      category: 'analytics'
    },
    {
      id: 'revenue-analytics',
      label: 'Analiză Venituri',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Grafice și trend-uri venituri',
      route: '/reports/advanced',
      category: 'analytics'
    },
    {
      id: 'stock-prediction',
      label: 'Predicție Stocuri',
      icon: <Package className="w-6 h-6" />,
      description: 'Predicții consumuri viitoare',
      route: '/reports/stock-prediction',
      category: 'analytics'
    },
    {
      id: 'abc-analysis',
      label: 'Analiză ABC',
      icon: <PieChart className="w-6 h-6" />,
      description: 'Categorizare produse după vânzări',
      route: '/reports/abc-analysis',
      category: 'analytics'
    },
    {
      id: 'profitability',
      label: 'Raport Profitabilitate',
      icon: <Target className="w-6 h-6" />,
      description: 'Analiză marje și costuri',
      route: '/profitability',
      category: 'analytics'
    },
    {
      id: 'variance-reporting',
      label: 'Raport Varianță',
      icon: <Activity className="w-6 h-6" />,
      description: 'Analiză varianță stocuri',
      route: '/variance-reports',
      category: 'analytics'
    },
    {
      id: 'risk-alerts',
      label: 'Alerte Risc',
      icon: <AlertTriangle className="w-6 h-6" />,
      description: 'Corelație stocuri-anulări',
      route: '/stocks/risk-alerts',
      category: 'analytics'
    },
    
    // Operations
    {
      id: 'nir-management',
      label: 'Gestiune NIR',
      icon: <FileText className="w-6 h-6" />,
      description: 'Note de intrare recepție',
      route: '/tipizate-enterprise/nir',
      category: 'operations'
    },
    {
      id: 'transfers',
      label: 'Transferuri',
      icon: <Truck className="w-6 h-6" />,
      description: 'Transfer între locații',
      route: '/tipizate-enterprise/transfer',
      category: 'operations'
    },
    {
      id: 'multi-inventory',
      label: 'Inventar Multi-Locație',
      icon: <Clipboard className="w-6 h-6" />,
      description: 'Sesiuni inventar fizic',
      route: '/stocks/inventory/multi',
      category: 'operations'
    },
    {
      id: 'portion-control',
      label: 'Control Porții',
      icon: <Target className="w-6 h-6" />,
      description: 'Standarde și conformitate porții',
      route: '/portions',
      category: 'operations'
    },
    {
      id: 'happy-hour',
      label: 'Happy Hour',
      icon: <Clock className="w-6 h-6" />,
      description: 'Configurare promoții temporale',
      route: '/promotions/happy-hour',
      category: 'operations'
    },
    {
      id: 'marketing',
      label: 'Campanii Marketing',
      icon: <Users className="w-6 h-6" />,
      description: 'Gestionare campanii și promoții',
      route: '/marketing',
      category: 'operations'
    },
    {
      id: 'queue-monitor',
      label: 'Monitor Coadă',
      icon: <Activity className="w-6 h-6" />,
      description: 'Monitorizare comenzi în timp real',
      route: '/queue-monitor',
      category: 'operations'
    },
    {
      id: 'restaurant-config',
      label: 'Configurare Restaurant',
      icon: <Settings className="w-6 h-6" />,
      description: 'Date fiscale și setări restaurant',
      route: '/settings/restaurant-config',
      category: 'operations'
    },
    {
      id: 'feedback',
      label: 'Feedback Clienți',
      icon: <MessageSquare className="w-6 h-6" />,
      description: 'Recenzii și evaluări',
      route: '/marketing/feedback',
      category: 'operations'
    },

    // Fiscal
    {
      id: 'fiscal-overview',
      label: 'Modul Fiscal',
      icon: <Receipt className="w-6 h-6" />,
      description: 'Documente fiscale și ANAF',
      route: '/stocks/fiscal',
      category: 'fiscal'
    },
    
    // Reports
    {
      id: 'sales-detailed',
      label: 'Raport Vânzări Detaliat',
      icon: <FileText className="w-6 h-6" />,
      description: 'Export CSV/PDF vânzări',
      route: '/reports/sales',
      category: 'reports'
    },
    {
      id: 'customer-behavior',
      label: 'Comportament Clienți',
      icon: <Users className="w-6 h-6" />,
      description: 'Analiză patternuri consumatori',
      route: '/reports/advanced',
      category: 'reports'
    },
    {
      id: 'time-trends',
      label: 'Trend-uri Temporale',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Analiză zilnică/săptămânală',
      route: '/reports/advanced',
      category: 'reports'
    },
    {
      id: 'profit-loss',
      label: 'Profit & Loss',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Raport financiar complet',
      route: '/reports/profit-loss',
      category: 'reports'
    }
  ];

  const categories = [
    { id: 'all', label: 'Toate', color: 'purple' },
    { id: 'analytics', label: 'Analize', color: 'blue' },
    { id: 'operations', label: 'Operațiuni', color: 'green' },
    { id: 'fiscal', label: 'Fiscal', color: 'red' },
    { id: 'reports', label: 'Rapoarte', color: 'orange' }
  ];

  const filteredItems = activeCategory === 'all' 
    ? advancedMenuItems 
    : advancedMenuItems.filter(item => item.category === activeCategory);

  const handleCardClick = (item: AdvancedMenuItem) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Avansat - Analize și Rapoarte
          </h1>
          <p className="mt-2 text-gray-600">
            Instrumente avansate pentru analiză și optimizare business
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-300 group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                    <div className="text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.category === 'analytics' ? 'bg-blue-100 text-blue-700' :
                      item.category === 'operations' ? 'bg-green-100 text-green-700' :
                      item.category === 'fiscal' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {item.category === 'analytics' ? 'Analiză' :
                       item.category === 'operations' ? 'Operațiuni' :
                       item.category === 'fiscal' ? 'Fiscal' :
                       'Raport'}
                    </span>
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
