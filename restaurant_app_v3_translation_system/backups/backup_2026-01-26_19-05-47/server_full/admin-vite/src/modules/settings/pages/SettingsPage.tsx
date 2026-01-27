// import { useTranslation } from '@/i18n/I18nContext';
import { useState } from 'react';
import { RestaurantConfigPage } from './RestaurantConfigPage';
import { TablesPage } from './TablesPage'; // FIXED: era TablesConfigPage (nu există)
import { KioskUsersPage } from './KioskUsersPage';
import { KioskLoginHistoryPage } from './KioskLoginHistoryPage';
import { MFAPage } from './MFAPage';
import { PageHeader } from '@/shared/components/PageHeader';
import './SettingsPage.css';

type SettingsTab = "Restaurant" | 'tables' | 'kiosk-users' | 'kiosk-login-history' | 'mfa';

export const SettingsPage = () => {
//   const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("Restaurant");

  const tabs = [
    { id: "Restaurant" as SettingsTab, label: 'Configurare Restaurant', icon: '🏢' },
    { id: 'tables' as SettingsTab, label: 'Configurare Mese', icon: '🪑' },
    { id: 'kiosk-users' as SettingsTab, label: 'Utilizatori KIOSK', icon: '🖥️', badge: 'nou' },
    { id: 'kiosk-login-history' as SettingsTab, label: 'Istoric Login KIOSK', icon: '📋' },
    { id: 'mfa' as SettingsTab, label: 'Autentificare Multi-Factor', icon: '🔐' },
  ];

  return (
    <div className="settings-page">
      <PageHeader
        title="Setări"
        subtitle="configurare restaurant mese si parametri fiscali"
      />

      <div className="settings-page__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-page__tab ${activeTab === tab.id ? 'settings-page__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="settings-page__tab-icon">{tab.icon}</span>
            <span className="settings-page__tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-page__content">
        {activeTab === "Restaurant" && <RestaurantConfigPage />}
        {activeTab === 'tables' && <TablesPage />}
        {activeTab === 'kiosk-users' && <KioskUsersPage />}
        {activeTab === 'kiosk-login-history' && <KioskLoginHistoryPage />}
        {activeTab === 'mfa' && <MFAPage />}
      </div>
    </div>
  );
};



