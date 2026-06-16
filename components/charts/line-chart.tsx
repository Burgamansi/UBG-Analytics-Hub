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
    <div
      style={{
        background: "rgba(8,18,28,0.96)",
        border: "1px solid rgba(27,152,224,0.35)",
        borderRadius: 10,
        padding: "12px 16px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(27,152,224,0.12)",
        minWidth: 160,
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
          margin: "0 0 8px 0",
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: i < payload.length - 1 ? 4 : 0,
          }}
        >
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
              color: "#8fa3bc",
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              minWidth: 80,
            }}
          >
            {p.name}:
          </span>
          <span
            style={{
              color: "#e0ecf8",
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

const CustomLegend = ({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) => {
  if (!payload?.length) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px 20px",
        justifyContent: "center",
        paddingTop: 12,
      }}
    >
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <div
            style={{
              width: 20,
              height: 2,
              background: entry.color,
              borderRadius: 2,
              boxShadow: `0 0 4px ${entry.color}`,
            }}
          />
          <span
            style={{
              color: "#8fa3bc",
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
            }}
          >
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
        <defs>
          {lines.map((line) => (
            <filter key={`glow-${line.key}`} id={`glow-${line.key}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(27,152,224,0.07)"
        />
        <XAxis
          dataKey={xKey}
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
          width={60}
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
              fontSize: 10,
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
              fill: line.color,
              strokeWidth: 2,
              stroke: "rgba(8,18,28,0.9)",
            }}
            activeDot={{
              r: 6,
              fill: line.color,
              stroke: "rgba(8,18,28,0.9)",
              strokeWidth: 2,
              style: { filter: `drop-shadow(0 0 6px ${line.color})` },
            }}
            style={{ filter: `drop-shadow(0 0 3px ${line.color}60)` }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
