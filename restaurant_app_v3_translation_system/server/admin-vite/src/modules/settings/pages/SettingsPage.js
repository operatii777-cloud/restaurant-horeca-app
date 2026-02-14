"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var RestaurantConfigPage_1 = require("./RestaurantConfigPage");
var TablesPage_1 = require("./TablesPage"); // FIXED: era TablesConfigPage (nu există)
var KioskUsersPage_1 = require("./KioskUsersPage");
var KioskLoginHistoryPage_1 = require("./KioskLoginHistoryPage");
var MFAPage_1 = require("./MFAPage");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("./SettingsPage.css");
var SettingsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)("Restaurant"), activeTab = _a[0], setActiveTab = _a[1];
    var tabs = [
        { id: "Restaurant", label: 'Configurare Restaurant', icon: '🏢' },
        { id: 'tables', label: 'Configurare Mese', icon: '🪑' },
        { id: 'kiosk-users', label: 'Utilizatori KIOSK', icon: '🖥️', badge: 'nou' },
        { id: 'kiosk-login-history', label: 'Istoric Login KIOSK', icon: '📋' },
        { id: 'mfa', label: 'Autentificare Multi-Factor', icon: '🔐' },
    ];
    return (<div className="settings-page">
      <PageHeader_1.PageHeader title="Setări" subtitle="configurare restaurant mese si parametri fiscali"/>

      <div className="settings-page__tabs">
        {tabs.map(function (tab) { return (<button key={tab.id} className={"settings-page__tab ".concat(activeTab === tab.id ? 'settings-page__tab--active' : '')} onClick={function () { return setActiveTab(tab.id); }}>
            <span className="settings-page__tab-icon">{tab.icon}</span>
            <span className="settings-page__tab-label">{tab.label}</span>
          </button>); })}
      </div>

      <div className="settings-page__content">
        {activeTab === "Restaurant" && <RestaurantConfigPage_1.RestaurantConfigPage />}
        {activeTab === 'tables' && <TablesPage_1.TablesPage />}
        {activeTab === 'kiosk-users' && <KioskUsersPage_1.KioskUsersPage />}
        {activeTab === 'kiosk-login-history' && <KioskLoginHistoryPage_1.KioskLoginHistoryPage />}
        {activeTab === 'mfa' && <MFAPage_1.MFAPage />}
      </div>
    </div>);
};
exports.SettingsPage = SettingsPage;
