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
    <div style={{
      background: "#ffffff",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "12px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      minWidth: 170,
    }}>
      <p style={{
        color: "#6B7280",
        fontSize: 11,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        margin: "0 0 8px 0",
        paddingBottom: 8,
        borderBottom: "1px solid #F3F4F6",
      }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center",
          gap: 8,
          marginBottom: i < payload.length - 1 ? 6 : 0,
        }}>
          <div style={{
            width: 10, height: 3, borderRadius: 2,
            background: p.color, flexShrink: 0,
          }} />
          <span style={{
            color: "#6B7280", fontSize: 12,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500, minWidth: 90,
          }}>
            {p.name}:
          </span>
          <span style={{
            color: "#111827", fontSize: 13,
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

const CustomLegend = ({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) => {
  if (!payload?.length) return null;
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      gap: "8px 20px", justifyContent: "center",
      paddingTop: 12,
    }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 20, height: 3,
            background: entry.color, borderRadius: 2,
          }} />
          <span style={{
            color: "#6B7280", fontSize: 12,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
          }}>
            {entry.value}
          </span>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey={xKey}
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
          width={64}
        />
        <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
        {showLegend && <Legend content={<CustomLegend />} />}
        {referenceLine && (
          <ReferenceLine
            y={referenceLine.value}
            stroke={referenceLine.color || "#1b98e0"}
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: referenceLine.label,
              position: "right",
              fontSize: 11,
              fill: referenceLine.color || "#1b98e0",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
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
            strokeWidth={line.dashed ? 1.5 : 2.5}
            strokeDasharray={line.dashed ? "6 3" : undefined}
            dot={{
              r: 4,
              fill: "#ffffff",
              strokeWidth: 2,
              stroke: line.color,
            }}
            activeDot={{
              r: 6,
              fill: "#ffffff",
              stroke: line.color,
              strokeWidth: 2.5,
            }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
