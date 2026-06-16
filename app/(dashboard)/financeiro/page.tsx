"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGLineChart } from "@/components/charts/line-chart";
import { UBGBarChart, UBGHorizontalBar } from "@/components/charts/bar-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  Percent,
  Info,
  BarChart3,
  Activity,
  CreditCard,
  Users,
} from "lucide-react";
import {
  formatMillions,
  formatPercent,
  formatCurrency,
  getMonthShort,
} from "@/lib/utils";
import type { FinanceiroSummary } from "@/lib/parsers/parse-financeiro";

export const dynamic = "force-dynamic";

const DEMO_SUMMARY: FinanceiroSummary = {
  receita_total: 0,
  receita_liquida: 0,
  custos: 0,
  despesas: 0,
  lucro_bruto: 0,
  resultado_liquido: 0,
  ebitda: 0,
  margem_pct: 0,
  margem_ebitda_pct: 0,
  tributos_vendas: 0,
  despesas_vendas: 0,
  resultado_financeiro: 0,
  aplicacoes: 0,
  emprestimos: 0,
  retirada_socios: 0,
  evolucao_mensal: [],
  custo_rh: [],
  plano_contas: [],
  meses_com_dados: 0,
  ano_referencia: new Date().getFullYear(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ value, label }: { value: number; label: string }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 ${
        isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  accentColor = "#1A3A5C",
  children,
}: {
  title: string;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white border border-slate-200 p-5"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="section-title mb-0.5">{title}</div>
      {subtitle && (
        <div className="text-sm font-semibold text-slate-700 mb-4">{subtitle}</div>
      )}
      {children}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinanceiroSummary | null>(null);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"dre" | "custos" | "plano">("dre");

  useEffect(() => {
    fetch("/api/financeiro")
      .then((res) => res.json())
      .then((data) => {
        setAvailable(Boolean(data.available));
        setSummary(data.summary ?? DEMO_SUMMARY);
      })
      .catch(() => {
        setAvailable(false);
        setSummary(DEMO_SUMMARY);
      })
      .finally(() => setLoading(false));
  }, []);

  const d = summary ?? DEMO_SUMMARY;

  // Filtrar meses com dados reais
  const mesesComDados = d.evolucao_mensal.filter(
    (m) => m.receita !== 0 || m.custos !== 0 || m.ebitda !== 0
  );

  // Dados para gráficos
  const evolucaoData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    receita: m.receita,
    receita_liquida: m.receita_liquida,
    custos: m.custos,
    despesas: m.despesas,
    resultado: m.resultado,
    ebitda: m.ebitda,
  }));

  const ebitdaData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.ebitda,
  }));

  const resultadoData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.resultado,
  }));

  const faturamentoData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.receita,
  }));

  // Distribuição de custos (donut)
  const distribuicaoCustos = [
    { name: "CMV", value: d.custos, color: "#F59E0B" },
    { name: "ADM", value: d.despesas, color: "#EF4444" },
    { name: "Tributos Vendas", value: d.tributos_vendas, color: "#8B5CF6" },
    { name: "Desp. Vendas", value: d.despesas_vendas, color: "#EC4899" },
  ].filter((i) => i.value > 0);

  // Plano de contas top 10 (por realizado)
  const topContas = [...d.plano_contas]
    .filter((p) => p.realizado > 0)
    .sort((a, b) => b.realizado - a.realizado)
    .slice(0, 10)
    .map((p) => ({ label: p.descricao, value: p.realizado }));

  // Custo RH
  const custoRHData = d.custo_rh.map((r) => ({
    label: r.unidade,
    value: r.valor,
  }));

  // Resultado financeiro breakdown
  const resultFinData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    aplicacoes: m.aplicacoes,
    emprestimos: m.emprestimos,
    resultado_financeiro: m.resultado_financeiro,
  }));

  // Margem EBITDA por mês
  const margemData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.receita > 0 ? (m.ebitda / m.receita) * 100 : 0,
  }));

  const hasData = mesesComDados.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="section-title mb-1">Módulo Financeiro</div>
          <h1 className="page-title">Dashboard Financeiro / DRE</h1>
          <p className="text-sm text-slate-500 mt-1">
            Receitas, custos, despesas e resultado · Ano {d.ano_referencia}
            {hasData && ` · ${d.meses_com_dados} ${d.meses_com_dados === 1 ? "mês" : "meses"} com dados`}
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-2 text-xs">
            <StatusBadge
              value={d.ebitda}
              label={`EBITDA ${formatMillions(d.ebitda)}`}
            />
            <StatusBadge
              value={d.resultado_liquido}
              label={`Líquido ${formatMillions(d.resultado_liquido)}`}
            />
          </div>
        )}
      </div>

      {/* Banner sem dados */}
      {!loading && !available && (
        <div className="bg-sky-50 border border-sky-200 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sky-800">
            <strong>Nenhum dado importado ainda.</strong> Vá em{" "}
            <span className="font-semibold">Upload de Dados</span>, selecione o módulo{" "}
            <span className="font-semibold">Financeiro / DRE</span> e envie a planilha{" "}
            <strong>Custo - DRE 2026.xlsx</strong> para alimentar este painel.
          </div>
        </div>
      )}

      {/* ── LINHA 1: KPIs Receita ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Faturamento Bruto"
          value={formatMillions(d.receita_total)}
          subtitle="Receita bruta acumulada"
          icon={DollarSign}
          accentColor="#10B981"
          status="success"
        />
        <KPICard
          title="Receita Líquida"
          value={formatMillions(d.receita_liquida)}
          subtitle="Após deduções e tributos"
          icon={TrendingUp}
          accentColor="#1A3A5C"
          status={d.receita_liquida >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="EBITDA"
          value={formatMillions(d.ebitda)}
          subtitle="Resultado operacional"
          icon={BarChart3}
          accentColor="#29ABE2"
          status={d.ebitda >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="Margem EBITDA"
          value={formatPercent(d.margem_ebitda_pct)}
          subtitle="EBITDA / Faturamento"
          icon={Percent}
          accentColor={d.margem_ebitda_pct >= 0 ? "#10B981" : "#EF4444"}
          status={d.margem_ebitda_pct >= 0 ? "success" : "danger"}
        />
      </div>

      {/* ── LINHA 2: KPIs Custos e Resultado ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="CMV"
          value={formatMillions(d.custos)}
          subtitle="Custo de Mercadoria Vendida"
          icon={TrendingDown}
          accentColor="#F59E0B"
        />
        <KPICard
          title="Despesas ADM"
          value={formatMillions(d.despesas)}
          subtitle="Despesas administrativas"
          icon={Wallet}
          accentColor="#EF4444"
        />
        <KPICard
          title="Resultado Líquido"
          value={formatMillions(d.resultado_liquido)}
          subtitle="Após resultado financeiro"
          icon={Activity}
          accentColor={d.resultado_liquido >= 0 ? "#10B981" : "#EF4444"}
          status={d.resultado_liquido >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="Margem Líquida"
          value={formatPercent(d.margem_pct)}
          subtitle="Resultado líquido / Faturamento"
          icon={Percent}
          accentColor={d.margem_pct >= 0 ? "#29ABE2" : "#EF4444"}
          status={d.margem_pct >= 0 ? "success" : "danger"}
        />
      </div>

      {/* ── LINHA 3: Resultado Financeiro (cards) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="bg-white border border-slate-200 p-5"
          style={{ borderTop: "3px solid #1A3A5C" }}
        >
          <div className="section-title mb-1">Lucro Bruto</div>
          <div className="text-xs text-slate-500 mb-2">Receita Líquida − CMV</div>
          <div
            className={`text-3xl font-black ${
              d.lucro_bruto >= 0 ? "text-slate-900" : "text-red-600"
            }`}
          >
            {formatMillions(d.lucro_bruto)}
          </div>
        </div>
        <div
          className="bg-white border border-slate-200 p-5"
          style={{ borderTop: "3px solid #29ABE2" }}
        >
          <div className="section-title mb-1">Resultado Financeiro</div>
          <div className="text-xs text-slate-500 mb-2">
            Aplicações − Empréstimos
          </div>
          <div
            className={`text-3xl font-black ${
              d.resultado_financeiro >= 0 ? "text-slate-900" : "text-red-600"
            }`}
          >
            {formatMillions(d.resultado_financeiro)}
          </div>
          <div className="mt-2 flex gap-3 text-xs text-slate-500">
            <span>
              Aplicações:{" "}
              <strong className="text-emerald-600">
                {formatMillions(d.aplicacoes)}
              </strong>
            </span>
            <span>
              Empréstimos:{" "}
              <strong className="text-red-500">
                {formatMillions(d.emprestimos)}
              </strong>
            </span>
          </div>
        </div>
        <div
          className="bg-white border border-slate-200 p-5"
          style={{ borderTop: "3px solid #8B5CF6" }}
        >
          <div className="section-title mb-1">Deduções da Receita</div>
          <div className="text-xs text-slate-500 mb-2">
            Tributos + Despesas de Vendas
          </div>
          <div className="text-3xl font-black text-slate-900">
            {formatMillions(d.tributos_vendas + d.despesas_vendas)}
          </div>
          <div className="mt-2 flex gap-3 text-xs text-slate-500">
            <span>
              Tributos:{" "}
              <strong className="text-purple-600">
                {formatMillions(d.tributos_vendas)}
              </strong>
            </span>
            <span>
              Desp. Vendas:{" "}
              <strong className="text-pink-500">
                {formatMillions(d.despesas_vendas)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── ABAS DE ANÁLISE ──────────────────────────────────────────────── */}
      <div>
        <div className="flex gap-1 border-b border-slate-200 mb-4">
          {(
            [
              { key: "dre", label: "DRE — Evolução Mensal" },
              { key: "custos", label: "Análise de Custos" },
              { key: "plano", label: "Plano de Contas" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAbaAtiva(tab.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                abaAtiva === tab.key
                  ? "border-[#29ABE2] text-[#1A3A5C]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ABA: DRE — Evolução Mensal */}
        {abaAtiva === "dre" && (
          <div className="space-y-4">
            <SectionCard
              title="Evolução Mensal — Receita vs Custos vs Resultado"
              subtitle="Faturamento, CMV, despesas e resultado líquido por mês"
              accentColor="#1A3A5C"
            >
              {hasData ? (
                <UBGLineChart
                  data={evolucaoData}
                  lines={[
                    { key: "receita", label: "Faturamento", color: "#10B981" },
                    { key: "receita_liquida", label: "Rec. Líquida", color: "#1A3A5C" },
                    { key: "custos", label: "CMV", color: "#F59E0B" },
                    { key: "despesas", label: "ADM", color: "#EF4444" },
                    { key: "resultado", label: "Resultado", color: "#29ABE2", dashed: true },
                  ]}
                  formatValue={formatMillions}
                  height={300}
                />
              ) : (
                <EmptyState />
              )}
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard
                title="EBITDA por Mês"
                subtitle="Resultado operacional antes de juros e impostos"
                accentColor="#29ABE2"
              >
                {hasData ? (
                  <UBGBarChart
                    data={ebitdaData}
                    formatValue={formatMillions}
                    color="#29ABE2"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>

              <SectionCard
                title="Margem EBITDA (%)"
                subtitle="EBITDA como % do faturamento por mês"
                accentColor="#10B981"
              >
                {hasData ? (
                  <UBGBarChart
                    data={margemData}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                    color="#10B981"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard
                title="Faturamento por Mês"
                subtitle="Receita bruta mensal"
                accentColor="#1A3A5C"
              >
                {hasData ? (
                  <UBGBarChart
                    data={faturamentoData}
                    formatValue={formatMillions}
                    color="#1A3A5C"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>

              <SectionCard
                title="Resultado Líquido por Mês"
                subtitle="Lucro ou prejuízo mensal"
                accentColor="#8B5CF6"
              >
                {hasData ? (
                  <UBGBarChart
                    data={resultadoData}
                    formatValue={formatMillions}
                    color="#8B5CF6"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            {/* Tabela DRE */}
            <SectionCard
              title="Tabela DRE — Resumo Mensal"
              subtitle="Valores consolidados por mês"
              accentColor="#1A3A5C"
            >
              {hasData ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Indicador
                        </th>
                        {mesesComDados.map((m) => (
                          <th
                            key={m.mes}
                            className="text-right py-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                          >
                            {getMonthShort(m.mes)}
                          </th>
                        ))}
                        <th className="text-right py-2 pl-4 text-xs font-semibold text-[#1A3A5C] uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: "receita" as const, label: "Faturamento", bold: false, color: "" },
                        { key: "despesas_vendas" as const, label: "(-) Desp. Vendas", bold: false, color: "text-red-500" },
                        { key: "tributos_vendas" as const, label: "(-) Tributos Vendas", bold: false, color: "text-red-500" },
                        { key: "receita_liquida" as const, label: "Receita Líquida", bold: true, color: "text-[#1A3A5C]" },
                        { key: "custos" as const, label: "(-) CMV", bold: false, color: "text-amber-600" },
                        { key: "despesas" as const, label: "(-) ADM", bold: false, color: "text-red-500" },
                        { key: "ebitda" as const, label: "EBITDA", bold: true, color: "text-[#29ABE2]" },
                        { key: "resultado_financeiro" as const, label: "Resultado Financeiro", bold: false, color: "" },
                        { key: "resultado" as const, label: "Resultado Líquido", bold: true, color: "" },
                      ].map((row) => {
                        const total = mesesComDados.reduce(
                          (acc, m) => acc + (m[row.key] as number),
                          0
                        );
                        return (
                          <tr key={row.key} className="border-b border-slate-100 hover:bg-slate-50">
                            <td
                              className={`py-2 pr-4 ${
                                row.bold ? "font-bold text-slate-900" : "text-slate-600"
                              }`}
                            >
                              {row.label}
                            </td>
                            {mesesComDados.map((m) => {
                              const v = m[row.key] as number;
                              return (
                                <td
                                  key={m.mes}
                                  className={`text-right py-2 px-2 tabular-nums ${
                                    row.bold ? "font-bold" : ""
                                  } ${
                                    v < 0
                                      ? "text-red-600"
                                      : row.color || "text-slate-700"
                                  }`}
                                >
                                  {formatMillions(v)}
                                </td>
                              );
                            })}
                            <td
                              className={`text-right py-2 pl-4 tabular-nums font-bold ${
                                total < 0 ? "text-red-600" : "text-[#1A3A5C]"
                              }`}
                            >
                              {formatMillions(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState />
              )}
            </SectionCard>
          </div>
        )}

        {/* ABA: Análise de Custos */}
        {abaAtiva === "custos" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard
                title="Distribuição de Custos e Despesas"
                subtitle="Composição percentual do total de custos"
                accentColor="#F59E0B"
              >
                {distribuicaoCustos.length > 0 ? (
                  <UBGDonutChart
                    data={distribuicaoCustos}
                    height={260}
                    formatValue={formatMillions}
                    showLegend
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>

              <SectionCard
                title="Custo de RH por Unidade"
                subtitle="Média mensal de custos de pessoal"
                accentColor="#EF4444"
              >
                {custoRHData.length > 0 ? (
                  <UBGHorizontalBar
                    data={custoRHData}
                    formatValue={formatMillions}
                    color="#EF4444"
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            <SectionCard
              title="Resultado Financeiro — Aplicações vs Empréstimos"
              subtitle="Evolução mensal das receitas e despesas financeiras"
              accentColor="#29ABE2"
            >
              {hasData && resultFinData.some((m) => m.aplicacoes !== 0 || m.emprestimos !== 0) ? (
                <UBGLineChart
                  data={resultFinData}
                  lines={[
                    { key: "aplicacoes", label: "Aplicações", color: "#10B981" },
                    { key: "emprestimos", label: "Empréstimos", color: "#EF4444" },
                    { key: "resultado_financeiro", label: "Resultado Fin.", color: "#29ABE2", dashed: true },
                  ]}
                  formatValue={formatMillions}
                  height={240}
                />
              ) : (
                <EmptyState />
              )}
            </SectionCard>

            {/* Resumo de custos */}
            <SectionCard
              title="Resumo de Custos — Acumulado"
              subtitle="Totais acumulados no período"
              accentColor="#1A3A5C"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "CMV", value: d.custos, color: "#F59E0B", pct: d.receita_total > 0 ? (d.custos / d.receita_total) * 100 : 0 },
                  { label: "ADM", value: d.despesas, color: "#EF4444", pct: d.receita_total > 0 ? (d.despesas / d.receita_total) * 100 : 0 },
                  { label: "Tributos Vendas", value: d.tributos_vendas, color: "#8B5CF6", pct: d.receita_total > 0 ? (d.tributos_vendas / d.receita_total) * 100 : 0 },
                  { label: "Desp. Vendas", value: d.despesas_vendas, color: "#EC4899", pct: d.receita_total > 0 ? (d.despesas_vendas / d.receita_total) * 100 : 0 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border border-slate-100 p-4"
                    style={{ borderLeft: `3px solid ${item.color}` }}
                  >
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {item.label}
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {formatMillions(item.value)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.pct.toFixed(1)}% do faturamento
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ABA: Plano de Contas */}
        {abaAtiva === "plano" && (
          <div className="space-y-4">
            {topContas.length > 0 ? (
              <>
                <SectionCard
                  title="Top 10 Contas por Realizado"
                  subtitle="Maiores gastos realizados no período"
                  accentColor="#1A3A5C"
                >
                  <UBGHorizontalBar
                    data={topContas}
                    formatValue={formatMillions}
                    color="#1A3A5C"
                  />
                </SectionCard>

                <SectionCard
                  title="Orçado vs Realizado — Plano de Contas"
                  subtitle="Comparativo de todas as contas do período"
                  accentColor="#29ABE2"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Orçado
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Realizado
                          </th>
                          <th className="text-right py-2 pl-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Diferença
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.plano_contas
                          .filter((p) => p.realizado > 0 || p.orcado > 0)
                          .sort((a, b) => b.realizado - a.realizado)
                          .map((p) => (
                            <tr
                              key={p.codigo}
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >
                              <td className="py-2 pr-4 text-slate-400 tabular-nums text-xs">
                                {p.codigo}
                              </td>
                              <td className="py-2 pr-4 text-slate-700 font-medium">
                                {p.descricao}
                              </td>
                              <td className="py-2 pr-4">
                                {p.tipo && (
                                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 font-medium">
                                    {p.tipo}
                                  </span>
                                )}
                              </td>
                              <td className="text-right py-2 px-2 tabular-nums text-slate-600">
                                {formatCurrency(p.orcado)}
                              </td>
                              <td className="text-right py-2 px-2 tabular-nums font-semibold text-slate-900">
                                {formatCurrency(p.realizado)}
                              </td>
                              <td
                                className={`text-right py-2 pl-4 tabular-nums font-bold ${
                                  p.diferenca >= 0 ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {p.diferenca >= 0 ? "+" : ""}
                                {formatCurrency(p.diferenca)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </>
            ) : (
              <div className="bg-white border border-slate-200 p-10 text-center">
                <div className="text-slate-400 text-sm">
                  Plano de contas não disponível. Importe a planilha financeira para visualizar.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Retirada de Sócios ─────────────────────────────────────────────── */}
      {d.retirada_socios > 0 && (
        <div
          className="bg-white border border-slate-200 p-5 flex items-center justify-between"
          style={{ borderTop: "3px solid #1A3A5C" }}
        >
          <div>
            <div className="section-title mb-0.5">Retirada de Sócios</div>
            <div className="text-xs text-slate-500">Total acumulado no período</div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-400" />
            <div className="text-2xl font-black text-slate-900">
              {formatMillions(d.retirada_socios)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-sm text-slate-400 py-10 text-center">
      Sem dados disponíveis. Importe a planilha financeira para visualizar.
    </div>
  );
}
