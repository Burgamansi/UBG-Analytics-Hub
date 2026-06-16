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
    <div style={{
      background: "#ffffff",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "12px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      minWidth: 150,
    }}>
      <p style={{
        color: "#6B7280",
        fontSize: 11,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 8,
        paddingBottom: 8,
        borderBottom: "1px solid #F3F4F6",
      }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 8, height: 8, borderRadius: 2,
            background: p.color, flexShrink: 0,
          }} />
          <span style={{
            color: "#111827",
            fontSize: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
          }}>
            {formatValue(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function UBGBarChart({
  data,
  height = 260,
  color = "#1b98e0",
  formatValue = formatMillions,
  showLabels = false,
  highlightIndex,
}: BarChartProps) {
  const gradId = `bar-grad-${color.replace("#", "")}`;
  const negGradId = "bar-grad-neg";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.65} />
          </linearGradient>
          <linearGradient id={negGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#DC2626" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tickFormatter={formatValue}
          tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ fill: "rgba(27,152,224,0.04)" }}
        />
        <Bar dataKey="value" name="Valor" radius={[5, 5, 0, 0]} maxBarSize={48}>
          {data.map((entry, index) => {
            const isNeg = entry.value < 0;
            const isHighlight = highlightIndex !== undefined && index === highlightIndex;
            return (
              <Cell
                key={index}
                fill={
                  isHighlight
                    ? "#13233d"
                    : isNeg
                    ? `url(#${negGradId})`
                    : `url(#${gradId})`
                }
              />
            );
          })}
          {showLabels && (
            <LabelList
              dataKey="value"
              position="top"
              formatter={formatValue}
              style={{
                fontSize: 10, fontWeight: 700,
                fill: "#9CA3AF",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
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
  color = "#1b98e0",
  formatValue = formatNumber,
}: BarChartProps) {
  const h = height || Math.max(200, data.length * 42);
  const gradId = `hbar-grad-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 80, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatValue}
          tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: "#374151", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ fill: "rgba(27,152,224,0.04)" }}
        />
        <Bar
          dataKey="value"
          name="Valor"
          fill={`url(#${gradId})`}
          radius={[0, 5, 5, 0]}
          maxBarSize={20}
        >
          <LabelList
            dataKey="value"
            position="right"
            formatter={formatValue}
            style={{
              fontSize: 12, fontWeight: 700,
              fill: "#374151",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
