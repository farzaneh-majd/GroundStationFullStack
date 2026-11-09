import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import {
  GRAFANA_LINE_COLORS,
  chartAxisTickStyle,
  chartGridProps,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "@/lib/chartTheme";

export type GrafanaChartSeries = {
  key: string;
  label?: string;
  unit?: string;
  color?: string;
};

type GrafanaLineChartProps<T extends Record<string, unknown>> = {
  data: T[];
  series: GrafanaChartSeries[];
  xKey?: string;
  height?: number;
  valueFormatter?: (value: number, seriesKey: string) => string;
  emptyTitle?: string;
  emptyMessage?: string;
};

export default function GrafanaLineChart<T extends Record<string, unknown>>({
  data,
  series,
  xKey = "label",
  height = 260,
  valueFormatter,
  emptyTitle = "No data yet",
  emptyMessage = "Nothing has been decoded or sampled in this window yet.",
}: GrafanaLineChartProps<T>) {
  if (data.length === 0 || series.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis
            dataKey={xKey}
            tick={chartAxisTickStyle}
            axisLine={{ stroke: "var(--gs-border)" }}
            tickLine={false}
          />
          <YAxis tick={chartAxisTickStyle} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={chartTooltipLabelStyle}
            formatter={
              valueFormatter
                ? (value, name) => [valueFormatter(Number(value), String(name)), name]
                : undefined
            }
            cursor={{ stroke: "var(--gs-border)", strokeWidth: 1 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "var(--gs-muted)" }}
            iconType="plainline"
            iconSize={10}
          />
          {series.map((item, index) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label ?? item.key}
              dot={false}
              activeDot={{ r: 3 }}
              stroke={item.color ?? GRAFANA_LINE_COLORS[index % GRAFANA_LINE_COLORS.length]}
              strokeWidth={1.75}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
