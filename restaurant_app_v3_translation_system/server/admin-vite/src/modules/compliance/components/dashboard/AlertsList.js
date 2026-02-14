"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsList = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var AlertsList = function (_a) {
    var alerts = _a.alerts, onAlertClick = _a.onAlertClick;
    //   const { t } = useTranslation();
    if (!alerts || alerts.length === 0) {
        return (<div className="p-6 text-center text-gray-500">
        <i className="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
        <p>"nicio alerta activa"</p>
      </div>);
    }
    var getStatusIcon = function (status) {
        switch (status) {
            case 'critical':
                return 'fas fa-times-circle text-red-600';
            case 'warning':
                return 'fas fa-exclamation-triangle text-yellow-600';
            default:
                return 'fas fa-info-circle text-blue-600';
        }
    };
    var getStatusBg = function (status) {
        switch (status) {
            case 'critical':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };
    return (<div className="space-y-3">
      {alerts.map(function (alert) { return (<div key={alert.id} className={"p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ".concat(getStatusBg(alert.status))} onClick={function () { return onAlertClick === null || onAlertClick === void 0 ? void 0 : onAlertClick(alert); }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <i className={getStatusIcon(alert.status)}></i>
                <span className="font-semibold">{alert.ccp_number || "CCP-".concat(alert.ccp_id)}</span>
                <span className="text-sm opacity-75">- {alert.parameter_name}</span>
              </div>
              <p className="text-sm opacity-75 mb-1">
                {alert.process_name || 'Proces necunoscut'}
              </p>
              <p className="text-lg font-bold">
                {alert.measured_value} {alert.unit}
              </p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(alert.monitored_at).toLocaleString('ro-RO')}
              </p>
            </div>
            <div className="ml-4">
              <span className={"px-3 py-1 rounded-full text-xs font-semibold ".concat(alert.status === 'critical' ? 'bg-red-200 text-red-800' :
                alert.status === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800')}>
                {alert.status === 'critical' ? 'CRITIC' : alert.status === 'warning' ? 'ATENȚIE' : 'OK'}
              </span>
            </div>
          </div>
          {alert.notes && (<div className="mt-2 pt-2 border-t border-gray-300">
              <p className="text-sm opacity-75">{alert.notes}</p>
            </div>)}
        </div>); })}
    </div>);
};
exports.AlertsList = AlertsList;
