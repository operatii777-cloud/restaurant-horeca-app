"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPICard = void 0;
var react_1 = require("react");
var KPICard = function (_a) {
    var title = _a.title, value = _a.value, icon = _a.icon, _b = _a.status, status = _b === void 0 ? 'info' : _b;
    var getStatusColors = function () {
        switch (status) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'critical':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };
    var getIconColor = function () {
        switch (status) {
            case 'success':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };
    return (<div className={"p-6 rounded-lg border-2 ".concat(getStatusColors())}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={"text-4xl ".concat(getIconColor())}>
          <i className={icon}></i>
        </div>
      </div>
    </div>);
};
exports.KPICard = KPICard;
