"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringStatusBadge = void 0;
var react_1 = require("react");
var MonitoringStatusBadge = function (_a) {
    var status = _a.status, _b = _a.size, size = _b === void 0 ? 'md' : _b;
    var getStatusConfig = function () {
        switch (status) {
            case 'ok':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    border: 'border-green-300',
                    icon: 'fas fa-check-circle',
                    label: 'OK'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    border: 'border-yellow-300',
                    icon: 'fas fa-exclamation-triangle',
                    label: 'ATENȚIE'
                };
            case 'critical':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    border: 'border-red-300',
                    icon: 'fas fa-times-circle',
                    label: 'CRITIC'
                };
        }
    };
    var getSizeClasses = function () {
        switch (size) {
            case 'sm':
                return 'px-2 py-1 text-xs';
            case 'lg':
                return 'px-4 py-2 text-base';
            default:
                return 'px-3 py-1.5 text-sm';
        }
    };
    var config = getStatusConfig();
    var sizeClasses = getSizeClasses();
    return (<span className={"inline-flex items-center gap-1.5 rounded-full font-semibold border ".concat(config.bg, " ").concat(config.text, " ").concat(config.border, " ").concat(sizeClasses)}>
      <i className={config.icon}></i>
      <span>{config.label}</span>
    </span>);
};
exports.MonitoringStatusBadge = MonitoringStatusBadge;
