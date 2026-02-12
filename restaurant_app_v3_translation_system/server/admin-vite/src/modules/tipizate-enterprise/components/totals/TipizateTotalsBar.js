"use strict";
/**
 * PHASE S5.3 - Tipizate Totals Bar
 * Generic totals display component for all tipizate documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipizateTotalsBar = void 0;
var react_1 = require("react");
var tipizate_config_1 = require("../../config/tipizate.config");
var TipizateTotalsBar = function (_a) {
    var type = _a.type, totals = _a.totals;
    var fields = (0, tipizate_config_1.totalsFor)(type);
    var documentName = (0, tipizate_config_1.nameFor)(type);
    if (!totals) {
        return null;
    }
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value || 0);
    };
    var formatNumber = function (value) {
        return new Intl.NumberFormat('ro-RO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value || 0);
    };
    return (<div className="flex flex-wrap gap-8 p-6 mt-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {fields.map(function (field) {
            var value = totals[field] || 0;
            var isCurrency = field.toLowerCase().includes('total') ||
                field.toLowerCase().includes('amount') ||
                field.toLowerCase().includes('value') ||
                field.toLowerCase().includes('price') ||
                field.toLowerCase().includes('cost') ||
                field.toLowerCase().includes('income') ||
                field.toLowerCase().includes('expense') ||
                field.toLowerCase().includes('balance') ||
                field.toLowerCase().includes('sales') ||
                field.toLowerCase().includes('payment') ||
                field.toLowerCase().includes('vat');
            return (<div key={field} className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isCurrency ? formatCurrency(value) : formatNumber(value)}
            </span>
          </div>);
        })}
    </div>);
};
exports.TipizateTotalsBar = TipizateTotalsBar;
