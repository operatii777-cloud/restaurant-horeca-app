"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueStatusChart = QueueStatusChart;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var recharts_1 = require("recharts");
function QueueStatusChart(_a) {
    var ordersByStatus = _a.ordersByStatus;
    //   const { t } = useTranslation();
    var data = [
        {
            name: 'Pending',
            value: (ordersByStatus === null || ordersByStatus === void 0 ? void 0 : ordersByStatus.pending) || 0,
            color: '#6c757d',
        },
        {
            name: 'Processing',
            value: (ordersByStatus === null || ordersByStatus === void 0 ? void 0 : ordersByStatus.processing) || 0,
            color: '#ffc107',
        },
        {
            name: 'Completed',
            value: (ordersByStatus === null || ordersByStatus === void 0 ? void 0 : ordersByStatus.completed) || 0,
            color: '#28a745',
        },
        {
            name: 'Failed',
            value: (ordersByStatus === null || ordersByStatus === void 0 ? void 0 : ordersByStatus.failed) || 0,
            color: '#dc3545',
        },
    ];
    return (<div className="h-64">
      <recharts_1.ResponsiveContainer width="100%" height="100%">
        <recharts_1.BarChart data={data}>
          <recharts_1.CartesianGrid strokeDasharray="3 3"/>
          <recharts_1.XAxis dataKey="name"/>
          <recharts_1.YAxis allowDecimals={false}/>
          <recharts_1.Tooltip />
          <recharts_1.Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map(function (entry, index) { return (<recharts_1.Cell key={"cell-\"Index\""} fill={entry.color}/>); })}
          </recharts_1.Bar>
        </recharts_1.BarChart>
      </recharts_1.ResponsiveContainer>
    </div>);
}
