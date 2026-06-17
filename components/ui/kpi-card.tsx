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

  const varColor  = variationPositive ? "#059669" : variationNegative ? "#DC2626" : "#6B7280";
  const varBg     = variationPositive ? "#ECFDF5" : variationNegative ? "#FEF2F2" : "#F3F4F6";
  const varBorder = variationPositive ? "#A7F3D0" : variationNegative ? "#FECACA" : "#E5E7EB";

  return (
    <div
      className={cn("relative overflow-hidden bg-white rounded-2xl transition-all duration-200", className)}
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 0 12px rgba(0,0,0,0.03)",
        padding: size === "lg" ? "28px 28px" : "22px 24px",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.04), 0 0 16px rgba(27,152,224,0.1)";
        el.style.borderColor = "rgba(27,152,224,0.3)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 0 12px rgba(0,0,0,0.03)";
        el.style.borderColor = "#E5E7EB";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Accent bar top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.09em",
            color: "#9CA3AF",
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: "#9CA3AF",
              marginTop: 2,
            }}>
              {subtitle}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}22`,
            }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color: accentColor, width: 18, height: 18 }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: size === "lg" ? 42 : 32,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        color: "#111827",
        marginBottom: 4,
      }}>
        {value}
      </div>

      {/* Variation */}
      {(variation !== undefined || meta) && (
        <div className="flex items-center justify-between gap-2 mt-4">
          {variation !== undefined ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: varBg,
                border: `1px solid ${varBorder}`,
                display: "inline-flex",
              }}
            >
              {variationPositive && <TrendingUp  className="w-3 h-3" style={{ color: varColor }} />}
              {variationNegative && <TrendingDown className="w-3 h-3" style={{ color: varColor }} />}
              {!variationPositive && !variationNegative && <Minus className="w-3 h-3" style={{ color: varColor }} />}
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12, fontWeight: 700, color: varColor,
              }}>
                {variationPositive ? "+" : ""}{variation.toFixed(1)}%
              </span>
              {variationLabel && (
                <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 2 }}>
                  {variationLabel}
                </span>
              )}
            </div>
          ) : <div />}

          {meta && (
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, fontWeight: 600,
              color: "#1b98e0",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              padding: "3px 10px",
              borderRadius: 20,
            }}>
              {meta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
