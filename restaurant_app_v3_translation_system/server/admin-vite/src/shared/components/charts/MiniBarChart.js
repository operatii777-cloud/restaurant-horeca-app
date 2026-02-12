"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniBarChart = MiniBarChart;
// import { useTranslation } from '@/i18n/I18nContext';
var recharts_1 = require("recharts");
var tooltipStyles = {
    borderRadius: 12,
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: '#0f172a',
    color: '#f8fafc',
    padding: '8px 10px',
    fontSize: '0.75rem',
};
var defaultTooltipFormatter = function (value) { return ["".concat(value.toFixed(2)), 'RON']; };
// Custom label pentru a afișa valorile pe bare
var renderCustomLabel = function (valueFormat) { return function (props) {
    //   const { t } = useTranslation();
    var x = props.x, y = props.y, width = props.width, value = props.value;
    if (!value || value === 0)
        return null;
    var formattedValue = valueFormat ? valueFormat(value) : value.toFixed(0);
    return (<text x={x + width / 2} y={y - 6} fill="#0f172a" textAnchor="middle" fontSize="10" fontWeight="600">
      {formattedValue}
    </text>);
}; };
function MiniBarChart(_a) {
    var data = _a.data, _b = _a.color, color = _b === void 0 ? '#2563eb' : _b, tooltipFormatter = _a.tooltipFormatter, _c = _a.showLabels, showLabels = _c === void 0 ? true : _c, valueFormat = _a.valueFormat;
    //   const { t } = useTranslation();
    return (<recharts_1.ResponsiveContainer width="100%" height={110}>
      <recharts_1.BarChart data={data} barCategoryGap={12} margin={{ top: 20, right: 8, left: 8, bottom: 50 }}>
        <recharts_1.XAxis dataKey="label" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10, fill: '#64748b' }} interval={0}/>
        <recharts_1.Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.12)' }} contentStyle={tooltipStyles} formatter={function (value) {
            return tooltipFormatter ? tooltipFormatter(value) : defaultTooltipFormatter(value);
        }} labelStyle={{ color: '#94a3b8' }}/>
        <recharts_1.Bar dataKey="value" radius={[4, 4, 0, 0]} fill={color} maxBarSize={20}>
          {showLabels && <recharts_1.LabelList dataKey="value" content={renderCustomLabel(valueFormat)}/>}
        </recharts_1.Bar>
      </recharts_1.BarChart>
    </recharts_1.ResponsiveContainer>);
}
