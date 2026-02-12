"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCPCard = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var CCPCard = function (_a) {
    var ccp = _a.ccp, onClick = _a.onClick;
    //   const { t } = useTranslation();
    var getHazardTypeLabel = function (type) {
        var labels = {
            biological: 'Biologic',
            chemical: 'Chimic',
            physical: 'Fizic'
        };
        return labels[type] || type;
    };
    var getHazardTypeColor = function (type) {
        var colors = {
            biological: 'bg-red-100 text-red-800 border-red-300',
            chemical: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            physical: 'bg-blue-100 text-blue-800 border-blue-300'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
    };
    return (<div className={"p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ".concat(onClick ? 'hover:border-blue-400' : '', " bg-white")} onClick={function () { return onClick === null || onClick === void 0 ? void 0 : onClick(ccp); }}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-base font-semibold text-gray-900">{ccp.ccp_number}</h4>
        <span className={"px-2 py-1 rounded text-xs font-semibold border ".concat(getHazardTypeColor(ccp.hazard_type))}>
          {getHazardTypeLabel(ccp.hazard_type)}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Hazard:</p>
        <p className="text-sm text-gray-600">{ccp.hazard_description}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">"masura de control"</p>
        <p className="text-sm text-gray-600">{ccp.control_measure}</p>
      </div>

      {onClick && (<div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-blue-600 hover:text-blue-800 text-sm">
            Vezi limite <i className="fas fa-arrow-right ml-1"></i>
          </span>
        </div>)}
    </div>);
};
exports.CCPCard = CCPCard;
