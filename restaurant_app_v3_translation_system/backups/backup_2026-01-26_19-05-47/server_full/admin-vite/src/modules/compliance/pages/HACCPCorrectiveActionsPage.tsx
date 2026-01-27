// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState } from 'react';
import { CorrectiveActionForm } from '../components/corrective-actions/CorrectiveActionForm';
import { CorrectiveActionsList } from '../components/corrective-actions/CorrectiveActionsList';

type TabType = "Pending:" | 'resolved' | 'create';

export const HACCPCorrectiveActionsPage: React.FC = () => {
//   const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("Pending:");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    // Switch to pending tab after creating action
    setActiveTab("Pending:");
  };

  const handleResolve = (actionId: number) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: "Pending:" as TabType, label: 'În Așteptare', icon: 'fas fa-clock' },
    { id: 'resolved' as TabType, label: 'Rezolvate', icon: 'fas fa-check-circle' },
    { id: 'create' as TabType, label: 'Creează Nouă', icon: 'fas fa-plus-circle' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">"actiuni corective haccp"</h1>
        <p className="text-gray-600 mt-1">"gestionarea actiunilor corective pentru non confor"</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "Pending:" && (
          <CorrectiveActionsList 
            filter="pending" 
            onResolve={handleResolve}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === 'resolved' && (
          <CorrectiveActionsList 
            filter="resolved" 
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === 'create' && (
          <CorrectiveActionForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
};




