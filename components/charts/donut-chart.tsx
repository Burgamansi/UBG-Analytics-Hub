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
  "#29ABE2", "#1a3a5c", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#6366F1",
];

interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
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
  payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
  formatValue: (v: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-slate-200 shadow-lg p-3 text-sm">
      <div className="font-semibold text-slate-800 mb-1">{item.name}</div>
      <div className="text-slate-600">
        Valor: <span className="font-bold text-slate-900">{formatValue(item.value)}</span>
      </div>
      <div className="text-slate-500 text-xs mt-0.5">
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
    <div className="flex flex-col gap-1.5 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="w-2.5 h-2.5 flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-slate-600 flex-1 truncate">{entry.value}</span>
          <span className="font-semibold text-slate-800">
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
            paddingAngle={2}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
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
        <div className="text-center -mt-2">
          {centerValue && (
            <div className="text-lg font-black text-slate-900">{centerValue}</div>
          )}
          {centerLabel && (
            <div className="text-xs text-slate-500">{centerLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
