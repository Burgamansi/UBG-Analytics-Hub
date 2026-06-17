"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { UBGBarChart } from "@/components/charts/bar-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import { UBGLineChart } from "@/components/charts/line-chart";
import {
  TrendingUp,
  Users,
  Package,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { formatMillions, formatPercent } from "@/lib/utils";
import Link from "next/link";

const faturamentoMes = [
  { label: "Jan", value: 1510000 },
  { label: "Fev", value: 1750000 },
  { label: "Mar", value: 1920000 },
  { label: "Abr", value: 1870000 },
  { label: "Mai", value: 2050000 },
];

const empresas = [
  { name: "Lima", value: 4200000 },
  { name: "LPL", value: 2800000 },
  { name: "Rafcorte", value: 1900000 },
  { name: "OP", value: 200000 },
];

const rhTurnover = [
  { label: "Jan", turnover: 10.4, meta: 6 },
  { label: "Fev", turnover: 12.0, meta: 6 },
  { label: "Mar", turnover: 19.2, meta: 6 },
];

const topVendedores = [
  { vendedor: "Thiers", faturamento: 6770000, participacao: 74.4 },
  { vendedor: "Laercio", faturamento: 1200000, participacao: 13.2 },
  { vendedor: "Fabio", faturamento: 960000, participacao: 10.5 },
  { vendedor: "Outros", faturamento: 170000, participacao: 1.9 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Indicadores Gerenciais 2026</h1>
          <p className="text-sm text-slate-500 mt-1">
            Comercial: Janeiro–Maio · RH: Janeiro–Março · Dados da planilha mestra
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-warning">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Turnover crítico
          </span>
          <span className="badge badge-success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Comercial +35%
          </span>
        </div>
      </div>

      {/* Alert banner */}
      <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_12px_rgba(239,68,68,0.03)]">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-red-800">
            Alerta RH — Turnover 3,2× acima da meta em Março (19,2% vs meta 6%)
          </div>
          <div className="text-xs text-red-600 mt-0.5">
            45 desligamentos em Jan–Mar · Custo oculto estimado: R$ 135–225K ·{" "}
            <Link href="/rh" className="underline font-semibold">
              Ver módulo RH →
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs Comercial */}
      <div>
        <div className="section-title mb-3">Comercial — Jan a Mai 2026</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Faturamento Total"
            value="R$ 9,10M"
            subtitle="Janeiro a Maio 2026"
            variation={35.8}
            variationLabel="vs Jan"
            icon={TrendingUp}
            accentColor="#29ABE2"
            status="success"
            meta="↑ Crescendo"
          />
          <KPICard
            title="Quantidade Vendida"
            value="192.762 un."
            subtitle="5 meses acumulados"
            icon={Package}
            accentColor="#1a3a5c"
            status="neutral"
          />
          <KPICard
            title="Ticket Médio"
            value="R$ 47,21"
            subtitle="Por unidade vendida"
            icon={TrendingUp}
            accentColor="#10B981"
            status="success"
          />
          <KPICard
            title="Empresas Ativas"
            value="4 empresas"
            subtitle="Lima · LPL · Rafcorte · OP"
            icon={Building2}
            accentColor="#F59E0B"
            status="warning"
            meta="OP em queda"
          />
        </div>
      </div>

      {/* KPIs RH */}
      <div>
        <div className="section-title mb-3">RH — Jan a Mar 2026</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Turnover Médio"
            value="13,9%"
            subtitle="Meta: 6% — +131% acima"
            variation={131}
            icon={Users}
            accentColor="#EF4444"
            status="danger"
            meta="⚠ Crítico"
          />
          <KPICard
            title="Desligamentos"
            value="45"
            subtitle="Jan–Mar acumulado"
            icon={Users}
            accentColor="#EF4444"
            status="danger"
            meta="Rafcorte: 20"
          />
          <KPICard
            title="Absenteísmo Médio"
            value="7,3%"
            subtitle="Meta: 5% — +46% acima"
            icon={Users}
            accentColor="#F59E0B"
            status="warning"
            meta="Pico: 8,4% Mar"
          />
          <KPICard
            title="Horas de Ausência"
            value="2.657h"
            subtitle="Justificadas + Não justificadas"
            icon={Users}
            accentColor="#F59E0B"
            status="warning"
          />
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Faturamento por mês */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Faturamento Mensal</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">
                Evolução Jan–Mai 2026
              </div>
            </div>
            <Link
              href="/comercial"
              className="text-xs text-brand-cyan font-semibold flex items-center gap-1 hover:underline"
            >
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <UBGBarChart
            data={faturamentoMes.map((d) => ({ label: d.label, value: d.value }))}
            formatValue={formatMillions}
            height={220}
          />
        </div>

        {/* Empresas donut */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Por Empresa</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">
                Participação no faturamento
              </div>
            </div>
          </div>
          <UBGDonutChart
            data={empresas}
            formatValue={formatMillions}
            height={200}
          />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Turnover linha */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Turnover vs Meta</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">
                Evolução Jan–Mar 2026
              </div>
            </div>
            <Link
              href="/rh"
              className="text-xs text-red-500 font-semibold flex items-center gap-1 hover:underline"
            >
              Ver RH <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <UBGLineChart
            data={rhTurnover}
            lines={[
              { key: "turnover", label: "Turnover %", color: "#EF4444" },
              { key: "meta", label: "Meta 6%", color: "#10B981", dashed: true },
            ]}
            xKey="label"
            formatValue={(v) => formatPercent(v)}
            height={200}
            referenceLine={{ value: 6, label: "Meta 6%", color: "#10B981" }}
          />
        </div>

        {/* Ranking vendedores */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="section-title mb-4">Ranking Vendedores</div>
          <div className="space-y-3">
            {topVendedores.map((v, i) => (
              <div key={v.vendedor}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-4">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {v.vendedor}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {formatPercent(v.participacao)}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100">
                  <div
                    className="h-full"
                    style={{
                      width: `${v.participacao}%`,
                      backgroundColor: i === 0 ? "#29ABE2" : i === 1 ? "#1a3a5c" : "#94A3B8",
                    }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatMillions(v.faturamento)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
