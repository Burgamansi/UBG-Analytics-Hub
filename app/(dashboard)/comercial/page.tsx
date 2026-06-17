"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGBarChart, UBGHorizontalBar } from "@/components/charts/bar-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import { TrendingUp, Package, DollarSign, Users, Info } from "lucide-react";
import { formatMillions, formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MESES = [
  { mes: 0, label: "Todos" },
  { mes: 1, label: "Janeiro" },
  { mes: 2, label: "Fevereiro" },
  { mes: 3, label: "Março" },
  { mes: 4, label: "Abril" },
  { mes: 5, label: "Maio" },
];

type MesDado = {
  faturamento: number;
  quantidade: number;
  ticket: number;
  variacao: number;
  vendedores: Array<{ name: string; value: number }>;
  empresas: Array<{ name: string; value: number }>;
};

type ComercialSummary = {
  dadosMes: Record<number, MesDado>;
  faturamentoMeses: Array<{ label: string; value: number }>;
  tiposProduto: Array<{ name: string; value: number }>;
  fornecedores: Array<{ label: string; value: number }>;
};

const EMPTY_DADOS: MesDado = {
  faturamento: 0, quantidade: 0, ticket: 0, variacao: 0,
  vendedores: [], empresas: [],
};

const EMPTY_SUMMARY: ComercialSummary = {
  dadosMes: { 0: EMPTY_DADOS },
  faturamentoMeses: [],
  tiposProduto: [],
  fornecedores: [],
};

export default function ComercialPage() {
  const [mesSel, setMesSel] = useState(0);
  const [available, setAvailable] = useState(false);
  const [summary, setSummary] = useState<ComercialSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/comercial")
      .then((r) => r.json())
      .then((data) => {
        setAvailable(Boolean(data.available));
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dados = summary.dadosMes[mesSel] ?? summary.dadosMes[0] ?? EMPTY_DADOS;
  const faturamentoMeses = summary.faturamentoMeses;
  const tiposProduto = summary.tiposProduto;
  const fornecedores = summary.fornecedores;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="section-title mb-1">Módulo Comercial</div>
          <h1 className="page-title">Dashboard Comercial 2026</h1>
          <p className="text-sm text-slate-500 mt-1">
            Faturamento, vendedores, empresas e produtos · Planilha: aba MESES
          </p>
        </div>
        {/* Filtro de mês */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1">
          {MESES.map((m) => (
            <button
              key={m.mes}
              onClick={() => setMesSel(m.mes)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold transition-all",
                mesSel === m.mes
                  ? "bg-brand-navy text-white"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Banner sem dados */}
      {!loading && !available && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-sky-800">
            <strong className="text-sky-900">Exibindo dados de demonstração.</strong>{" "}
            Vá em{" "}
            <strong className="text-sky-700">Upload de Dados</strong>, selecione{" "}
            <strong className="text-sky-700">Comercial</strong> e envie a planilha{" "}
            <strong className="text-slate-800">IndicadoresComercial2026.xls</strong>{" "}
            para carregar os dados reais.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Faturamento"
          value={formatMillions(dados.faturamento)}
          subtitle={mesSel === 0 ? "Jan–Mai 2026" : MESES[mesSel].label}
          variation={dados.variacao}
          variationLabel="vs mês anterior"
          icon={TrendingUp}
          accentColor="#29ABE2"
          status={dados.variacao >= 0 ? "success" : "warning"}
        />
        <KPICard
          title="Quantidade"
          value={formatNumber(dados.quantidade) + " un."}
          subtitle="Unidades vendidas"
          icon={Package}
          accentColor="#1a3a5c"
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(dados.ticket)}
          subtitle="Por unidade"
          icon={DollarSign}
          accentColor="#10B981"
          status="success"
        />
        <KPICard
          title="Vendedores"
          value={dados.vendedores.length.toString()}
          subtitle="Ativos no período"
          icon={Users}
          accentColor="#F59E0B"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="section-title mb-1">Faturamento por Mês</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Evolução Jan–Mai 2026
          </div>
          <UBGBarChart
            data={faturamentoMeses}
            formatValue={formatMillions}
            height={230}
            highlightIndex={mesSel > 0 ? mesSel - 1 : undefined}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="section-title mb-1">Distribuição por Empresa</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            {mesSel === 0 ? "Acumulado Jan–Mai" : MESES[mesSel].label}
          </div>
          <UBGDonutChart
            data={dados.empresas}
            formatValue={formatMillions}
            height={220}
          />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="section-title mb-1">Ranking Vendedores</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            {mesSel === 0 ? "Acumulado Jan–Mai" : MESES[mesSel].label}
          </div>
          <UBGDonutChart
            data={dados.vendedores}
            formatValue={formatMillions}
            height={220}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="section-title mb-1">Mix de Produtos</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Participação por tipo
          </div>
          <UBGDonutChart
            data={tiposProduto}
            formatValue={formatMillions}
            height={220}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <div className="section-title mb-1">Top Fornecedores</div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Por faturamento acumulado
          </div>
          <UBGHorizontalBar
            data={fornecedores}
            formatValue={formatMillions}
            color="#29ABE2"
          />
        </div>
      </div>

      {/* Ticket médio por tipo */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_0_12px_rgba(0,0,0,0.03)]">
        <div className="section-title mb-1">Oportunidade de Up-sell</div>
        <div className="text-sm font-semibold text-slate-700 mb-4">
          Ticket médio por tipo de produto — Liner/Gardelon/Travados têm 3–5× maior margem que Normais
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tipo: "Normal",   ticket: 32.9,  color: "#94A3B8", mult: "1×"   },
            { tipo: "Liner",    ticket: 97.3,  color: "#29ABE2", mult: "3×"   },
            { tipo: "Gardelon", ticket: 116.7, color: "#1a3a5c", mult: "3,5×" },
            { tipo: "Travados", ticket: 164.2, color: "#10B981", mult: "5×"   },
          ].map((t) => (
            <div
              key={t.tipo}
              className="border border-gray-200 rounded-xl p-4 shadow-[0_0_12px_rgba(0,0,0,0.03)]"
              style={{ borderTop: `3px solid ${t.color}` }}
            >
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.tipo}
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(t.ticket)}
              </div>
              <div className="text-xs text-slate-400 mt-1">por unidade</div>
              <div className="text-sm font-bold mt-2" style={{ color: t.color }}>
                {t.mult} vs Normal
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
