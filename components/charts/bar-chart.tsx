"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { formatMillions, formatNumber } from "@/lib/utils";

interface BarChartProps {
  data: Array<{ label: string; value: number; value2?: number }>;
  height?: number;
  color?: string;
  color2?: string;
  formatValue?: (v: number) => string;
  showLabels?: boolean;
  horizontal?: boolean;
  highlightIndex?: number;
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
      <div className="font-semibold text-slate-800 mb-1">{label}</div>
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

export function UBGBarChart({
  data,
  height = 260,
  color = "#29ABE2",
  formatValue = formatMillions,
  showLabels = true,
  highlightIndex,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatValue}
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ fill: "#F1F5F9" }}
        />
        <Bar dataKey="value" name="Valor" radius={[2, 2, 0, 0]} maxBarSize={56}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={
                highlightIndex !== undefined && index === highlightIndex
                  ? "#1a3a5c"
                  : color
              }
            />
          ))}
          {showLabels && (
            <LabelList
              dataKey="value"
              position="top"
              formatter={formatValue}
              style={{ fontSize: 11, fontWeight: 700, fill: "#334155" }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function UBGHorizontalBar({
  data,
  height,
  color = "#29ABE2",
  formatValue = formatNumber,
}: BarChartProps) {
  const h = height || Math.max(200, data.length * 42);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 80, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatValue}
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ fill: "#F1F5F9" }}
        />
        <Bar dataKey="value" name="Valor" fill={color} radius={[0, 2, 2, 0]} maxBarSize={24}>
          <LabelList
            dataKey="value"
            position="right"
            formatter={formatValue}
            style={{ fontSize: 11, fontWeight: 700, fill: "#334155" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
