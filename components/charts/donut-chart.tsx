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
  "#00e5ff",
  "#00e676",
  "#ffb300",
  "#ff4d6d",
  "#b388ff",
  "#ff80ab",
  "#69f0ae",
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
    <div
      style={{
        background: "rgba(8,18,28,0.96)",
        border: `1px solid ${color}40`,
        borderRadius: 10,
        padding: "10px 14px",
        backdropFilter: "blur(20px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${color}15`,
        minWidth: 150,
      }}
    >
      <p
        style={{
          color: "#8fa3bc",
          fontSize: 11,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          margin: "0 0 6px 0",
        }}
      >
        {item.name}
      </p>
      <p
        style={{
          color: "#e0ecf8",
          fontSize: 15,
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          margin: "0 0 2px 0",
        }}
      >
        {formatValue(item.value)}
      </p>
      <p
        style={{
          color: color,
          fontSize: 12,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          margin: 0,
        }}
      >
        {(item.payload.percent * 100).toFixed(1)}% do total
      </p>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: entry.color,
              boxShadow: `0 0 6px ${entry.color}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: "#8fa3bc",
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {entry.value}
          </span>
          <span
            style={{
              color: "#c8d8e8",
              fontSize: 12,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
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
          <defs>
            {data.map((entry, i) => {
              const c = entry.color || COLORS[i % COLORS.length];
              return (
                <filter key={`glow-pie-${i}`} id={`glow-pie-${i}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              );
            })}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={2}
            stroke="rgba(8,18,28,0.8)"
          >
            {data.map((entry, index) => {
              const color = entry.color || COLORS[index % COLORS.length];
              return (
                <Cell
                  key={index}
                  fill={color}
                  style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
                />
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
            <div
              style={{
                fontSize: 18,
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                color: "#e0ecf8",
              }}
            >
              {centerValue}
            </div>
          )}
          {centerLabel && (
            <div
              style={{
                fontSize: 11,
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#5a7a99",
              }}
            >
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
