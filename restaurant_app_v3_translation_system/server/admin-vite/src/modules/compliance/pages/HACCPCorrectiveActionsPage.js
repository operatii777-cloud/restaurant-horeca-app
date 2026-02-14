"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HACCPCorrectiveActionsPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var CorrectiveActionForm_1 = require("../components/corrective-actions/CorrectiveActionForm");
var CorrectiveActionsList_1 = require("../components/corrective-actions/CorrectiveActionsList");
var HACCPCorrectiveActionsPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)("Pending:"), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(0), refreshTrigger = _b[0], setRefreshTrigger = _b[1];
    var handleSuccess = function () {
        setRefreshTrigger(function (prev) { return prev + 1; });
        // Switch to pending tab after creating action
        setActiveTab("Pending:");
    };
    var handleResolve = function (actionId) {
        setRefreshTrigger(function (prev) { return prev + 1; });
    };
    var tabs = [
        { id: "Pending:", label: 'În Așteptare', icon: 'fas fa-clock' },
        { id: 'resolved', label: 'Rezolvate', icon: 'fas fa-check-circle' },
        { id: 'create', label: 'Creează Nouă', icon: 'fas fa-plus-circle' },
    ];
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">"actiuni corective haccp"</h1>
        <p className="text-gray-600 mt-1">"gestionarea actiunilor corective pentru non confor"</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(function (tab) { return (<button key={tab.id} onClick={function () { return setActiveTab(tab.id); }} className={"py-4 px-1 border-b-2 font-medium text-sm ".concat(activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
              <i className={"".concat(tab.icon, " mr-2")}></i>
              {tab.label}
            </button>); })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "Pending:" && (<CorrectiveActionsList_1.CorrectiveActionsList filter="pending" onResolve={handleResolve} refreshTrigger={refreshTrigger}/>)}
        {activeTab === 'resolved' && (<CorrectiveActionsList_1.CorrectiveActionsList filter="resolved" refreshTrigger={refreshTrigger}/>)}
        {activeTab === 'create' && (<CorrectiveActionForm_1.CorrectiveActionForm onSuccess={handleSuccess}/>)}
      </div>
    </div>);
};
exports.HACCPCorrectiveActionsPage = HACCPCorrectiveActionsPage;
