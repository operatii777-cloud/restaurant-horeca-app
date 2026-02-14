"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureChart = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var recharts_1 = require("recharts");
require("./TemperatureChart.css");
var TemperatureChart = function (_a) {
    var logs = _a.logs, equipmentId = _a.equipmentId;
    //   const { t } = useTranslation();
    // Pregătește datele pentru grafic (ultimele 24 de înregistrări)
    var chartData = logs
        .slice(0, 24)
        .reverse()
        .map(function (log) { return ({
        time: new Date(log.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        temperature: parseFloat(log.temperature),
        status: log.status,
    }); });
    var getStatusColor = function (status) {
        switch (status) {
            case 'ok': return '#22c55e';
            case 'warning': return '#f97316';
            case 'critical': return '#ef4444';
            default: return '#6b7280';
        }
    };
    return (<div className="temperature-chart">
      <h3>Temperaturi pe Ultimele 24 de Înregistrări</h3>
      <div className="temperature-chart-container">
        <recharts_1.ResponsiveContainer>
          <recharts_1.LineChart data={chartData}>
            <recharts_1.CartesianGrid strokeDasharray="3 3"/>
            <recharts_1.XAxis dataKey="time"/>
            <recharts_1.YAxis label={{ value: 'Temperatură (°C)', angle: -90, position: 'insideLeft' }}/>
            <recharts_1.Tooltip formatter={function (value, name) { return ["\"Value\"\u00B0C", 'Temperatură']; }} labelFormatter={function (label) { return "Ora: \"Label\""; }}/>
            <recharts_1.Legend />
            <recharts_1.Line type="monotone" dataKey="temperature" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Temperatură"/>
          </recharts_1.LineChart>
        </recharts_1.ResponsiveContainer>
      </div>
    </div>);
};
exports.TemperatureChart = TemperatureChart;
