import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Calendar,
  Settings,
  TrendingUp,
  Gift,
  MessageSquare
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  route?: string;
}

export const AdminMainPage: React.FC = () => {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-6 h-6" />,
      description: 'Vizualizare generală și statistici',
      route: '/dashboard'
    },
    {
      id: 'catalog',
      label: 'Catalog Produse',
      icon: <ShoppingCart className="w-6 h-6" />,
      description: 'Gestionare produse și categorii',
      route: '/catalog'
    },
    {
      id: 'menu',
      label: 'Management Meniu',
      icon: <Package className="w-6 h-6" />,
      description: 'Configurare meniu restaurant',
      route: '/menu'
    },
    {
      id: 'waiters',
      label: 'Ospătari',
      icon: <Users className="w-6 h-6" />,
      description: 'Gestionare personal',
      route: '/waiters'
    },
    {
      id: 'orders',
      label: 'Comenzi',
      icon: <ShoppingCart className="w-6 h-6" />,
      description: 'Vizualizare și gestionare comenzi',
      route: '/orders/manage'
    },
    {
      id: 'reservations',
      label: 'Rezervări',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Sistem de rezervări',
      route: '/reservations'
    },
    {
      id: 'stocks',
      label: 'Stocuri',
      icon: <Package className="w-6 h-6" />,
      description: 'Management stocuri și inventar',
      route: '/stocks'
    },
    {
      id: 'analytics',
      label: 'Analize',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Rapoarte și analize',
      route: '/reports'
    },
    {
      id: 'daily-offer',
      label: 'Oferta Zilei',
      icon: <Gift className="w-6 h-6" />,
      description: 'Configurare oferte speciale',
      route: '/promotions/daily-offer'
    },
    {
      id: 'messages',
      label: 'Mesaje',
      icon: <MessageSquare className="w-6 h-6" />,
      description: 'Mesaje și notificări',
      route: '/internal-messaging'
    },
    {
      id: 'settings',
      label: 'Setări',
      icon: <Settings className="w-6 h-6" />,
      description: 'Configurări sistem',
      route: '/settings'
    },
  ];

  const handleCardClick = (item: MenuItem) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Panou Administrare Restaurant
          </h1>
          <p className="mt-2 text-gray-600">
            Gestionare completă pentru restaurantul tău
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                    <div className="text-purple-600 group-hover:text-purple-700 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"
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
