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
    <div
      style={{
        background: "rgba(8,18,28,0.96)",
        border: "1px solid rgba(27,152,224,0.35)",
        borderRadius: 10,
        padding: "10px 14px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(27,152,224,0.12)",
        minWidth: 140,
      }}
    >
      <p
        style={{
          color: "#5a7a99",
          fontSize: 11,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 6,
          margin: "0 0 6px 0",
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: "#c8d8e8",
              fontSize: 13,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
            }}
          >
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
            <stop offset="0%" stopColor={color} stopOpacity={0.95} />
            <stop offset="100%" stopColor={color} stopOpacity={0.45} />
          </linearGradient>
          <linearGradient id={negGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4d6d" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#ff4d6d" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(27,152,224,0.07)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{
            fontSize: 11,
            fill: "#4d6680",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatValue}
          tick={{
            fontSize: 10,
            fill: "#3d5570",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
          axisLine={false}
          tickLine={false}
          width={68}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ fill: "rgba(27,152,224,0.05)" }}
        />
        <Bar dataKey="value" name="Valor" radius={[6, 6, 0, 0]} maxBarSize={52}>
          {data.map((entry, index) => {
            const isNeg = entry.value < 0;
            const isHighlight =
              highlightIndex !== undefined && index === highlightIndex;
            return (
              <Cell
                key={index}
                fill={
                  isHighlight
                    ? `url(#bar-grad-13233d)`
                    : isNeg
                    ? `url(#${negGradId})`
                    : `url(#${gradId})`
                }
                style={{
                  filter: `drop-shadow(0 0 5px ${isNeg ? "#ff4d6d" : color}35)`,
                }}
              />
            );
          })}
          {showLabels && (
            <LabelList
              dataKey="value"
              position="top"
              formatter={formatValue}
              style={{
                fontSize: 10,
                fontWeight: 700,
                fill: "#5a7a99",
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
            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <stop offset="100%" stopColor={color} stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(27,152,224,0.07)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={formatValue}
          tick={{
            fontSize: 10,
            fill: "#3d5570",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{
            fontSize: 11,
            fill: "#8fa3bc",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
          }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ fill: "rgba(27,152,224,0.05)" }}
        />
        <Bar
          dataKey="value"
          name="Valor"
          fill={`url(#${gradId})`}
          radius={[0, 4, 4, 0]}
          maxBarSize={20}
          style={{ filter: `drop-shadow(0 0 4px ${color}30)` }}
        >
          <LabelList
            dataKey="value"
            position="right"
            formatter={formatValue}
            style={{
              fontSize: 11,
              fontWeight: 700,
              fill: "#8fa3bc",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
