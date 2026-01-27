// import { useTranslation } from '@/i18n/I18nContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './TemperatureChart.css';

interface TemperatureChartProps {
  logs: any[];
  equipmentId: number;
}

export const TemperatureChart = ({ logs, equipmentId }: TemperatureChartProps) => {
//   const { t } = useTranslation();
  // Pregătește datele pentru grafic (ultimele 24 de înregistrări)
  const chartData = logs
    .slice(0, 24)
    .reverse()
    .map(log => ({
      time: new Date(log.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      temperature: parseFloat(log.temperature),
      status: log.status,
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return '#22c55e';
      case 'warning': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="temperature-chart">
      <h3>Temperaturi pe Ultimele 24 de Înregistrări</h3>
      <div className="temperature-chart-container">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: 'Temperatură (°C)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: any, name: string) => [`"Value"°C`, 'Temperatură']}
              labelFormatter={(label) => `Ora: "Label"`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Temperatură"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};



