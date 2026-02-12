import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/I18nContext';
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
  labelKey: string;
  icon: React.ReactNode;
  descriptionKey: string;
  route?: string;
}

export const AdminMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      labelKey: 'adminMain.dashboard.title',
      icon: <LayoutDashboard className="w-6 h-6" />,
      descriptionKey: 'adminMain.dashboard.description',
      route: '/dashboard'
    },
    {
      id: 'catalog',
      labelKey: 'adminMain.catalog.title',
      icon: <ShoppingCart className="w-6 h-6" />,
      descriptionKey: 'adminMain.catalog.description',
      route: '/catalog'
    },
    {
      id: 'menu',
      labelKey: 'adminMain.menu.title',
      icon: <Package className="w-6 h-6" />,
      descriptionKey: 'adminMain.menu.description',
      route: '/menu'
    },
    {
      id: 'waiters',
      labelKey: 'adminMain.waiters.title',
      icon: <Users className="w-6 h-6" />,
      descriptionKey: 'adminMain.waiters.description',
      route: '/waiters'
    },
    {
      id: 'orders',
      labelKey: 'adminMain.orders.title',
      icon: <ShoppingCart className="w-6 h-6" />,
      descriptionKey: 'adminMain.orders.description',
      route: '/orders/manage'
    },
    {
      id: 'reservations',
      labelKey: 'adminMain.reservations.title',
      icon: <Calendar className="w-6 h-6" />,
      descriptionKey: 'adminMain.reservations.description',
      route: '/reservations'
    },
    {
      id: 'stocks',
      labelKey: 'adminMain.stocks.title',
      icon: <Package className="w-6 h-6" />,
      descriptionKey: 'adminMain.stocks.description',
      route: '/stocks'
    },
    {
      id: 'analytics',
      labelKey: 'adminMain.analytics.title',
      icon: <TrendingUp className="w-6 h-6" />,
      descriptionKey: 'adminMain.analytics.description',
      route: '/reports'
    },
    {
      id: 'daily-offer',
      labelKey: 'adminMain.dailyOffers.title',
      icon: <Gift className="w-6 h-6" />,
      descriptionKey: 'adminMain.dailyOffers.description',
      route: '/promotions/daily-offer'
    },
    {
      id: 'messages',
      labelKey: 'adminMain.messages.title',
      icon: <MessageSquare className="w-6 h-6" />,
      descriptionKey: 'adminMain.messages.description',
      route: '/internal-messaging'
    },
    {
      id: 'settings',
      labelKey: 'adminMain.settings.title',
      icon: <Settings className="w-6 h-6" />,
      descriptionKey: 'adminMain.settings.description',
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
            {t('adminMain.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('adminMain.subtitle')}
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
                  {t(item.labelKey)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(item.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
