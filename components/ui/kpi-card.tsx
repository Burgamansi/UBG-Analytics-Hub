"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  variation?: number;
  variationLabel?: string;
  icon?: LucideIcon;
  accentColor?: string;
  status?: "success" | "warning" | "danger" | "neutral";
  meta?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  variation,
  variationLabel,
  icon: Icon,
  accentColor = "#29ABE2",
  status = "neutral",
  meta,
  className,
}: KPICardProps) {
  const variationPositive = variation !== undefined && variation > 0;
  const variationNegative = variation !== undefined && variation < 0;

  const varColor = variationPositive
    ? "#10B981"
    : variationNegative
    ? "#EF4444"
    : "#94A3B8";

  const statusColors: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger:  "bg-red-50 text-red-700 border border-red-100",
    neutral: "bg-slate-50 text-slate-600 border border-slate-100",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden flex flex-col gap-2 transition-all duration-200",
        className
      )}
      style={{
        background: "white",
        border: "1px solid rgba(226,232,240,0.8)",
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: "0 1px 4px rgba(13,27,46,0.06), 0 4px 16px rgba(13,27,46,0.04)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(13,27,46,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(13,27,46,0.06), 0 4px 16px rgba(13,27,46,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
          borderRadius: "12px 12px 0 0",
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#0D1B2E",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
          {subtitle}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-2 mt-auto pt-3"
        style={{ borderTop: "1px solid rgba(226,232,240,0.6)" }}
      >
        {variation !== undefined ? (
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center justify-center w-5 h-5 rounded-md"
              style={{ background: `${varColor}18` }}
            >
              {variationPositive ? (
                <TrendingUp className="w-3 h-3" style={{ color: varColor }} />
              ) : variationNegative ? (
                <TrendingDown className="w-3 h-3" style={{ color: varColor }} />
              ) : (
                <Minus className="w-3 h-3" style={{ color: varColor }} />
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: varColor }}>
              {variationPositive ? "+" : ""}
              {variation.toFixed(1)}%
            </span>
            {variationLabel && (
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                {variationLabel}
              </span>
            )}
          </div>
        ) : (
          <div />
        )}

        {meta && (
          <span
            className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColors[status])}
          >
            {meta}
          </span>
        )}
      </div>
    </div>
  );
}
