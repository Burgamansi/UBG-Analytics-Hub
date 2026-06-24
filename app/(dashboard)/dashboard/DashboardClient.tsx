"use client";

import Link from "next/link";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGLineChart } from "@/components/charts/line-chart";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  DollarSign,
  Factory,
  PackageSearch,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutiveDashboardData, ExecutiveStatus } from "@/src/lib/data/dashboardExecutivo";

const STATUS_STYLES: Record<ExecutiveStatus, { label: string; dot: string; badge: string; border: string; text: string }> = {
  success: {
    label: "Excelente",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  warning: {
    label: "Atenção",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  danger: {
    label: "Crítico",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
    border: "border-red-200",
    text: "text-red-700",
  },
  neutral: {
    label: "Neutro",
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-600",
    border: "border-slate-200",
    text: "text-slate-600",
  },
};

const AREA_ICONS: Record<string, typeof DollarSign> = {
  "Financeiro": DollarSign,
  "Comercial": TrendingUp,
  "Operações": Factory,
  "RH": Users,
  "Qualidade": ShieldAlert,
  "Compras": PackageSearch,
};

function getKpiIcon(area: string) {
  return AREA_ICONS[area] ?? BarChart3;
}

export function DashboardClient({ data }: { data: ExecutiveDashboardData }) {
  const executiveTrendData = data.trend.map((item) => ({ ...item }));

  return (
    <div className="p-6 space-y-6 bg-slate-50">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-title mb-1">Visão Geral Executiva</div>
          <h1 className="page-title">Central Executiva UBG Analytics Hub</h1>
          <p className="text-sm text-slate-500 mt-1">
            Situação geral, riscos, oportunidades e setores que precisam de atenção.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className={cn(
            "inline-flex items-center gap-2 bg-white border px-3 py-2 text-slate-600",
            data.source === "real" ? "border-emerald-200" : data.source === "partial" ? "border-sky-200" : "border-slate-200"
          )}>
            <span className={cn(
              "h-2 w-2 rounded-full",
              data.source === "real" ? "bg-emerald-500" : data.source === "partial" ? "bg-sky-500" : "bg-amber-500"
            )} />
            {data.sourceLabel}
          </span>
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-slate-600">
            <Building2 className="h-3.5 w-3.5 text-sky-600" />
            União Bag 2026
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
        <div className="bg-[#13233D] text-white border border-[#13233D] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-sky-200">
                Score Empresarial
              </div>
              <h2 className="mt-1 text-2xl font-black text-white">Saúde Empresarial</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Nota consolidada por Financeiro, Comercial, RH, Qualidade, Operações e Compras.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-sky-400 bg-white/10">
                <span className="text-4xl font-black text-white">{data.enterpriseScore.score}</span>
              </div>
              <div>
                <div className="text-sm text-slate-300">Status geral</div>
                <div className="mt-1 inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {data.enterpriseScore.status}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {data.enterpriseScore.criteria.map((item) => {
              const statusStyle = STATUS_STYLES[item.status];
              return (
                <div key={item.area} className="bg-white/8 border border-white/10 p-3 relative">
                  <div className="text-xs text-slate-300 flex items-center justify-between gap-1">
                    <span>{item.area}</span>
                    <span className={cn(
                      "text-[9px] px-1 rounded font-bold leading-tight",
                      item.isReal ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                    )}>
                      {item.isReal ? "Real" : "Demo"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xl font-black text-white">{item.score}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6">
          <div className="section-title mb-1">Resumo Executivo</div>
          <div className="text-lg font-black text-slate-900">Leitura para diretoria</div>
          <div className="mt-4 space-y-3">
            {data.executiveSummary.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="section-title mb-3">KPIs Executivos</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {data.kpis.map((kpi) => {
            const Icon = getKpiIcon(kpi.area);
            return (
              <KPICard
                key={`${kpi.area}-${kpi.title}`}
                title={kpi.title}
                value={kpi.value}
                subtitle={kpi.area}
                variation={kpi.variation}
                variationLabel="vs mês anterior"
                icon={Icon}
                accentColor={kpi.accentColor}
                status={kpi.status}
                meta={STATUS_STYLES[kpi.status].label}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Alertas Corporativos</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Riscos e oportunidades calculados dinamicamente
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.alerts.map((alert) => {
              const statusStyle = STATUS_STYLES[alert.status];
              return (
                <div key={alert.id} className={`border ${statusStyle.border} p-4 bg-white`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`} />
                        <div className="font-black text-slate-900">{alert.title}</div>
                      </div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                        {alert.area}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{alert.description}</p>
                    </div>
                    <div className={`text-sm font-black flex-shrink-0 ${statusStyle.text}`}>{alert.impact}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Ranking de Atenção</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Setores ordenados por prioridade de atuação executiva
          </div>
          <div className="space-y-3">
            {data.ranking.map((item, index) => {
              const statusStyle = STATUS_STYLES[item.status];
              return (
                <div key={item.area} className="grid grid-cols-[2rem_1fr_auto] gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex h-8 w-8 items-center justify-center bg-slate-100 text-xs font-black text-slate-700">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{item.area}</span>
                      <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                    </div>
                    <div className="text-sm text-slate-600">{item.risk}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.recommendation}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-black ${statusStyle.text}`}>{item.score}</div>
                    <div className="text-xs text-slate-400">nota</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-4">
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Resumo por Módulo</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Nota, status e indicador principal por área
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.summaries.map((module) => {
              const statusStyle = STATUS_STYLES[module.status];
              const content = (
                <div className={`border ${statusStyle.border} p-4 bg-white h-full transition hover:border-[#1B98E0]`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-900">{module.module}</div>
                      <div className="mt-1 text-sm text-slate-500">{module.mainIndicator}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-black ${statusStyle.text}`}>{module.score}</div>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold ${statusStyle.badge}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>
                </div>
              );

              return module.href ? (
                <Link key={module.module} href={module.href}>{content}</Link>
              ) : (
                <div key={module.module}>{content}</div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Gráfico Executivo Consolidado</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Índice mensal normalizado: receita, produção, RNCs e turnover
          </div>
          <UBGLineChart
            data={executiveTrendData}
            lines={[
              { key: "receita", label: "Receita", color: "#1B98E0" },
              { key: "producao", label: "Produção", color: "#13233D" },
              { key: "rncs", label: "RNCs", color: "#F59E0B", dashed: true },
              { key: "turnover", label: "Turnover", color: "#EF4444", dashed: true },
            ]}
            formatValue={(v) => `${v.toFixed(0)} pts`}
            height={320}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="section-title mb-1">Próxima Ação Recomendada</div>
            <div className="text-lg font-black text-slate-900">Priorizar RH, Qualidade e Compras no comitê semanal</div>
            <p className="mt-1 text-sm text-slate-600">
              Empresa está saudável, mas riscos de pessoas, RNC crítica e estoque podem pressionar margem se não forem tratados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/financeiro" className="btn-secondary inline-flex items-center gap-2">
              Ver Financeiro <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/rh" className="btn-primary inline-flex items-center gap-2">
              Ver RH <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
