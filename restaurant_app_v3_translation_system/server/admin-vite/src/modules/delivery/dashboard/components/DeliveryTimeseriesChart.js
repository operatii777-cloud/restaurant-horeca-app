"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Delivery Timeseries Chart
 *
 * Line chart showing deliveries over time
 * Axes: X = dates, Y = deliveries count
 * Lines: delivered / in_transit / late deliveries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryTimeseriesChart = DeliveryTimeseriesChart;
var recharts_1 = require("recharts");
function DeliveryTimeseriesChart(_a) {
    var data = _a.data, loading = _a.loading;
    //   const { t } = useTranslation();
    if (loading) {
        return (<div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>);
    }
    if (!data || data.length === 0) {
        return (<div className="h-64 flex items-center justify-center text-gray-500">
        Nu există date pentru perioada selectată
      </div>);
    }
    // Format data for chart
    var chartData = data.map(function (item) { return ({
        date: new Date(item.day).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }),
        fullDate: item.day,
        livrate: item.totalDeliveries,
        medieMinute: Math.round(item.avgDeliveryMinutes),
        onTimeRate: (item.onTimeRate * 100).toFixed(1),
        cancelRate: (item.cancelRate * 100).toFixed(1),
    }); });
    return (<recharts_1.ResponsiveContainer width="100%" height={300}>
      <recharts_1.LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
        <recharts_1.XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }}/>
        <recharts_1.YAxis stroke="#666" style={{ fontSize: '12px' }} label={{ value: 'Livrări', angle: -90, position: 'insideLeft' }}/>
        <recharts_1.Tooltip contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px'
        }} formatter={function (value, name) {
            if (name === 'livrate') {
                return ["\"Value\" comenzi", 'Livrări'];
            }
            if (name === 'medieMinute') {
                return ["\"Value\" min", 'Medie Livrare'];
            }
            if (name === 'onTimeRate') {
                return ["\"Value\"%", '% La Timp'];
            }
            if (name === 'cancelRate') {
                return ["\"Value\"%", '% Anulate'];
            }
            return value;
        }}/>
        <recharts_1.Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line"/>
        <recharts_1.Line type="monotone" dataKey="livrate" stroke="#FF6B35" strokeWidth={2} name="Livrări" dot={{ r: 4 }} activeDot={{ r: 6 }}/>
        <recharts_1.Line type="monotone" dataKey="medieMinute" stroke="#4A90E2" strokeWidth={2} name="Medie (min)" dot={{ r: 4 }} activeDot={{ r: 6 }}/>
      </recharts_1.LineChart>
    </recharts_1.ResponsiveContainer>);
}
