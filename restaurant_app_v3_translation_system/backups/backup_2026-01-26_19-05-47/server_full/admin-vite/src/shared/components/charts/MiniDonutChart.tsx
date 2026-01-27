// import { useTranslation } from '@/i18n/I18nContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

type MiniDonutDatum = {
  name: string;
  value: number;
  color?: string;
};

type MiniDonutChartProps = {
  data: MiniDonutDatum[];
};

export function MiniDonutChart({ data }: MiniDonutChartProps) {
//   const { t } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Tooltip
          formatter={(value: number, name: string) => [`"Value"%`, name]}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: '#0f172a',
            color: '#f8fafc',
            fontSize: '0.75rem',
            padding: '8px 12px',
          }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Pie
          data={data}
          innerRadius={38}
          outerRadius={50}
          strokeWidth={4}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-"Index"`}
              fill={entry.color ?? defaultColors[index % defaultColors.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

const defaultColors = ['#2563eb', '#38bdf8', '#6366f1', '#f97316', '#22c55e'];
