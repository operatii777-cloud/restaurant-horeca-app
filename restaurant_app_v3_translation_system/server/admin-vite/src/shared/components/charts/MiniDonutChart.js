"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniDonutChart = MiniDonutChart;
// import { useTranslation } from '@/i18n/I18nContext';
var recharts_1 = require("recharts");
function MiniDonutChart(_a) {
    var data = _a.data;
    //   const { t } = useTranslation();
    return (<recharts_1.ResponsiveContainer width="100%" height={120}>
      <recharts_1.PieChart>
        <recharts_1.Tooltip formatter={function (value, name) { return ["\"Value\"%", name]; }} contentStyle={{
            borderRadius: 12,
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: '#0f172a',
            color: '#f8fafc',
            fontSize: '0.75rem',
            padding: '8px 12px',
        }} labelStyle={{ color: '#94a3b8' }}/>
        <recharts_1.Pie data={data} innerRadius={38} outerRadius={50} strokeWidth={4} paddingAngle={3} dataKey="value">
          {data.map(function (entry, index) {
            var _a;
            return (<recharts_1.Cell key={"cell-".concat(entry.name, "-\"Index\"")} fill={(_a = entry.color) !== null && _a !== void 0 ? _a : defaultColors[index % defaultColors.length]}/>);
        })}
        </recharts_1.Pie>
      </recharts_1.PieChart>
    </recharts_1.ResponsiveContainer>);
}
var defaultColors = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e'];
