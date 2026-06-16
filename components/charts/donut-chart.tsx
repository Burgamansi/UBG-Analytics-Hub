"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#1b98e0",
  "#13233d",
  "#059669",
  "#F59E0B",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#D97706",
];

interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  formatValue?: (v: number) => string;
  centerLabel?: string;
  centerValue?: string;
}

const CustomTooltip = ({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percent: number; color?: string } }>;
  formatValue: (v: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const color = item.payload.color || "#1b98e0";
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "12px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      minWidth: 160,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 8, paddingBottom: 8,
        borderBottom: "1px solid #F3F4F6",
      }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{
          color: "#374151", fontSize: 12,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
        }}>
          {item.name}
        </span>
      </div>
      <div style={{
        color: "#111827", fontSize: 16,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800, marginBottom: 4,
      }}>
        {formatValue(item.value)}
      </div>
      <div style={{
        color: color, fontSize: 12,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
      }}>
        {(item.payload.percent * 100).toFixed(1)}% do total
      </div>
    </div>
  );
};

const CustomLegend = ({
  payload,
}: {
  payload?: Array<{ color: string; value: string; payload: { value: number; percent: number } }>;
}) => {
  if (!payload) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: entry.color, flexShrink: 0,
          }} />
          <span style={{
            color: "#374151", fontSize: 12,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500, flex: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {entry.value}
          </span>
          <span style={{
            color: "#111827", fontSize: 13,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, flexShrink: 0,
          }}>
            {(entry.payload.percent * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export function UBGDonutChart({
  data,
  height = 220,
  innerRadius = 55,
  outerRadius = 90,
  showLegend = true,
  formatValue = (v) => v.toLocaleString("pt-BR"),
  centerLabel,
  centerValue,
}: DonutChartProps) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={2}
            stroke="#ffffff"
          >
            {data.map((entry, index) => {
              const color = entry.color || COLORS[index % COLORS.length];
              return (
                <Cell key={index} fill={color} />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
          {showLegend && (
            <Legend
              content={<CustomLegend />}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div style={{ textAlign: "center", marginTop: -8 }}>
          {centerValue && (
            <div style={{
              fontSize: 18,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, color: "#111827",
            }}>
              {centerValue}
            </div>
          )}
          {centerLabel && (
            <div style={{
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#9CA3AF",
            }}>
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
