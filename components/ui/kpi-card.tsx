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
  size?: "default" | "lg";
}

export function KPICard({
  title,
  value,
  subtitle,
  variation,
  variationLabel,
  icon: Icon,
  accentColor = "#1b98e0",
  status = "neutral",
  meta,
  className,
  size = "default",
}: KPICardProps) {
  const variationPositive = variation !== undefined && variation > 0;
  const variationNegative = variation !== undefined && variation < 0;

  const varColor = variationPositive
    ? "#00e676"
    : variationNegative
    ? "#ff4d6d"
    : "#4d6680";

  return (
    <div
      className={cn("kpi-enterprise card-hover", className)}
      style={{ padding: size === "lg" ? "24px 26px" : "18px 20px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="kpi-label">{title}</span>
        {Icon && (
          <div
            className="w-9 h-9 rounded-icon flex items-center justify-center flex-shrink-0"
            style={{
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 0 12px ${accentColor}15`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
        )}
      </div>

      {/* Value — Rajdhani Bold */}
      <div
        className={cn("kpi-number", size === "lg" && "kpi-number-lg")}
        style={{
          fontSize: size === "lg" ? 40 : 30,
          textShadow: `0 0 20px ${accentColor}30`,
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {subtitle}
        </div>
      )}

      {/* Footer */}
      {(variation !== undefined || meta) && (
        <div
          className="flex items-center justify-between gap-2 mt-4 pt-3"
          style={{ borderTop: "1px solid rgba(27,152,224,0.1)" }}
        >
          {variation !== undefined ? (
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center justify-center w-5 h-5 rounded-md"
                style={{ background: `${varColor}15` }}
              >
                {variationPositive ? (
                  <TrendingUp className="w-3 h-3" style={{ color: varColor }} />
                ) : variationNegative ? (
                  <TrendingDown className="w-3 h-3" style={{ color: varColor }} />
                ) : (
                  <Minus className="w-3 h-3" style={{ color: varColor }} />
                )}
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: varColor,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {variationPositive ? "+" : ""}{variation.toFixed(1)}%
              </span>
              {variationLabel && (
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {variationLabel}
                </span>
              )}
            </div>
          ) : <div />}

          {meta && (
            <span
              className="badge"
              style={{
                background: "rgba(27,152,224,0.1)",
                color: "var(--rjt-secondary)",
                border: "1px solid rgba(27,152,224,0.2)",
                fontSize: 10,
              }}
            >
              {meta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
