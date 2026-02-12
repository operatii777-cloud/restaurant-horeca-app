"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCPLimitsTable = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var CCPLimitsTable = function (_a) {
    var limits = _a.limits;
    //   const { t } = useTranslation();
    if (!limits || limits.length === 0) {
        return (<div className="p-6 text-center text-gray-500">
        <i className="fas fa-inbox text-3xl mb-2 opacity-50"></i>
        <p>"nu exista limite definite pentru acest ccp"</p>
      </div>);
    }
    return (<div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parametru</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">"valoare minima"</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">"valoare maxima"</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">"valoare tinta"</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unitate</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">"frecventa monitorizare"</th>
          </tr>
        </thead>
        <tbody>
          {limits.map(function (limit) { return (<tr key={limit.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{limit.parameter_name}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{limit.min_value}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{limit.max_value}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {limit.target_value !== null && limit.target_value !== undefined ? limit.target_value : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{limit.unit}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {limit.monitoring_frequency}
                </span>
              </td>
            </tr>); })}
        </tbody>
      </table>
    </div>);
};
exports.CCPLimitsTable = CCPLimitsTable;
