"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

interface LineChartProps {
  data: Array<Record<string, number | string>>;
  lines: Array<{
    key: string;
    label: string;
    color: string;
    dashed?: boolean;
  }>;
  xKey?: string;
  height?: number;
  formatValue?: (v: number) => string;
  referenceLine?: { value: number; label: string; color?: string };
  showLegend?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
  formatValue: (v: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-lg p-3 text-sm">
      <div className="font-semibold text-slate-800 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-900">{formatValue(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function UBGLineChart({
  data,
  lines,
  xKey = "label",
  height = 240,
  formatValue = (v) => v.toFixed(1) + "%",
  referenceLine,
  showLegend = true,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatValue}
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
        )}
        {referenceLine && (
          <ReferenceLine
            y={referenceLine.value}
            stroke={referenceLine.color || "#10B981"}
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{
              value: referenceLine.label,
              position: "right",
              fontSize: 11,
              fill: referenceLine.color || "#10B981",
              fontWeight: 700,
            }}
          />
        )}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color}
            strokeWidth={line.dashed ? 2 : 3}
            strokeDasharray={line.dashed ? "6 3" : undefined}
            dot={{ r: 5, fill: line.color, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
