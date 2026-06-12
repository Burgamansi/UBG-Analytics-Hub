"use client";

import { useState } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGBarChart, UBGHorizontalBar } from "@/components/charts/bar-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";
import { formatMillions, formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MESES = [
  { mes: 0, label: "Todos" },
  { mes: 1, label: "Janeiro" },
  { mes: 2, label: "Fevereiro" },
  { mes: 3, label: "Março" },
  { mes: 4, label: "Abril" },
  { mes: 5, label: "Maio" },
];

const dadosMes: Record<number, {
  faturamento: number; quantidade: number; ticket: number; variacao: number;
  vendedores: Array<{ name: string; value: number }>;
  empresas: Array<{ name: string; value: number }>;
}> = {
  0: {
    faturamento: 9100000, quantidade: 192762, ticket: 47.21, variacao: 35.8,
    vendedores: [
      { name: "Thiers", value: 6770000 }, { name: "Laercio", value: 1200000 },
      { name: "Fabio", value: 960000 }, { name: "Outros", value: 170000 },
    ],
    empresas: [
      { name: "Lima", value: 4200000 }, { name: "LPL", value: 2800000 },
      { name: "Rafcorte", value: 1900000 }, { name: "OP", value: 200000 },
    ],
  },
  1: { faturamento: 1510000, quantidade: 42247, ticket: 35.74, variacao: 0,
    vendedores: [{ name: "Thiers", value: 1100000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 160000 }],
    empresas: [{ name: "Lima", value: 700000 }, { name: "LPL", value: 500000 }, { name: "Rafcorte", value: 235000 }, { name: "OP", value: 75000 }],
  },
  2: { faturamento: 1750000, quantidade: 58813, ticket: 29.75, variacao: 15.9,
    vendedores: [{ name: "Thiers", value: 1350000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 150000 }],
    empresas: [{ name: "Lima", value: 850000 }, { name: "LPL", value: 600000 }, { name: "Rafcorte", value: 270000 }, { name: "OP", value: 30000 }],
  },
  3: { faturamento: 1920000, quantidade: 32853, ticket: 58.45, variacao: 9.7,
    vendedores: [{ name: "Thiers", value: 1500000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 170000 }],
    empresas: [{ name: "Lima", value: 900000 }, { name: "LPL", value: 700000 }, { name: "Rafcorte", value: 310000 }, { name: "OP", value: 10000 }],
  },
  4: { faturamento: 1870000, quantidade: 28477, ticket: 65.67, variacao: -2.6,
    vendedores: [{ name: "Thiers", value: 1400000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 220000 }],
    empresas: [{ name: "Lima", value: 900000 }, { name: "LPL", value: 550000 }, { name: "Rafcorte", value: 415000 }, { name: "OP", value: 5000 }],
  },
  5: { faturamento: 2050000, quantidade: 30372, ticket: 67.50, variacao: 9.6,
    vendedores: [{ name: "Thiers", value: 1420000 }, { name: "Laercio", value: 200000 }, { name: "Fabio", value: 430000 }],
    empresas: [{ name: "Lima", value: 850000 }, { name: "LPL", value: 450000 }, { name: "Rafcorte", value: 747500 }, { name: "OP", value: 2500 }],
  },
};

const faturamentoMeses = [
  { label: "Jan", value: 1510000 },
  { label: "Fev", value: 1750000 },
  { label: "Mar", value: 1920000 },
  { label: "Abr", value: 1870000 },
  { label: "Mai", value: 2050000 },
];

const tiposProduto = [
  { name: "Normal", value: 5200000 },
  { name: "Liner", value: 1800000 },
  { name: "Gardelon", value: 1400000 },
  { name: "Travados", value: 700000 },
];

const fornecedores = [
  { label: "Fornecedor A", value: 1850000 },
  { label: "Fornecedor B", value: 1420000 },
  { label: "Fornecedor C", value: 980000 },
  { label: "Fornecedor D", value: 760000 },
  { label: "Fornecedor E", value: 620000 },
  { label: "Fornecedor F", value: 480000 },
  { label: "Fornecedor G", value: 390000 },
  { label: "Fornecedor H", value: 310000 },
];

export default function ComercialPage() {
  const [mesSel, setMesSel] = useState(0);
  const dados = dadosMes[mesSel];

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
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5">
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
        <div className="bg-white border border-slate-200 p-5">
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
        <div className="bg-white border border-slate-200 p-5">
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
        <div className="bg-white border border-slate-200 p-5">
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
        <div className="bg-white border border-slate-200 p-5">
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
      <div className="bg-white border border-slate-200 p-5">
        <div className="section-title mb-1">Oportunidade de Up-sell</div>
        <div className="text-sm font-semibold text-slate-700 mb-4">
          Ticket médio por tipo de produto — Liner/Gardelon/Travados têm 3–5× maior margem que Normais
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tipo: "Normal", ticket: 32.9, color: "#94A3B8", mult: "1×" },
            { tipo: "Liner", ticket: 97.3, color: "#29ABE2", mult: "3×" },
            { tipo: "Gardelon", ticket: 116.7, color: "#1a3a5c", mult: "3,5×" },
            { tipo: "Travados", ticket: 164.2, color: "#10B981", mult: "5×" },
          ].map((t) => (
            <div
              key={t.tipo}
              className="border border-slate-200 p-4"
              style={{ borderTop: `3px solid ${t.color}` }}
            >
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.tipo}
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(t.ticket)}
              </div>
              <div className="text-xs text-slate-400 mt-1">por unidade</div>
              <div
                className="text-sm font-bold mt-2"
                style={{ color: t.color }}
              >
                {t.mult} vs Normal
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
