import { ResponsiveContainer, BarChart, Bar, Tooltip, LabelList, XAxis } from 'recharts';

export type MiniBarChartDatum = {
  label: string;
  value: number;
};

type MiniBarChartProps = {
  data: MiniBarChartDatum[];
  color?: string;
  tooltipFormatter?: (value: number) => [string, string];
  showLabels?: boolean;
  valueFormat?: (value: number) => string;
};

const tooltipStyles: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(148, 163, 184, 0.3)',
  background: '#0f172a',
  color: '#f8fafc',
  padding: '8px 10px',
  fontSize: '0.75rem',
};

const defaultTooltipFormatter = (value: number): [string, string] => [`${value.toFixed(2)}`, 'RON'];

// Custom label pentru a afișa valorile pe bare
const renderCustomLabel = (valueFormat?: (value: number) => string) => (props: any) => {
  const { x, y, width, value } = props;
  if (!value || value === 0) return null;
  const formattedValue = valueFormat ? valueFormat(value) : value.toFixed(0);
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#0f172a"
      textAnchor="middle"
      fontSize="10"
      fontWeight="600"
    >
      {formattedValue}
    </text>
  );
};

export function MiniBarChart({
  data,
  color = '#2563eb',
  tooltipFormatter,
  showLabels = true,
  valueFormat,
}: MiniBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={data} barCategoryGap={12} margin={{ top: 20, right: 8, left: 8, bottom: 50 }}>
        <XAxis
          dataKey="label"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 10, fill: '#64748b' }}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: 'rgba(37, 99, 235, 0.12)' }}
          contentStyle={tooltipStyles}
          formatter={(value: number) =>
            tooltipFormatter ? tooltipFormatter(value) : defaultTooltipFormatter(value)
          }
          labelStyle={{ color: '#94a3b8' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={color} maxBarSize={20}>
          {showLabels && <LabelList dataKey="value" content={renderCustomLabel(valueFormat)} />}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
