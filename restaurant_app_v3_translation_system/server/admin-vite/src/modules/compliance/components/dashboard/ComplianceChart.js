"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceChart = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var recharts_1 = require("recharts");
var ComplianceChart = function (_a) {
    var data = _a.data;
    //   const { t } = useTranslation();
    if (!data || data.length === 0) {
        return (<div className="p-8 text-center text-gray-500">
        <i className="fas fa-chart-line text-4xl mb-3 opacity-50"></i>
        <p>"nu exista date pentru afisare"</p>
      </div>);
    }
    var formattedData = data.map(function (point) { return (__assign(__assign({}, point), { date: new Date(point.date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }) })); });
    return (<div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Evoluția Conformității (Ultimele 7 zile)</h3>
      <recharts_1.ResponsiveContainer width="100%" height={300}>
        <recharts_1.LineChart data={formattedData}>
          <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
          <recharts_1.XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }}/>
          <recharts_1.YAxis stroke="#6b7280" domain={[0, 100]} style={{ fontSize: '12px' }} label={{ value: 'Conformitate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}/>
          <recharts_1.Tooltip formatter={function (value) { return ["".concat(value.toFixed(1), "%"), 'Conformitate']; }} labelStyle={{ color: '#374151' }} contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
        }}/>
          <recharts_1.Legend />
          <recharts_1.Line type="monotone" dataKey="complianceRate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Conformitate (%)"/>
        </recharts_1.LineChart>
      </recharts_1.ResponsiveContainer>
    </div>);
};
exports.ComplianceChart = ComplianceChart;
