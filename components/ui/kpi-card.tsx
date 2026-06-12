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
  const statusColors = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-slate-50 text-slate-600",
  };

  const variationPositive = variation !== undefined && variation > 0;
  const variationNegative = variation !== undefined && variation < 0;

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 p-5 flex flex-col gap-2",
        className
      )}
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">
          {title}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-2xl font-black text-slate-900 leading-none">
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-xs text-slate-500 leading-tight">{subtitle}</div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        {variation !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              variationPositive && "text-emerald-600",
              variationNegative && "text-red-600",
              !variationPositive && !variationNegative && "text-slate-500"
            )}
          >
            {variationPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : variationNegative ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {variationPositive ? "+" : ""}
              {variation.toFixed(1)}%{" "}
              {variationLabel && (
                <span className="font-normal text-slate-400">
                  {variationLabel}
                </span>
              )}
            </span>
          </div>
        ) : (
          <div />
        )}

        {meta && (
          <span className={cn("text-xs px-2 py-0.5 font-semibold", statusColors[status])}>
            {meta}
          </span>
        )}
      </div>
    </div>
  );
}
