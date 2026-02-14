"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HACCPMonitoringPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var QuickMonitoringForm_1 = require("../components/monitoring/QuickMonitoringForm");
var MonitoringHistoryTable_1 = require("../components/monitoring/MonitoringHistoryTable");
var HACCPMonitoringPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)(0), refreshTrigger = _a[0], setRefreshTrigger = _a[1];
    (0, react_1.useEffect)(function () {
        // Listen for monitoring records to refresh table
        var handleMonitoringRecorded = function () {
            setRefreshTrigger(function (prev) { return prev + 1; });
        };
        window.addEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
        return function () {
            window.removeEventListener('haccp-monitoring-recorded', handleMonitoringRecorded);
        };
    }, []);
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Monitorizare HACCP</h1>
        <p className="text-gray-600 mt-1">înregistrare și vizualizare monitorizări HACCP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Monitoring Form */}
        <div>
          <QuickMonitoringForm_1.QuickMonitoringForm />
        </div>

        {/* Monitoring History Table */}
        <div>
          <MonitoringHistoryTable_1.MonitoringHistoryTable refreshTrigger={refreshTrigger}/>
        </div>
      </div>

      {/* Mobile: Stack vertically */}
      <style>{"\n        @media (max-width: 1024px) {\n          .grid.lg\\:grid-cols-2 {\n            grid-template-columns: 1fr;\n          }\n        }\n      "}</style>
    </div>);
};
exports.HACCPMonitoringPage = HACCPMonitoringPage;
